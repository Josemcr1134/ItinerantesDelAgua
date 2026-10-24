import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AUTH_CONFIG, AUTH_TEXTS, countdown, formatSeconds, formatTime } from 'auth';
import { ApiError, AuthApi, OtpDeliveryDto, requestState, toApiError } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { AlertService, Button } from 'ui-kit';
import { AccessLayout } from '../access-layout/access-layout';
import { VerifyEmailState } from './verify-email-state';

/**
 * Verificación del correo tras el registro (HU-03): código de 6 dígitos,
 * reenvío con cuenta regresiva y, al confirmar, vuelta al login.
 *
 * TODO(diseño): provisional hasta tener el Figma de HU-03; usa los textos del
 * paso "código" de recuperar contraseña.
 */
@Component({
  selector: 'portal-verify-email-page',
  imports: [ReactiveFormsModule, RouterLink, Button, AccessLayout],
  templateUrl: './verify-email-page.html',
  styleUrls: ['../access-form.scss', './verify-email-page.scss'],
})
export default class VerifyEmailPage {
  private readonly api = inject(AuthApi);
  private readonly alerts = inject(AlertService);
  private readonly router = inject(Router);
  protected readonly config = inject(AUTH_CONFIG);
  protected readonly texts = AUTH_TEXTS;

  /** Llega del registro; sin él (p. ej. al recargar) se pide el correo. */
  private readonly state = this.router.currentNavigation()?.extras.state as
    VerifyEmailState | undefined;
  protected readonly delivery = signal<OtpDeliveryDto | null>(this.state?.otp ?? null);
  protected readonly knownEmail = this.state?.email ?? null;
  protected readonly resend = countdown();
  protected readonly resent = signal(false);
  protected readonly request = requestState<unknown>();
  private readonly resendError = signal<ApiError | null>(null);

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly form = this.fb.group({
    email: [this.knownEmail ?? '', [Validators.required, Validators.email]],
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  protected readonly codeLength = computed(() => this.delivery()?.codeLength ?? 6);

  protected readonly errorMessage = computed(() => {
    const error = this.request.error() ?? this.resendError();
    if (!error) return null;
    const t = this.texts.forgot.code;
    const attempts = error.metaNumber('attemptsRemaining');
    const lockedUntil = error.metaString('lockedUntil');
    const extra =
      attempts !== null
        ? t.attemptsRemaining(attempts)
        : lockedUntil
          ? t.lockedUntil(formatTime(lockedUntil))
          : '';
    return `${error.message} ${extra}`.trim();
  });

  protected readonly resendLabel = computed(() => {
    const remaining = this.resend.remaining();
    const t = this.texts.forgot.code;
    return remaining > 0 ? t.resendIn(formatSeconds(remaining)) : t.resend;
  });

  constructor() {
    const otp = this.delivery();
    if (otp) this.resend.start(otp.resendAvailableAt);
  }

  protected showError(name: 'email' | 'code'): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  /** Deja solo dígitos (pegar "123 456" funciona). */
  protected normalizeCode(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, this.codeLength());
    if (digits !== input.value) this.form.controls.code.setValue(digits);
  }

  protected async verify(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.resent.set(false);
    this.resendError.set(null);
    const { code } = this.form.getRawValue();
    const result = await this.request.run(this.api.verifyEmail({ email: this.email(), code }));
    if (!result) {
      this.form.controls.code.reset();
      const availableAt = this.request.error()?.metaString('resendAvailableAt');
      if (availableAt) this.resend.start(availableAt);
      return;
    }
    // TODO(contenido): confirmar el mensaje de cuenta verificada.
    await this.alerts.success('Correo verificado', 'Ya puedes iniciar sesión.', {
      confirmLabel: this.texts.forgot.done.confirm,
    });
    await this.router.navigateByUrl(this.config.loginUrl);
  }

  protected async resendCode(): Promise<void> {
    const email = this.form.controls.email;
    if (email.invalid) {
      email.markAsTouched();
      return;
    }
    this.resendError.set(null);
    this.resent.set(false);
    try {
      const delivery = await firstValueFrom(
        this.api.resendOtp({ email: this.email(), purpose: 'EMAIL_VERIFICATION' }),
      );
      this.delivery.set(delivery);
      this.resend.start(delivery.resendAvailableAt);
      this.request.reset();
      this.resent.set(true);
    } catch (error) {
      const apiError = toApiError(error);
      this.resendError.set(apiError);
      const availableAt = apiError.metaString('resendAvailableAt');
      if (availableAt) this.resend.start(availableAt);
    }
  }

  private email(): string {
    return this.form.getRawValue().email.trim().toLowerCase();
  }
}
