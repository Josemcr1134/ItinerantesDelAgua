import { Component, input } from '@angular/core';

/**
 * Marco de las pantallas de acceso del portal (Figma HU-02 / HU-04): logo
 * arriba, tarjeta centrada y, detrás, las ilustraciones que cada pantalla
 * proyecta con el atributo `accessDecor` (posicionadas con `_frame.scss`).
 *
 * La tarjeta toma su borde de `--access-card-border` (p. ej. rojo al fallar).
 */
@Component({
  selector: 'portal-access-layout',
  templateUrl: './access-layout.html',
  styleUrl: './access-layout.scss',
})
export class AccessLayout {
  /** `id` del título de la tarjeta. */
  readonly labelledBy = input.required<string>();
  /** Tarjeta ancha (formularios en dos columnas, como el registro). */
  readonly wide = input(false);
}
