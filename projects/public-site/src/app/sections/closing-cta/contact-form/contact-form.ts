import {
  afterNextRender,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import {
  CONTACT_PROJECT_TYPE_VALUES,
  CONTACT_SERVICE_VALUES,
  CONTACT_SUBJECT_VALUES,
  ContactApi,
  ContactMessageResponseDto,
  ContactProjectType,
  ContactService,
  ContactSubject,
  CreateContactMessageRequestDto,
  requestState,
} from 'data-access';
import { Button } from 'ui-kit';
import { map } from 'rxjs';
import { ContactFormContent } from './contact-form-content';

/** Reglas de la API (CreateContactMessageRequestDto). */
export const CONTACT_RULES = { nameMin: 3, messageMin: 10, messageMax: 2000 } as const;

/** Longitud sin espacios al inicio ni al final. */
function trimmedLength(min: number, max = Infinity): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const length = String(control.value ?? '').trim().length;
    return length && (length < min || length > max) ? { length: { min, max } } : null;
  };
}

/** Campo de la API (`details[].field`) → control del formulario. */
const API_FIELDS: Readonly<Record<string, ControlName>> = {
  name: 'name',
  email: 'email',
  subject: 'subject',
  projectType: 'projectType',
  projectLocation: 'projectLocation',
  service: 'service',
  message: 'message',
  privacyAccepted: 'privacyAccepted',
};

type ControlName =
  | 'name'
  | 'email'
  | 'subject'
  | 'projectType'
  | 'projectLocation'
  | 'service'
  | 'message'
  | 'privacyAccepted'
  | 'website';

/**
 * Formulario de contacto de la landing (HU-01 / HU-38): envía a
 * `POST /contact-messages` con `origin: LANDING`. Con el asunto "Diseño y
 * consultoría" pide además tipo de proyecto, ubicación y servicio.
 *
 * Accesibilidad: cada error se asocia a su campo (aria-describedby), al enviar
 * con errores el foco va al primero, y el resultado se anuncia.
 */
@Component({
  selector: 'pub-contact-form',
  imports: [ReactiveFormsModule, Button],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
})
export class ContactForm {
  readonly content = input.required<ContactFormContent>();
  readonly back = output<void>();

  private readonly contactApi = inject(ContactApi);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly rules = CONTACT_RULES;
  protected readonly subjects = CONTACT_SUBJECT_VALUES;
  protected readonly projectTypes = CONTACT_PROJECT_TYPE_VALUES;
  protected readonly services = CONTACT_SERVICE_VALUES;
  protected readonly request = requestState<ContactMessageResponseDto>();
  protected readonly submitted = signal(false);
  protected readonly sent = signal(false);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, trimmedLength(CONTACT_RULES.nameMin)]],
    email: ['', [Validators.required, Validators.email]],
    subject: this.fb.control<ContactSubject | ''>('', Validators.required),
    projectType: this.fb.control<ContactProjectType | ''>(''),
    projectLocation: [''],
    service: this.fb.control<ContactService | ''>(''),
    message: [
      '',
      [Validators.required, trimmedLength(CONTACT_RULES.messageMin, CONTACT_RULES.messageMax)],
    ],
    privacyAccepted: [false, Validators.requiredTrue],
    /** Honeypot: oculto; si un bot lo llena, la API descarta el mensaje. */
    website: [''],
  });

  protected readonly isDesignConsulting = toSignal(
    this.form.controls.subject.valueChanges.pipe(map((s) => s === 'DESIGN_CONSULTING')),
    { initialValue: false },
  );
  protected readonly messageLength = toSignal(
    this.form.controls.message.valueChanges.pipe(map((m) => m.length)),
    { initialValue: 0 },
  );

  /** Mensaje general: éxito o error de la API (los de campo van en su campo). */
  protected readonly errorMessage = computed(() => {
    const error = this.request.error();
    if (!error) {
      return null;
    }
    return error.code === 'VALIDATION_ERROR' && error.details.length
      ? this.content().errors.reviewFields
      : error.message || this.content().failureMessage;
  });

  constructor() {
    // Los campos del proyecto solo son obligatorios con "Diseño y consultoría".
    this.form.controls.subject.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((subject) => {
        const { projectType, projectLocation, service } = this.form.controls;
        for (const control of [projectType, projectLocation, service]) {
          if (subject === 'DESIGN_CONSULTING') {
            control.addValidators(Validators.required);
          } else {
            control.removeValidators(Validators.required);
            control.reset();
          }
          control.updateValueAndValidity({ emitEvent: false });
        }
      });

    // Al aparecer, el foco va al primer campo.
    afterNextRender(() => this.focus('#contact-name'));
  }

  protected showError(name: ControlName): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  /** Texto del error de un campo (el de la API tiene prioridad). */
  protected errorText(name: ControlName): string {
    const errors = this.form.controls[name].errors ?? {};
    const t = this.content().errors;
    if (typeof errors['server'] === 'string') return errors['server'];
    if (errors['required']) {
      return name === 'privacyAccepted' ? t.privacyRequired : t.required;
    }
    if (errors['email']) return t.emailInvalid;
    if (errors['length']) {
      return name === 'name'
        ? t.nameMinLength(CONTACT_RULES.nameMin)
        : t.messageLength(CONTACT_RULES.messageMin, CONTACT_RULES.messageMax);
    }
    return t.required;
  }

  /** ids de ayuda y error asociados a un campo. */
  protected describedBy(name: ControlName, ...extra: string[]): string | null {
    const ids = extra.filter(Boolean);
    if (this.showError(name)) ids.push(`contact-${name}-error`);
    return ids.length ? ids.join(' ') : null;
  }

  protected async submit(): Promise<void> {
    this.submitted.set(true);
    this.sent.set(false);
    this.request.reset();
    const body = this.payload();
    if (this.form.invalid || !body) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }
    const result = await this.request.run(this.contactApi.send(body));
    if (result) {
      this.sent.set(true);
      this.submitted.set(false);
      this.form.reset();
      return;
    }
    this.applyServerErrors();
  }

  private payload(): CreateContactMessageRequestDto | null {
    const v = this.form.getRawValue();
    if (!v.subject) {
      return null;
    }
    const design = v.subject === 'DESIGN_CONSULTING';
    if (design && (!v.projectType || !v.service)) {
      return null;
    }
    return {
      name: v.name.trim(),
      email: v.email.trim(),
      subject: v.subject,
      message: v.message.trim(),
      privacyAccepted: v.privacyAccepted,
      origin: 'LANDING',
      ...(design &&
        v.projectType &&
        v.service && {
          projectType: v.projectType,
          projectLocation: v.projectLocation.trim(),
          service: v.service,
        }),
      ...(v.website && { website: v.website }),
    };
  }

  /** Lleva los errores por campo de la API a cada control. */
  private applyServerErrors(): void {
    const details = this.request.error()?.details ?? [];
    for (const detail of details) {
      const name = API_FIELDS[detail.field];
      if (name) {
        const control = this.form.controls[name];
        control.setErrors({ ...control.errors, server: detail.message });
        control.markAsTouched();
      }
    }
    if (details.length) {
      this.focusFirstInvalid();
    }
  }

  private focusFirstInvalid(): void {
    // Tras pintar los errores (aria-invalid) se enfoca el primero.
    setTimeout(() => this.focus('[aria-invalid="true"]'));
  }

  private focus(selector: string): void {
    this.host.nativeElement.querySelector<HTMLElement>(selector)?.focus();
  }
}
