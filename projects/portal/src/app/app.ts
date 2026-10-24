import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingService } from 'data-access';
import { LoadingOverlay } from 'ui-kit';

/** Shell del portal de participantes: loader general y contenido de la ruta. */
@Component({
  imports: [RouterOutlet, LoadingOverlay],
  selector: 'portal-root',
  templateUrl: './app.html',
})
export class App {
  protected readonly loading = inject(LoadingService);
}
