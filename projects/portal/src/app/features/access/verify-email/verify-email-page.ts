import { afterNextRender, Component, computed, inject, Injector, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AUTH_CONFIG, AUTH_TEXTS, countdown, formatTime } from 'auth';
import { ApiError, AuthApi, OtpDeliveryDto, requestState, toApiError } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { AlertService, Button } from 'ui-kit';
import { AccessLayout } from '../access-layout/access-layout';
import { CodeInput } from '../code-input/code-input';
import { VerifyEmailState } from './verify-email-state';
import { formatClock, VERIFY_TEXTS } from './verify-email-texts';

/**
 * Verificación del correo tras el registro (HU-03, Figma "Verifica tu
 * Correo"): código de 6 dígitos en casillas, reenvío con cuenta regresiva y,
 * al confirmar, vuelta al login.
 */
@Component({
  selector: 'portal-verify-email-page',
  imports: [ReactiveFormsModule, RouterLink, Button, AccessLayout, CodeInput],
  templateUrl: './verify-email-page.html',
  styleUrls: ['../access-form.scss', './verify-email-page.scss'],
})
export default class VerifyEmailPage {
  private readonly api = inject(AuthApi);
  private readonly alerts = inject(AlertService);
  private readonly router = inject(Router);
  protected readonly config = inject(AUTH_CONFIG);
  protected readonly texts = VERIFY_TEXTS;
  protected readonly authTexts = AUTH_TEXTS;

  /** Llega del registro; sin él (p. ej. al recargar) se pide el correo. */
  private readonly state = this.router.currentNavigation()?.extras.state as
    VerifyEmailState | undefined;
  protected readonly delivery = signal<OtpDeliveryDto | null>(this.state?.otp ?? null);
  protected readonly knownEmail = this.state?.email ?? null;
  protected readonly resend = countdown();
  protected readonly resent = signal(false);
  protected readonly request = requestState<unknown>();
  /** El último código fue rechazado: casillas en rojo hasta escribir otro. */
  protected readonly rejected = signal(false);
  private readonly injector = inject(Injector);
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
    const t = this.authTexts.forgot.code;
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

  /** "00:25" mientras no se puede pedir otro código. */
  protected readonly resendClock = computed(() => formatClock(this.resend.remaining()));

  constructor() {
    const otp = this.delivery();
    if (otp) this.resend.start(otp.resendAvailableAt);
    this.form.controls.code.valueChanges.subscribe((code) => {
      if (code) this.rejected.set(false);
    });
  }

  protected showError(name: 'email' | 'code'): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
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
      this.rejected.set(true);
      afterNextRender(() => document.getElementById('verify-code')?.focus(), {
        injector: this.injector,
      });
      const availableAt = this.request.error()?.metaString('resendAvailableAt');
      if (availableAt) this.resend.start(availableAt);
      return;
    }
    const done = this.texts.done;
    await this.alerts.success(done.title, done.message, {
      confirmLabel: this.authTexts.forgot.done.confirm,
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
