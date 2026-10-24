import { Component, computed, input } from '@angular/core';

/** Tono de la pantalla: crema (login, registro) o agua (verificar correo, Figma HU-03). */
export type AccessTone = 'light' | 'water';

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
  readonly tone = input<AccessTone>('light');

  /** Logo verde sobre crema; blanco sobre el azul del agua. */
  protected readonly logo = computed(() =>
    this.tone() === 'water'
      ? { src: 'assets/access/logo-escuela-white.webp', width: 178, height: 138 }
      : { src: 'assets/access/logo-escuela.webp', width: 198, height: 138 },
  );
}
