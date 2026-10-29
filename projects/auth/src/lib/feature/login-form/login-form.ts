import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { requestState, UserProfileDto } from 'data-access';
import { Button } from 'ui-kit';
import { AUTH_CONFIG } from '../../auth.config';
import { AuthService } from '../../auth.service';
import { SessionStore } from '../../session/session.store';
import { AUTH_TEXTS, formatTime } from '../auth-texts';
import { PasswordToggle } from '../password-toggle/password-toggle';
import { safeReturnUrl } from '../return-url';
import { UnverifiedLogin } from '../verify-email/verify-email-state';

/** Aspecto del formulario: el del panel o el del portal de participantes (Figma HU-04). */
export type LoginFormAppearance = 'default' | 'portal';

/**
 * Formulario de inicio de sesión (HU-04), compartido por todas las
 * plataformas: valida, inicia la sesión, muestra los errores de la API (con
 * el bloqueo por intentos) y vuelve a `returnUrl` o al inicio de la app.
 */
@Component({
  selector: 'auth-login-form',
  imports: [ReactiveFormsModule, RouterLink, Button, PasswordToggle],
  templateUrl: './login-form.html',
  styleUrls: ['./login-form.scss', './login-form-portal.scss'],
  host: {
    '[class.login-form--portal]': 'portal()',
    '[class.login-form--error]': 'failed()',
  },
})
export class LoginForm {
  /** Página a la que volver tras iniciar sesión. */
  readonly returnUrl = input<string>();
  /** Casilla "Recordarme" (sin ella, la sesión es la normal). */
  readonly showRememberMe = input(true);
  readonly appearance = input<LoginFormAppearance>('default');
  /** La cuenta no está verificada (si nadie lo atiende, se muestra el error). */
  readonly emailNotVerified = output<UnverifiedLogin>();

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly config = inject(AUTH_CONFIG);
  protected readonly texts = AUTH_TEXTS;
  protected readonly expired = inject(SessionStore).ended() === 'expired';
  protected readonly request = requestState<UserProfileDto>();
  protected readonly portal = computed(() => this.appearance() === 'portal');
  /**
   * El último intento fue rechazado por la API. Se mantiene mientras se
   * reintenta, para que el estado de error no parpadee entre envíos.
   */
  protected readonly failed = signal(false);
  protected readonly showPassword = signal(false);
  private readonly emailInput = viewChild.required<ElementRef<HTMLInputElement>>('email');
  private readonly passwordInput = viewChild.required<ElementRef<HTMLInputElement>>('password');

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false],
  });

  protected readonly errorMessage = computed(() => {
    const error = this.request.error();
    if (!error) {
      return null;
    }
    if (this.portal() && error.code === 'AUTH_INVALID_CREDENTIALS') {
      return this.texts.login.invalidCredentials;
    }
    const lockedUntil = error.metaString('lockedUntil');
    return lockedUntil
      ? `${error.message} ${this.texts.login.lockedUntil(formatTime(lockedUntil))}`
      : error.message;
  });

  /** Campo marcado como inválido: por su validación o por un intento rechazado. */
  protected invalid(name: 'email' | 'password'): boolean {
    return this.showError(name) || this.failed();
  }

  protected describedBy(name: 'email' | 'password'): string | null {
    const ids = [
      this.failed() ? 'login-error' : '',
      this.showError(name) ? `login-${name}-error` : '',
    ];
    return ids.filter(Boolean).join(' ') || null;
  }

  protected showError(name: 'email' | 'password'): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const first = this.form.controls.email.invalid ? this.emailInput() : this.passwordInput();
      first.nativeElement.focus();
      return;
    }
    const { email, password, rememberMe } = this.form.getRawValue();
    const user = await this.request.run(
      this.auth.login({ email: email.trim().toLowerCase(), password, rememberMe }),
    );
    this.failed.set(!user);
    if (user) {
      await this.router.navigateByUrl(safeReturnUrl(this.returnUrl(), this.config.homeUrl));
      return;
    }
    const error = this.request.error();
    if (error?.code === 'AUTH_EMAIL_NOT_VERIFIED') {
      this.emailNotVerified.emit({
        email: email.trim().toLowerCase(),
        rememberMe,
        otpSent: error.meta['otpSent'] === true,
        maskedEmail: error.metaString('maskedEmail'),
        codeLength: error.metaNumber('codeLength') ?? 6,
        expiresAt: error.metaString('expiresAt'),
        resendAvailableAt: error.metaString('resendAvailableAt'),
      });
    }
    this.form.controls.password.reset();
  }
}
