import { Component, input } from '@angular/core';

/** Círculo de estadística: cifra (con unidad opcional) y etiqueta corta. */
@Component({
  selector: 'ui-stat-circle',
  templateUrl: './stat-circle.html',
  styleUrl: './stat-circle.scss',
})
export class StatCircle {
  readonly value = input.required<string>();
  readonly unit = input<string>();
  readonly label = input.required<string>();
}
