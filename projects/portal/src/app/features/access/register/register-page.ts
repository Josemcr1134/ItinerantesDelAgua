import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AUTH_TEXTS, passwordRules, PasswordToggle } from 'auth';
import {
  ApiError,
  AuthApi,
  RegisterRequestDto,
  RegisterResponseDto,
  requestState,
} from 'data-access';
import { catchError, map, of } from 'rxjs';
import { Button } from 'ui-kit';
import { AccessLayout } from '../access-layout/access-layout';
import { returnParams } from '../return-url';
import { VerifyEmailState } from '../verify-email/verify-email-state';
import {
  detectTimezone,
  locationForm,
  timezoneOptions,
} from '../../../shared/location/location-form';
import { REGISTER_TEXTS } from './register-texts';

type Field =
  | 'fullName'
  | 'username'
  | 'email'
  | 'phoneNumber'
  | 'country'
  | 'divisionId'
  | 'divisionName'
  | 'municipalityId'
  | 'municipalityName'
  | 'timezone'
  | 'password';

/** Campo de la API (`details[].field`) → control del formulario. */
const API_FIELDS: Readonly<Record<string, Field>> = {
  fullName: 'fullName',
  username: 'username',
  email: 'email',
  password: 'password',
  phone: 'phoneNumber',
  'phone.number': 'phoneNumber',
  'phone.countryCode': 'phoneNumber',
  location: 'country',
  'location.countryCode': 'country',
  'location.divisionId': 'divisionId',
  'location.divisionName': 'divisionName',
  'location.municipalityId': 'municipalityId',
  'location.municipalityName': 'municipalityName',
  timezone: 'timezone',
};

const DEFAULT_COUNTRY = 'MX';

/**
 * Registro de participantes (HU-02, Figma "Crear cuenta en el Portal").
 * Ubicación en cascada (país → estado → municipio) con los catálogos de la
 * API; cuando un nivel no tiene lista, se escribe a mano. Al crear la cuenta
 * pasa a verificar el correo con el código enviado (HU-03).
 */
@Component({
  selector: 'portal-register-page',
  imports: [ReactiveFormsModule, RouterLink, Button, PasswordToggle, AccessLayout],
  templateUrl: './register-page.html',
  styleUrls: ['../access-form.scss', './register-page.scss'],
})
export default class RegisterPage {
  /** Destino tras registrarse, verificar el correo e iniciar sesión (`?returnUrl=`). */
  readonly returnUrl = input<string>();
  protected readonly back = computed(() => returnParams(this.returnUrl()));

  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  protected readonly texts = REGISTER_TEXTS;
  protected readonly authTexts = AUTH_TEXTS;
  protected readonly request = requestState<RegisterResponseDto>();
  protected readonly showPassword = signal(false);
  private readonly detectedTimezone = detectTimezone();

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly form = this.fb.group({
    fullName: [
      '',
      [Validators.required, Validators.maxLength(120), Validators.pattern(/^[\p{L}\s]+$/u)],
    ],
    username: this.fb.control('', {
      validators: [Validators.required, Validators.pattern(/^[A-Za-z0-9._]{3,30}$/)],
      asyncValidators: [this.available('username')],
      updateOn: 'blur',
    }),
    email: this.fb.control('', {
      validators: [Validators.required, Validators.email],
      asyncValidators: [this.available('email')],
      updateOn: 'blur',
    }),
    phoneCode: ['+52', Validators.required],
    phoneNumber: [
      '',
      [Validators.required, (c: AbstractControl) => this.location?.phoneErrors(c) ?? null],
    ],
    country: [DEFAULT_COUNTRY, Validators.required],
    divisionId: [''],
    divisionName: [''],
    municipalityId: [''],
    municipalityName: [''],
    timezone: [this.detectedTimezone, Validators.required],
    password: ['', [Validators.required, passwordRules]],
  });

  private readonly controls = this.form.controls;

  // --- Ubicación y teléfono (catálogos en cascada, compartido con el perfil) ---
  private readonly location = locationForm(this.controls);
  protected readonly countries = this.location.countries;
  protected readonly country = this.location.country;
  protected readonly divisions = this.location.divisions;
  protected readonly divisionMode = this.location.divisionMode;
  protected readonly division = this.location.division;
  protected readonly municipalities = this.location.municipalities;
  protected readonly municipalityMode = this.location.municipalityMode;
  protected readonly phoneCodes = this.location.phoneCodes;
  protected readonly catalogFailed = this.location.catalogFailed;
  /** Zonas sugeridas; la detectada se agrega si no está en la lista. */
  protected readonly timezones = timezoneOptions(() => this.detectedTimezone);

  protected readonly errorMessage = computed(() => this.request.error()?.message ?? null);

  protected showError(name: Field): boolean {
    const control = this.controls[name];
    return control.invalid && control.touched;
  }

  /** Primer mensaje de error del campo. */
  protected errorFor(name: Field): string {
    const errors = this.controls[name].errors ?? {};
    const t = this.texts.errors;
    if (errors['api']) return errors['api'];
    if (errors['required']) return t.required;
    if (errors['taken']) return name === 'email' ? t.emailTaken : t.usernameTaken;
    if (errors['email']) return t.email;
    if (errors['phoneDigits']) return t.phoneDigits;
    if (errors['phoneLength'])
      return t.phoneLength(errors['phoneLength'].min, errors['phoneLength'].max);
    if (name === 'fullName') return t.fullName;
    if (name === 'username') return t.username;
    if (name === 'password') return t.passwordRules;
    return t.required;
  }

  protected async submit(): Promise<void> {
    if (this.form.pending) {
      // Falta la validación en línea del correo o el usuario: se espera.
      await new Promise<void>((resolve) => {
        const sub = this.form.statusChanges.subscribe((status) => {
          if (status !== 'PENDING') {
            sub.unsubscribe();
            resolve();
          }
        });
      });
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      return;
    }
    const response = await this.request.run(this.authApi.register(this.body()));
    if (response) {
      const state: VerifyEmailState = { email: response.email, otp: response.otp };
      await this.router.navigate(['/verificar-correo'], { state, queryParams: this.back() });
      return;
    }
    const error = this.request.error();
    if (error) this.applyApiErrors(error);
  }

  private body(): RegisterRequestDto {
    const v = this.form.getRawValue();
    const text = (value: string) => value.trim().replace(/\s+/g, ' ');
    return {
      fullName: text(v.fullName),
      username: v.username.trim().toLowerCase(),
      email: v.email.trim().toLowerCase(),
      password: v.password,
      phone: { countryCode: v.phoneCode, number: v.phoneNumber.replace(/\D/g, '') },
      location: this.location.locationBody(),
      timezone: v.timezone,
    };
  }

  /** Lleva los errores de la API a sus campos (correo o usuario ya registrados, validación). */
  private applyApiErrors(error: ApiError): void {
    const c = this.controls;
    if (error.code === 'AUTH_EMAIL_ALREADY_REGISTERED') c.email.setErrors({ taken: true });
    if (error.code === 'AUTH_USERNAME_TAKEN') c.username.setErrors({ taken: true });
    for (const detail of error.details) {
      const field = API_FIELDS[detail.field];
      if (field) c[field].setErrors({ api: detail.message });
    }
    this.form.markAllAsTouched();
    this.focusFirstInvalid();
  }

  /** Correo o usuario ya registrado (validación en línea al salir del campo). */
  private available(field: 'email' | 'username'): AsyncValidatorFn {
    return (control) => {
      const value = String(control.value).trim().toLowerCase();
      if (!value) return of(null);
      return this.authApi.availability({ [field]: value }).pipe(
        map((r): ValidationErrors | null =>
          r[field]?.valid && !r[field]?.available ? { taken: true } : null,
        ),
        // Si la consulta falla, decide la API al enviar.
        catchError(() => of(null)),
      );
    };
  }

  /** Lleva el foco al primer campo con error (tras pintar los mensajes). */
  private focusFirstInvalid(): void {
    afterNextRender(
      () => this.host.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      { injector: this.injector },
    );
  }
}
