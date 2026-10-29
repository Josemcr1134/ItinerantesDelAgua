import { Component, computed, ElementRef, inject, input, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiError, AuthApi, requestState, toApiError, UserProfileDto } from 'data-access';
import { Button } from 'ui-kit';
import { firstValueFrom } from 'rxjs';
import { AUTH_CONFIG } from '../../auth.config';
import { AuthService } from '../../auth.service';
import { AuthLayout } from '../auth-layout/auth-layout';
import { AUTH_TEXTS, formatSeconds, formatTime } from '../auth-texts';
import { countdown } from '../countdown';
import { safeReturnUrl } from '../return-url';
import { maskEmail, VerifyEmailState } from './verify-email-state';

/**
 * Cuenta sin verificar al iniciar sesión (HU-04 → HU-03): código OTP con
 * reenvío y cuenta regresiva (como en recuperar contraseña). Al verificar,
 * la API devuelve la sesión y se entra directo. Llega desde el login con el
 * estado de la navegación; sin él (p. ej. al recargar) vuelve al login.
 */
@Component({
  selector: 'auth-verify-email-page',
  imports: [ReactiveFormsModule, RouterLink, Button, AuthLayout],
  templateUrl: './verify-email-page.html',
  styleUrl: './verify-email-page.scss',
})
export default class VerifyEmailPage {
  /** Página a la que volver tras entrar (query param). */
  readonly returnUrl = input<string>();

  private readonly auth = inject(AuthService);
  private readonly api = inject(AuthApi);
  private readonly router = inject(Router);
  protected readonly config = inject(AUTH_CONFIG);
  protected readonly texts = AUTH_TEXTS;

  private readonly state = this.router.currentNavigation()?.extras.state as
    VerifyEmailState | undefined;
  protected readonly delivery = signal(this.state?.otp ?? null);
  protected readonly resend = countdown();
  protected readonly resent = signal(false);
  protected readonly request = requestState<UserProfileDto | null>();
  private readonly resendError = signal<ApiError | null>(null);
  private readonly codeInput = viewChild<ElementRef<HTMLInputElement>>('code');

  protected readonly form = inject(NonNullableFormBuilder).group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  protected readonly codeLength = computed(() => this.delivery()?.codeLength ?? 6);
  protected readonly subtitle = computed(() => {
    const t = this.texts.verify;
    const email =
      this.delivery()?.maskedEmail ?? this.state?.maskedEmail ?? maskEmail(this.state?.email ?? '');
    return this.delivery() ? t.sent(email) : t.notSent(email);
  });

  /** Error del código o del reenvío, con los datos extra de la API. */
  protected readonly errorMessage = computed(() => {
    const error = this.request.error() ?? this.resendError();
    if (!error) {
      return null;
    }
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
    return remaining > 0
      ? this.texts.forgot.code.resendIn(formatSeconds(remaining))
      : this.texts.forgot.code.resend;
  });

  constructor() {
    if (!this.state) {
      void this.router.navigateByUrl(this.config.loginUrl, { replaceUrl: true });
      return;
    }
    const availableAt = this.state.otp?.resendAvailableAt ?? this.state.resendAvailableAt;
    if (availableAt) {
      this.resend.start(availableAt);
    }
  }

  protected invalid(): boolean {
    const control = this.form.controls.code;
    return control.invalid && control.touched;
  }

  protected async verify(): Promise<void> {
    if (this.form.invalid || !this.state) {
      this.form.markAllAsTouched();
      return;
    }
    this.resent.set(false);
    this.resendError.set(null);
    const user = await this.request.run(
      this.auth.verifyEmail({
        email: this.state.email,
        code: this.form.getRawValue().code,
        rememberMe: this.state.rememberMe ?? false,
      }),
    );
    const error = this.request.error();
    if (error) {
      this.form.controls.code.reset();
      this.codeInput()?.nativeElement.focus();
      // Código vencido: se puede pedir otro desde `resendAvailableAt`.
      const availableAt = error.metaString('resendAvailableAt');
      if (availableAt) {
        this.resend.start(availableAt);
      }
      return;
    }
    await this.router.navigateByUrl(
      user ? safeReturnUrl(this.returnUrl(), this.config.homeUrl) : this.config.loginUrl,
    );
  }

  protected async resendCode(): Promise<void> {
    if (!this.state) {
      return;
    }
    this.resendError.set(null);
    this.resent.set(false);
    try {
      const delivery = await firstValueFrom(
        this.api.resendOtp({ email: this.state.email, purpose: 'EMAIL_VERIFICATION' }),
      );
      this.delivery.set(delivery);
      this.resend.start(delivery.resendAvailableAt);
      this.request.reset();
      this.resent.set(true);
    } catch (error) {
      const apiError = toApiError(error);
      this.resendError.set(apiError);
      const availableAt = apiError.metaString('resendAvailableAt');
      if (availableAt) {
        this.resend.start(availableAt);
      }
    }
  }

  /** Deja solo dígitos en el código (pegar "123 456" funciona). */
  protected normalizeCode(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, this.codeLength());
    if (digits !== input.value) {
      this.form.controls.code.setValue(digits);
    }
  }
}
