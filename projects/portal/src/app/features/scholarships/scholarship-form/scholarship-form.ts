import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  ApiError,
  ApplicationDetailDto,
  ApplicationsApi,
  CatalogsApi,
  OfferScheduleDto,
  toApiError,
  UpdateApplicationRequestDto,
} from 'data-access';
import {
  catchError,
  EMPTY,
  filter,
  firstValueFrom,
  map,
  of,
  Subject,
  switchMap,
  timer,
} from 'rxjs';
import { AlertService } from 'ui-kit';
import { ApplicationEvidence } from '../../../shared/applications/application-evidence/application-evidence';
import { percentLabel } from '../../../shared/applications/application-format';
import { timeIn } from '../../calendar/calendar-time';
import { OfferSummary } from '../offer-summary/offer-summary';

type Field =
  | 'phone'
  | 'age'
  | 'requestedScholarshipTypeId'
  | 'intentLetter'
  | 'termsAccepted'
  | 'evidenceLinks'
  | 'documents';

/** Pausa tras la última edición antes de guardar el borrador solo. */
export const AUTOSAVE_DELAY_MS = 1500;

/**
 * Postulación a beca (Figma): datos de contacto precargados del perfil, nivel
 * de beca, carta de intención y evidencia territorial; a la derecha, el
 * resumen de la oferta con lo que pagaría. El borrador se guarda solo al
 * dejar de escribir; los pendientes que reporta la API se muestran en su campo.
 */
@Component({
  selector: 'portal-scholarship-form',
  imports: [ReactiveFormsModule, ApplicationEvidence, OfferSummary],
  templateUrl: './scholarship-form.html',
  styleUrls: [
    './scholarship-form.scss',
    './scholarship-levels.scss',
    '../../../shared/applications/application-fields.scss',
  ],
})
export class ScholarshipForm {
  private readonly api = inject(ApplicationsApi);
  private readonly catalogs = inject(CatalogsApi);
  private readonly alerts = inject(AlertService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly application = input.required<ApplicationDetailDto>();
  readonly schedule = input<OfferScheduleDto | null>(null);
  readonly timezone = input.required<string>();
  /** La postulación cambió (guardada, enviada, con archivos nuevos o descartada = `null`). */
  readonly changed = output<ApplicationDetailDto | null>();

  protected readonly form = this.fb.group({
    phoneCode: [''],
    phoneNumber: [''],
    age: this.fb.control<number | null>(null),
    requestedScholarshipTypeId: this.fb.control<string | null>(null),
    intentLetter: [''],
    termsAccepted: [false],
  });
  protected readonly links = signal<readonly string[]>([]);
  protected readonly uploading = signal(false);
  protected readonly saving = signal(false);
  protected readonly autosave = signal<'idle' | 'saving' | 'error'>('idle');
  /** Pendientes o errores por campo (del último guardado o envío). */
  protected readonly issues = signal<Partial<Record<Field, string>>>({});
  protected readonly error = signal<string | null>(null);
  protected readonly letterLength = signal(0);
  protected readonly selectedType = signal<string | null>(null);

  protected readonly limits = computed(() => this.application().form.limits);
  protected readonly types = computed(() => this.application().form.scholarshipTypes);
  protected readonly interviewTypes = computed(() =>
    this.types().filter((t) => t.scholarshipType.requiresInterview),
  );
  protected readonly percent = percentLabel;
  protected readonly savedAt = computed(() =>
    timeIn(this.application().updatedAt, this.timezone()),
  );

  private readonly countries = rxResource({
    stream: () => this.catalogs.countries().pipe(map((r) => r.data)),
    defaultValue: [],
  });
  protected readonly phoneCodes = computed(() => {
    const codes = new Set(this.countries.value().map((c) => c.phoneCode));
    codes.add(this.application().applicant.phone.countryCode);
    return [...codes].filter(Boolean).sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)));
  });

  /** Solo cambia al abrir otra postulación (no al guardar ni al subir archivos). */
  private readonly applicationId = computed(() => this.application().id);
  /** Ediciones ('edit') o guardado manual ('cancel', anula el autoguardado pendiente). */
  private readonly edits = new Subject<'edit' | 'cancel'>();

  constructor() {
    // Al abrir otra postulación, el formulario toma sus respuestas guardadas;
    // al guardar o subir archivos se conserva lo que se está escribiendo.
    effect(() => {
      const id = this.applicationId();
      untracked(() => this.reset(id));
    });
    const destroyRef = inject(DestroyRef);
    this.form.controls.intentLetter.valueChanges
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((v) => this.letterLength.set(v.length));
    this.form.controls.requestedScholarshipTypeId.valueChanges
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((v) => this.selectedType.set(v));
    this.form.valueChanges
      .pipe(
        filter(() => this.form.dirty),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe(() => this.edited());

    // Autoguardado: tras una pausa sin editar; un guardado manual lo anula.
    this.edits
      .pipe(
        switchMap((kind) =>
          kind === 'cancel'
            ? EMPTY
            : timer(AUTOSAVE_DELAY_MS).pipe(
                filter(() => this.application().editable && !this.saving()),
                switchMap(() => {
                  this.autosave.set('saving');
                  return this.api
                    .update(this.application().id, this.body(), { silent: true })
                    .pipe(catchError(() => of(null)));
                }),
              ),
        ),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe((saved) => {
        this.autosave.set(saved ? 'idle' : 'error');
        if (saved) this.changed.emit(saved);
      });
  }

  protected issue(field: Field): string | null {
    return this.issues()[field] ?? null;
  }

  protected edited(): void {
    this.edits.next('edit');
  }

  protected setLinks(links: readonly string[]): void {
    this.links.set(links);
    this.edited();
  }

  protected async save(): Promise<ApplicationDetailDto | null> {
    this.edits.next('cancel');
    this.saving.set(true);
    this.error.set(null);
    try {
      const saved = await firstValueFrom(this.api.update(this.application().id, this.body()));
      this.issues.set({});
      this.autosave.set('idle');
      this.changed.emit(saved);
      return saved;
    } catch (error) {
      this.showError(toApiError(error));
      return null;
    } finally {
      this.saving.set(false);
    }
  }

  protected async submit(): Promise<void> {
    const saved = await this.save();
    if (!saved) return;
    this.saving.set(true);
    try {
      const sent = await firstValueFrom(this.api.submit(saved.id));
      this.changed.emit(sent);
      // TODO(contenido): confirmar el aviso de postulación enviada.
      await this.alerts.success(
        'Postulación enviada',
        `Tu folio es ${sent.folio}. Te avisaremos por correo cuando el equipo la revise.`,
      );
    } catch (error) {
      this.showError(toApiError(error));
    } finally {
      this.saving.set(false);
    }
  }

  protected async discard(): Promise<void> {
    const confirmed = await this.alerts.confirm(
      '¿Descartar el borrador?',
      'Se borran tus respuestas y archivos. Podrás volver a postular mientras la convocatoria de becas siga abierta.',
      { confirmLabel: 'Descartar', variant: 'warning' },
    );
    if (!confirmed) return;
    this.edits.next('cancel');
    try {
      await firstValueFrom(this.api.remove(this.application().id));
      this.changed.emit(null);
    } catch (error) {
      this.showError(toApiError(error));
    }
  }

  protected showError(error: ApiError): void {
    const issues: Partial<Record<Field, string>> = {};
    for (const detail of error.details) {
      const field = detail.field.split('.')[0] as Field;
      issues[field] ??= detail.message;
    }
    this.issues.set(issues);
    this.error.set(error.message);
  }

  // --- Internos -----------------------------------------------------------------

  private reset(_id: string): void {
    const { answers, applicant } = this.application();
    this.form.reset({
      phoneCode: applicant.phone.countryCode,
      phoneNumber: applicant.phone.number,
      age: answers.age,
      requestedScholarshipTypeId: answers.requestedScholarshipTypeId,
      intentLetter: answers.intentLetter ?? '',
      termsAccepted: answers.termsAccepted,
    });
    this.letterLength.set(answers.intentLetter?.length ?? 0);
    this.selectedType.set(answers.requestedScholarshipTypeId);
    this.links.set(answers.evidenceLinks);
    this.issues.set({});
    this.error.set(null);
    if (!this.application().editable) this.form.disable({ emitEvent: false });
    else this.form.enable({ emitEvent: false });
  }

  private body(): UpdateApplicationRequestDto {
    const v = this.form.getRawValue();
    const number = v.phoneNumber.replace(/\D/g, '');
    return {
      ...(number ? { phone: { countryCode: v.phoneCode, number } } : {}),
      age: v.age,
      requestedScholarshipTypeId: v.requestedScholarshipTypeId,
      intentLetter: v.intentLetter.trim() || null,
      termsAccepted: v.termsAccepted,
      evidenceLinks: [...this.links()],
    };
  }
}
