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
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ApiError, ProfileApi, toApiError, UserProfileDto } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { AlertService } from 'ui-kit';
import { locationForm } from '../../../shared/location/location-form';
import { Avatar } from '../../../shared/avatar/avatar';
import { PROFILE_TEXTS } from '../profile-texts';

type Field =
  | 'fullName'
  | 'phoneNumber'
  | 'country'
  | 'divisionId'
  | 'divisionName'
  | 'municipalityId'
  | 'municipalityName';

/** Campo de la API (`details[].field`) → control del formulario. */
const API_FIELDS: Readonly<Record<string, Field>> = {
  fullName: 'fullName',
  phone: 'phoneNumber',
  'phone.number': 'phoneNumber',
  'phone.countryCode': 'phoneNumber',
  location: 'country',
  'location.countryCode': 'country',
  'location.divisionId': 'divisionId',
  'location.divisionName': 'divisionName',
  'location.municipalityId': 'municipalityId',
  'location.municipalityName': 'municipalityName',
};

/**
 * Datos personales (HU-14, Figma): nombre, usuario y correo (solo lectura),
 * ubicación en cascada como en el registro y teléfono. Al guardar, el resto
 * del portal (saludo, moneda de pagos nuevos) toma los datos nuevos.
 */
@Component({
  selector: 'portal-personal-data',
  imports: [ReactiveFormsModule, Avatar],
  templateUrl: './personal-data.html',
  styleUrls: ['../profile-form.scss', './personal-data.scss'],
})
export class PersonalData {
  private readonly api = inject(ProfileApi);
  private readonly alerts = inject(AlertService);
  private readonly fb = inject(NonNullableFormBuilder);

  readonly profile = input.required<UserProfileDto>();
  readonly saved = output<UserProfileDto>();

  protected readonly t = PROFILE_TEXTS.personal;
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  // El orden importa: país, estado y municipio (cada uno vacía los siguientes).
  protected readonly form = this.fb.group({
    fullName: [
      '',
      [Validators.required, Validators.maxLength(120), Validators.pattern(/^[\p{L}\s]+$/u)],
    ],
    phoneCode: ['+52', Validators.required],
    phoneNumber: [
      '',
      [Validators.required, (c: AbstractControl) => this.location?.phoneErrors(c) ?? null],
    ],
    country: ['', Validators.required],
    divisionId: [''],
    divisionName: [''],
    municipalityId: [''],
    municipalityName: [''],
  });
  private readonly controls = this.form.controls;
  protected readonly location = locationForm(this.controls);

  /** Solo cambia al abrir otro perfil (no al guardar). */
  private readonly profileId = computed(() => this.profile().id);

  constructor() {
    effect(() => {
      this.profileId();
      untracked(() => this.reset(this.profile()));
    });
  }

  protected showError(name: Field): boolean {
    const control = this.controls[name];
    return control.invalid && control.touched;
  }

  protected errorFor(name: Field): string {
    const errors = this.controls[name].errors ?? {};
    const t = PROFILE_TEXTS.errors;
    if (errors['api']) return errors['api'];
    if (errors['required']) return t.required;
    if (errors['phoneDigits']) return t.phoneDigits;
    if (errors['phoneLength'])
      return t.phoneLength(errors['phoneLength'].min, errors['phoneLength'].max);
    if (name === 'fullName') return t.fullName;
    return t.required;
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    const v = this.form.getRawValue();
    try {
      const updated = await firstValueFrom(
        this.api.update({
          fullName: v.fullName.trim().replace(/\s+/g, ' '),
          phone: { countryCode: v.phoneCode, number: v.phoneNumber.replace(/\D/g, '') },
          location: this.location.locationBody(),
        }),
      );
      this.form.markAsPristine();
      this.saved.emit(updated);
      await this.alerts.success(
        this.t.saved,
        PROFILE_TEXTS.personal.currencyNote(updated.currency),
      );
    } catch (error) {
      this.showApiError(toApiError(error));
    } finally {
      this.saving.set(false);
    }
  }

  private reset(profile: UserProfileDto): void {
    const l = profile.location;
    this.form.reset({
      fullName: profile.fullName,
      phoneCode: profile.phone.countryCode,
      phoneNumber: profile.phone.number,
      country: l.countryCode,
      divisionId: l.divisionId ?? '',
      divisionName: l.divisionId ? '' : l.divisionName,
      municipalityId: l.municipalityId ?? '',
      municipalityName: l.municipalityId ? '' : l.municipalityName,
    });
  }

  private showApiError(error: ApiError): void {
    for (const detail of error.details) {
      const field = API_FIELDS[detail.field];
      if (field) this.controls[field].setErrors({ api: detail.message });
    }
    this.form.markAllAsTouched();
    this.error.set(error.message);
  }
}
