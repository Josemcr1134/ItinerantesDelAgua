import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoginForm, UnverifiedLogin } from 'auth';
import { AccessLayout } from '../access-layout/access-layout';
import { returnParams } from '../return-url';
import { maskEmail, VerifyEmailState } from '../verify-email/verify-email-state';

/** Login de participantes (Figma HU-04 "Ingresar al Portal"). */
@Component({
  selector: 'portal-login-page',
  imports: [RouterLink, LoginForm, AccessLayout],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.scss', './login-scene.scss'],
})
export default class LoginPage {
  /** Página protegida desde la que se llegó (`?returnUrl=`). */
  readonly returnUrl = input<string>();

  /** Quien se registra desde aquí vuelve al mismo destino. */
  protected readonly back = computed(() => returnParams(this.returnUrl()));

  private readonly router = inject(Router);

  /**
   * Cuenta sin verificar (HU-04 → HU-03): a validar el correo con el código
   * que la API acaba de reenviar (si lo hizo), conservando el destino.
   */
  protected async verifyEmail(login: UnverifiedLogin): Promise<void> {
    const state: VerifyEmailState = {
      email: login.email,
      otp:
        login.otpSent && login.expiresAt
          ? {
              maskedEmail: maskEmail(login.email),
              codeLength: 6,
              expiresAt: login.expiresAt,
              resendAvailableAt: login.resendAvailableAt ?? login.expiresAt,
            }
          : null,
    };
    await this.router.navigate(['/verificar-correo'], { state, queryParams: this.back() });
  }
}
