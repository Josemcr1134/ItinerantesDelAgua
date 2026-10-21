import { Component, input } from '@angular/core';

/**
 * Loader general a pantalla completa: la onda de la marca fluye como agua.
 * Aparece tras `delay` ms para no parpadear en peticiones rápidas y se anuncia
 * a lectores de pantalla (`role="status"`).
 */
@Component({
  selector: 'ui-loading-overlay',
  templateUrl: './loading-overlay.html',
  styleUrl: './loading-overlay.scss',
  host: { '[style.--ui-loader-delay]': 'delay() + "ms"' },
})
export class LoadingOverlay {
  readonly visible = input(false);
  readonly label = input('Cargando…');
  /** Espera antes de mostrarse (ms). */
  readonly delay = input(300);
}
