import { Component, input, output } from '@angular/core';

/**
 * Tarjeta de los accesos rápidos del Dashboard (Figma HU-06): ícono redondo
 * que sobresale, título, cifra grande, leyenda y las filas que se proyectan.
 */
@Component({
  selector: 'portal-dashboard-widget',
  template: `
    <section class="widget" [attr.aria-labelledby]="headingId()">
      <img class="widget__icon" [src]="icon()" alt="" width="73" height="73" />
      <h2 class="widget__title" [id]="headingId()">{{ title() }}</h2>
      @if (failed()) {
        <p class="widget__failed" role="status">No se pudo cargar esta información.</p>
        <button type="button" class="widget__retry" (click)="retry.emit()">Reintentar</button>
      } @else {
        <p class="widget__value">
          <span class="widget__number">{{ value() }}</span>
          <span class="widget__caption">{{ caption() }}</span>
        </p>
        <div class="widget__rows">
          <ng-content />
        </div>
        <ng-content select="[widgetFooter]" />
      }
    </section>
  `,
  styleUrl: './dashboard-widget.scss',
})
export class DashboardWidget {
  readonly headingId = input.required<string>();
  readonly title = input.required<string>();
  readonly icon = input.required<string>();
  readonly value = input<number | string>(0);
  readonly caption = input.required<string>();
  /** El bloque no llegó (la API lo marca en `failedBlocks`). */
  readonly failed = input(false);
  readonly retry = output<void>();
}
