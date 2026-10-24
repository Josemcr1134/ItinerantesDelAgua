import { Component, input } from '@angular/core';
import { AuthLayout } from '../auth-layout/auth-layout';
import { AUTH_TEXTS } from '../auth-texts';
import { LoginForm } from '../login-form/login-form';

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
}
