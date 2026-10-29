import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { AUTH_CONFIG } from '../../auth.config';
import { AuthLayout } from '../auth-layout/auth-layout';
import { AUTH_TEXTS } from '../auth-texts';
import { LoginForm } from '../login-form/login-form';
import { safeReturnUrl } from '../return-url';
import { UnverifiedLogin, verifyEmailState } from '../verify-email/verify-email-state';

/** Login de las plataformas sin diseño propio (p. ej. el panel) (HU-04). */
@Component({
  selector: 'auth-login-page',
  imports: [AuthLayout, LoginForm],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export default class LoginPage {
  /** Página a la que volver tras iniciar sesión (query param). */
  readonly returnUrl = input<string>();
  protected readonly texts = AUTH_TEXTS;

  private readonly router = inject(Router);
  private readonly config = inject(AUTH_CONFIG);

  /** Cuenta sin verificar: a validar el correo, conservando el destino. */
  protected async verifyEmail(login: UnverifiedLogin): Promise<void> {
    const returnUrl = safeReturnUrl(this.returnUrl(), '');
    await this.router.navigate([this.config.verifyEmailUrl], {
      state: verifyEmailState(login),
      queryParams: returnUrl ? { returnUrl } : {},
    });
  }
}
