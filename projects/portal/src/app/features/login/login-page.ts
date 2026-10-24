import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoginForm } from 'auth';

/** Login de participantes (Figma HU-04 "Ingresar al Portal"). */
@Component({
  selector: 'portal-login-page',
  imports: [RouterLink, LoginForm],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export default class LoginPage {
  /** Página protegida desde la que se llegó (`?returnUrl=`). */
  readonly returnUrl = input<string>();
}
