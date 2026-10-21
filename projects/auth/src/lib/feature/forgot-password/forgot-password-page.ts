import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiError, AuthApi, OtpDeliveryDto, requestState, toApiError } from 'data-access';
import { AlertService, Button } from 'ui-kit';
import { firstValueFrom } from 'rxjs';
import { AUTH_CONFIG } from '../../auth.config';
import { matchingFields, passwordRules } from '../../validators/password.validators';
import { AuthLayout } from '../auth-layout/auth-layout';
import { AUTH_TEXTS, formatSeconds, formatTime } from '../auth-texts';
import { countdown } from '../countdown';
import { PasswordToggle } from '../password-toggle/password-toggle';

type Step = 'email' | 'code' | 'password';

/**
 * Recuperar contraseña (HU-05) en tres pasos: correo → código OTP → nueva
 * contraseña. Al terminar, confirma con un modal y vuelve al login.
 */
@Component({
  selector: 'auth-forgot-password-page',
  imports: [ReactiveFormsModule, RouterLink, Button, AuthLayout, PasswordToggle],
  templateUrl: './forgot-password-page.html',
  styleUrl: './forgot-password-page.scss',
})
export default class ForgotPasswordPage {
  private readonly api = inject(AuthApi);
  private readonly alerts = inject(AlertService);
  private readonly router = inject(Router);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly config = inject(AUTH_CONFIG);
  protected readonly texts = AUTH_TEXTS;

  protected readonly step = signal<Step>('email');
  protected readonly stepIndex = computed(() =>
    (['email', 'code', 'password'] as const).indexOf(this.step()),
  );
  protected readonly delivery = signal<OtpDeliveryDto | null>(null);
  protected readonly resent = signal(false);
  protected readonly resend = countdown();
  protected readonly showPassword = signal(false);
  private resetToken = '';

  protected readonly sendRequest = requestState<OtpDeliveryDto>();
  protected readonly verifyRequest = requestState<{ resetToken: string }>();
  protected readonly resetRequest = requestState<void>();
  private readonly resendError = signal<ApiError | null>(null);

  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');

  protected readonly emailForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });
  protected readonly codeForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });
  protected readonly passwordForm = this.fb.group(
    {
      newPassword: ['', [Validators.required, passwordRules]],
      confirmPassword: ['', Validators.required],
    },
    { validators: matchingFields('newPassword', 'confirmPassword') },
  );

  protected readonly codeLength = computed(() => this.delivery()?.codeLength ?? 6);
  protected readonly loading = computed(
    () => this.sendRequest.loading() || this.verifyRequest.loading() || this.resetRequest.loading(),
  );

  /** Mensaje de error del paso actual, con los datos extra de la API. */
  protected readonly errorMessage = computed(() => {
    const error =
      this.step() === 'email'
        ? this.sendRequest.error()
        : this.step() === 'code'
          ? (this.verifyRequest.error() ?? this.resendError())
          : this.resetRequest.error();
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

  protected invalid(control: { invalid: boolean; touched: boolean }): boolean {
    return control.invalid && control.touched;
  }

  protected async sendCode(): Promise<void> {
    if (this.emailForm.invalid) {
      this.emailForm.markAllAsTouched();
      return;
    }
    const delivery = await this.sendRequest.run(this.api.forgotPassword({ email: this.email() }));
    if (delivery) {
      this.delivery.set(delivery);
      this.resend.start(delivery.resendAvailableAt);
      this.codeForm.reset();
      this.goTo('code');
    }
  }

  protected async resendCode(): Promise<void> {
    this.resendError.set(null);
    this.resent.set(false);
    try {
      const delivery = await firstValueFrom(
        this.api.resendOtp({ email: this.email(), purpose: 'PASSWORD_RESET' }),
      );
      this.delivery.set(delivery);
      this.resend.start(delivery.resendAvailableAt);
      this.verifyRequest.reset();
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

  protected async verifyCode(): Promise<void> {
    if (this.codeForm.invalid) {
      this.codeForm.markAllAsTouched();
      return;
    }
    this.resent.set(false);
    this.resendError.set(null);
    const result = await this.verifyRequest.run(
      this.api.verifyResetOtp({ email: this.email(), code: this.codeForm.getRawValue().code }),
    );
    if (result) {
      this.resetToken = result.resetToken;
      this.passwordForm.reset();
      this.goTo('password');
    }
  }

  protected async savePassword(): Promise<void> {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { newPassword, confirmPassword } = this.passwordForm.getRawValue();
    await this.resetRequest.run(
      this.api.resetPassword({ resetToken: this.resetToken, newPassword, confirmPassword }),
    );
    if (this.resetRequest.error()) {
      // El token de un solo uso venció: hay que pedir un código nuevo.
      if (this.resetRequest.error()?.code === 'AUTH_RESET_TOKEN_INVALID') {
        this.sendRequest.reset();
        this.goTo('email');
      }
      return;
    }
    const done = this.texts.forgot.done;
    await this.alerts.success(done.title, done.message, { confirmLabel: done.confirm });
    await this.router.navigateByUrl(this.config.loginUrl);
  }

  protected changeEmail(): void {
    this.verifyRequest.reset();
    this.resendError.set(null);
    this.resent.set(false);
    this.goTo('email');
  }

  /** Deja solo dígitos en el código (pegar "123 456" funciona). */
  protected normalizeCode(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '').slice(0, this.codeLength());
    if (digits !== input.value) {
      this.codeForm.controls.code.setValue(digits);
    }
  }

  private email(): string {
    return this.emailForm.getRawValue().email.trim().toLowerCase();
  }

  /** Cambia de paso y mueve el foco al título para anunciarlo. */
  private goTo(step: Step): void {
    this.step.set(step);
    setTimeout(() => this.heading()?.nativeElement.focus());
  }
}
