import { Component, inject } from '@angular/core';
import { AUTH_CONFIG } from '../../auth.config';
import { AUTH_TEXTS } from '../auth-texts';

/**
 * Marco de las pantallas de acceso: panel de marca con ilustración (escritorio)
 * y columna del formulario. Diseño provisional hasta tener el Figma.
 */
@Component({
  selector: 'auth-layout',
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {
  protected readonly platformName = inject(AUTH_CONFIG).platformName;
  protected readonly texts = AUTH_TEXTS;
}
