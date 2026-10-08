import { Component, input } from '@angular/core';

/** Badge con una cifra grande y su unidad, para el dato principal de una sección. */
@Component({
  selector: 'ui-stat-badge',
  templateUrl: './stat-badge.html',
  styleUrl: './stat-badge.scss',
})
export class StatBadge {
  readonly value = input.required<string>();
  readonly unit = input<string>();
  readonly label = input<string>();
}
