import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
  untracked,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
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
  CatalogsApi,
  RegisterRequestDto,
  RegisterResponseDto,
  requestState,
  TimezoneDto,
} from 'data-access';
import { catchError, map, of } from 'rxjs';
import { Button } from 'ui-kit';
import { AccessLayout } from '../access-layout/access-layout';
import { returnParams } from '../return-url';
import { VerifyEmailState } from '../verify-email/verify-email-state';
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

/** Cómo se captura un nivel de la ubicación. */
type LevelMode = 'list' | 'text' | 'waiting';

const DEFAULT_COUNTRY = 'MX';
const FALLBACK_TIMEZONE = 'America/Mexico_City';

/** Zona horaria del navegador (o la oficial si no se puede detectar). */
function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK_TIMEZONE;
  } catch {
    return FALLBACK_TIMEZONE;
  }
}

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
  private readonly catalogs = inject(CatalogsApi);
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
    phoneNumber: ['', [Validators.required, (c: AbstractControl) => this.phoneErrors(c)]],
    country: [DEFAULT_COUNTRY, Validators.required],
    divisionId: [''],
    divisionName: [''],
    municipalityId: [''],
    municipalityName: [''],
    timezone: [this.detectedTimezone, Validators.required],
    password: ['', [Validators.required, passwordRules]],
  });

  private readonly controls = this.form.controls;
  private readonly countryCode = toSignal(this.controls.country.valueChanges, {
    initialValue: DEFAULT_COUNTRY,
  });
  private readonly divisionId = toSignal(this.controls.divisionId.valueChanges, {
    initialValue: '',
  });
  private readonly phoneCode = toSignal(this.controls.phoneCode.valueChanges, {
    initialValue: '+52',
  });

  // --- Catálogos (en cascada) ---------------------------------------------
  protected readonly countries = rxResource({
    stream: () => this.catalogs.countries().pipe(map((r) => r.data)),
    defaultValue: [],
  });
  protected readonly country = computed(() =>
    this.countries.value().find((c) => c.code === this.countryCode()),
  );
  protected readonly divisions = rxResource({
    params: () => (this.country()?.hasDivisions ? this.countryCode() : undefined),
    stream: ({ params }) => this.catalogs.divisions(params).pipe(map((r) => r.data)),
    defaultValue: [],
  });
  /** Estado: de la lista, escrito a mano (país sin catálogo) o esperando la lista. */
  protected readonly divisionMode = computed<LevelMode>(() => {
    if (this.divisions.value().length) return 'list';
    const loading = this.countries.isLoading() || this.divisions.isLoading();
    return loading ? 'waiting' : 'text';
  });
  protected readonly division = computed(() =>
    this.divisions.value().find((d) => d.id === this.divisionId()),
  );
  protected readonly municipalities = rxResource({
    params: () => (this.division()?.hasMunicipalities ? this.divisionId() : undefined),
    stream: ({ params }) => this.catalogs.municipalities(params).pipe(map((r) => r.data)),
    defaultValue: [],
  });
  /** Municipio: igual que el estado; espera a que se elija un estado de la lista. */
  protected readonly municipalityMode = computed<LevelMode>(() => {
    if (this.municipalities.value().length) return 'list';
    if (this.divisionMode() === 'text') return 'text';
    const division = this.division();
    return !division || this.municipalities.isLoading() ? 'waiting' : 'text';
  });
  private readonly timezoneCatalog = rxResource({
    stream: () => this.catalogs.timezones().pipe(map((r) => r.zones)),
    defaultValue: [],
  });

  /** Indicativos únicos, en el orden de los países (México y Centroamérica primero). */
  protected readonly phoneCodes = computed(() => [
    ...new Set(this.countries.value().map((c) => c.phoneCode)),
  ]);
  /** Longitud válida del número para el indicativo elegido. */
  private readonly phoneRange = computed(() => {
    const matches = this.countries.value().filter((c) => c.phoneCode === this.phoneCode());
    return matches.length
      ? {
          min: Math.min(...matches.map((c) => c.phoneMinLength)),
          max: Math.max(...matches.map((c) => c.phoneMaxLength)),
        }
      : null;
  });
  /** Zonas sugeridas; la detectada se agrega si no está en la lista. */
  protected readonly timezones = computed<readonly TimezoneDto[]>(() => {
    const zones = this.timezoneCatalog.value();
    const detected = this.detectedTimezone;
    return zones.length && !zones.some((z) => z.id === detected)
      ? [
          {
            id: detected,
            label: detected,
            countryCode: null,
            utcOffset: '',
            offsetMinutes: 0,
          },
          ...zones,
        ]
      : zones;
  });
  protected readonly catalogFailed = computed(
    () => !!this.countries.error() || !!this.divisions.error() || !!this.municipalities.error(),
  );

  protected readonly errorMessage = computed(() => this.request.error()?.message ?? null);

  constructor() {
    const c = this.controls;
    // Al cambiar de país: estado y municipio de nuevo; indicativo del país si no se tocó.
    c.country.valueChanges.subscribe(() => {
      c.divisionId.reset();
      c.divisionName.reset();
      c.municipalityId.reset();
      c.municipalityName.reset();
    });
    c.divisionId.valueChanges.subscribe(() => {
      c.municipalityId.reset();
      c.municipalityName.reset();
    });
    c.phoneCode.valueChanges.subscribe(() => c.phoneNumber.updateValueAndValidity());

    effect(() => {
      const country = this.country();
      untracked(() => {
        if (country && !c.phoneCode.dirty) c.phoneCode.setValue(country.phoneCode);
        c.phoneNumber.updateValueAndValidity();
      });
    });
    // Estado y municipio son obligatorios: de la lista o escritos a mano.
    effect(() => {
      const division = this.divisionMode();
      const municipality = this.municipalityMode();
      untracked(() => {
        setRequired(c.divisionId, division !== 'text');
        setRequired(c.divisionName, division === 'text');
        setRequired(c.municipalityId, municipality !== 'text');
        setRequired(c.municipalityName, municipality === 'text');
      });
    });
  }

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
      location: {
        countryCode: v.country,
        ...(this.divisionMode() === 'text'
          ? { divisionName: text(v.divisionName) }
          : { divisionId: v.divisionId }),
        ...(this.municipalityMode() === 'text'
          ? { municipalityName: text(v.municipalityName) }
          : { municipalityId: v.municipalityId }),
      },
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

  private phoneErrors(control: AbstractControl): ValidationErrors | null {
    const digits = String(control.value).replace(/[\s-]/g, '');
    if (!digits) return null;
    if (!/^\d+$/.test(digits)) return { phoneDigits: true };
    const range = this.phoneRange();
    return range && (digits.length < range.min || digits.length > range.max)
      ? { phoneLength: range }
      : null;
  }

  /** Lleva el foco al primer campo con error (tras pintar los mensajes). */
  private focusFirstInvalid(): void {
    afterNextRender(
      () => this.host.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
      { injector: this.injector },
    );
  }
}

/** Obligatorio o no, según el nivel tenga lista o se escriba. */
function setRequired(control: AbstractControl, required: boolean): void {
  control.setValidators(required ? Validators.required : null);
  control.updateValueAndValidity({ emitEvent: false });
}
