import { Component, input, output } from '@angular/core';
import { ApiError } from 'data-access';
import { Button } from 'ui-kit';

/**
 * Estados de una carga desde la API: error con "Reintentar" (si aún no hay
 * datos), cargando, o el contenido proyectado cuando ya cargó. El contenido
 * debe protegerse con su propio `@if` si lee datos que pueden faltar.
 */
@Component({
  selector: 'adm-request-state',
  imports: [Button],
  template: `
    @if (error() && !loaded()) {
      <div class="adm-state adm-state--error" role="alert">
        <p>{{ error()?.message }}</p>
        <button uiButton variant="secondary" type="button" (click)="retry.emit()">
          Reintentar
        </button>
      </div>
    } @else if (!loaded()) {
      <p class="adm-state">{{ loadingText() }}</p>
    } @else {
      <ng-content />
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class RequestState {
  readonly error = input<ApiError | null>(null);
  /** Ya hay datos (aunque se esté recargando). */
  readonly loaded = input.required<boolean>();
  readonly loadingText = input('Cargando…');
  readonly retry = output<void>();
}
