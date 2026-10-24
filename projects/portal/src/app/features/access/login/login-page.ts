import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LoginForm } from 'auth';
import { AccessLayout } from '../access-layout/access-layout';

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
}
