import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { SessionStore } from 'auth';
import { ProfileApi, toApiError, UserProfileDto } from 'data-access';
import { usePageHeading } from '../../core/page-heading/page-heading';
import { MyPayments } from '../payments/my-payments/my-payments';
import { PersonalData } from './personal-data/personal-data';
import { PROFILE_TEXTS } from './profile-texts';
import { SecurityForm } from './security-form/security-form';
import { TimezoneForm } from './timezone-form/timezone-form';

type Tab = keyof typeof PROFILE_TEXTS.tabs;
const TABS = Object.keys(PROFILE_TEXTS.tabs) as Tab[];

/**
 * Mi perfil (HU-14, Figma): pestañas Datos personales, Zona horaria,
 * Seguridad y Mis pagos (`?pestana=`; Mis pagos es HU-26). Lo que se guarda actualiza la sesión
 * (saludo, zona de las fechas, moneda de pagos nuevos).
 */
@Component({
  selector: 'portal-profile-page',
  imports: [RouterLink, PersonalData, TimezoneForm, SecurityForm, MyPayments],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export default class ProfilePage {
  private readonly api = inject(ProfileApi);
  private readonly session = inject(SessionStore);

  /** `?pestana=zona|seguridad|pagos`; por defecto, datos personales. */
  readonly pestana = input<string>();
  /** Vuelta de actualizar la tarjeta en Stripe (`?cardUpdate=success|cancel`). */
  readonly cardUpdate = input<string>();

  protected readonly t = PROFILE_TEXTS;
  protected readonly tabs = TABS;
  protected readonly tab = computed<Tab>(() => {
    const value = this.pestana() as Tab | undefined;
    return value && TABS.includes(value) ? value : 'datos';
  });

  protected readonly profile = rxResource({ stream: () => this.api.me() });
  protected readonly current = computed(() =>
    this.profile.hasValue() ? this.profile.value() : undefined,
  );
  protected readonly error = computed(() => {
    const error = this.profile.error();
    return error ? toApiError(error).message : null;
  });

  constructor() {
    usePageHeading().set({ title: PROFILE_TEXTS.title });
  }

  protected onSaved(profile: UserProfileDto): void {
    this.profile.set(profile);
    this.session.setUser(profile);
  }
}
