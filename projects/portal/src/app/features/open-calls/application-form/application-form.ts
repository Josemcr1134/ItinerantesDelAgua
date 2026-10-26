import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  ApiError,
  ApplicationDetailDto,
  ApplicationsApi,
  toApiError,
  UpdateApplicationRequestDto,
} from 'data-access';
import { firstValueFrom } from 'rxjs';
import { AlertService } from 'ui-kit';
import { ApplicationEvidence } from '../../../shared/applications/application-evidence/application-evidence';
import { ApplicationSteps } from '../application-steps/application-steps';
import { timeIn } from '../../calendar/calendar-time';

type Field =
  | 'eligibilityConfirmed'
  | 'organization'
  | 'organizationRole'
  | 'experience'
  | 'motivation'
  | 'canTravel'
  | 'termsAccepted'
  | 'evidenceLinks'
  | 'documents';

/**
 * Formulario de una convocatoria (HU-20, Figma): elegibilidad, datos del
 * perfil, organización, experiencia y motivación (con su mínimo), viaje,
 * términos y evidencias (archivos y enlaces). Guarda el borrador y lo envía;
 * los pendientes que reporta la API se muestran en su campo.
 */
@Component({
  selector: 'portal-application-form',
  imports: [ReactiveFormsModule, ApplicationSteps, ApplicationEvidence],
  templateUrl: './application-form.html',
  styleUrl: './application-form.scss',
})
export class ApplicationForm {
  private readonly api = inject(ApplicationsApi);
  private readonly alerts = inject(AlertService);

  readonly application = input.required<ApplicationDetailDto>();
  readonly timezone = input.required<string>();
  /** La postulación cambió (guardada, enviada, con archivos nuevos o descartada = `null`). */
  readonly changed = output<ApplicationDetailDto | null>();

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly form = this.fb.group({
    eligibilityConfirmed: [false],
    organization: [''],
    organizationRole: [''],
    experience: [''],
    motivation: [''],
    canTravel: this.fb.control<boolean | null>(null),
    termsAccepted: [false],
  });
  protected readonly links = signal<readonly string[]>([]);

  protected readonly saving = signal(false);
  protected readonly uploading = signal(false);
  /** Pendientes o errores por campo (del último guardado o envío). */
  protected readonly issues = signal<Partial<Record<Field, string>>>({});
  protected readonly error = signal<string | null>(null);

  protected readonly limits = computed(() => this.application().form.limits);
  protected readonly eligibility = computed(() => this.application().form.eligibility);
  protected readonly savedAt = computed(() =>
    timeIn(this.application().updatedAt, this.timezone()),
  );
  protected readonly experienceLength = signal(0);
  protected readonly motivationLength = signal(0);

  /** Solo cambia al abrir otra postulación (no al guardar ni al subir archivos). */
  private readonly applicationId = computed(() => this.application().id);

  constructor() {
    // Al abrir otra postulación, el formulario toma sus respuestas guardadas;
    // al guardar o subir archivos se conserva lo que se está escribiendo.
    effect(() => {
      const id = this.applicationId();
      untracked(() => this.reset(id));
    });
    this.form.controls.experience.valueChanges.subscribe((v) =>
      this.experienceLength.set(v.length),
    );
    this.form.controls.motivation.valueChanges.subscribe((v) =>
      this.motivationLength.set(v.length),
    );
  }

  protected issue(field: Field): string | null {
    return this.issues()[field] ?? null;
  }

  protected async save(): Promise<ApplicationDetailDto | null> {
    this.saving.set(true);
    this.error.set(null);
    try {
      const saved = await firstValueFrom(this.api.update(this.application().id, this.body()));
      this.issues.set({});
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
      'Se borran tus respuestas y archivos. Podrás volver a postular mientras la convocatoria siga abierta.',
      { confirmLabel: 'Descartar', variant: 'warning' },
    );
    if (!confirmed) return;
    try {
      await firstValueFrom(this.api.remove(this.application().id));
      this.changed.emit(null);
    } catch (error) {
      this.showError(toApiError(error));
    }
  }

  // --- Internos -----------------------------------------------------------------

  private reset(_id: string): void {
    const a = this.application().answers;
    this.form.reset({
      eligibilityConfirmed: a.eligibilityConfirmed,
      organization: a.organization ?? '',
      organizationRole: a.organizationRole ?? '',
      experience: a.experience ?? '',
      motivation: a.motivation ?? '',
      canTravel: a.canTravel,
      termsAccepted: a.termsAccepted,
    });
    this.links.set(a.evidenceLinks);
    this.issues.set({});
    this.error.set(null);
    if (!this.application().editable) this.form.disable();
    else this.form.enable();
  }

  private body(): UpdateApplicationRequestDto {
    const v = this.form.getRawValue();
    const text = (value: string) => value.trim() || null;
    return {
      eligibilityConfirmed: v.eligibilityConfirmed,
      organization: text(v.organization),
      organizationRole: text(v.organizationRole),
      experience: text(v.experience),
      motivation: text(v.motivation),
      ...(this.eligibility()?.requiresTravel ? { canTravel: v.canTravel } : {}),
      termsAccepted: v.termsAccepted,
      evidenceLinks: [...this.links()],
    };
  }

  protected showError(error: ApiError): void {
    const issues: Partial<Record<Field, string>> = {};
    for (const detail of error.details) {
      const field = detail.field.split('.')[0] as Field;
      issues[field] ??= detail.message;
    }
    this.issues.set(issues);
    const reasons = error.meta['reasons'];
    this.error.set(
      error.code === 'APPLICATION_NOT_ELIGIBLE' &&
        Array.isArray(reasons) &&
        reasons.includes('TRAVEL_REQUIRED')
        ? 'Debes poder asistir de forma presencial a las fechas completas.'
        : error.message,
    );
  }
}
