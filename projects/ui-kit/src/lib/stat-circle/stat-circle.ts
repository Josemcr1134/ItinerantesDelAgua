import { Component, computed, input } from '@angular/core';

/** Geometría del anillo (Figma: 182×182, trazo de 13px). */
const SIZE = 182;
const STROKE = 12.67;
const RADIUS = SIZE / 2 - STROKE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Ángulo que ocupa cada extremo redondeado del arco. */
const CAP_DEG = (STROKE / 2 / RADIUS) * (180 / Math.PI);

/**
 * Anillo de progreso con una cifra en el centro y una etiqueta debajo.
 * `progress` es la fracción visible del anillo (0–1) medida desde arriba en
 * sentido horario, incluidos los extremos redondeados.
 */
@Component({
  selector: 'ui-stat-circle',
  templateUrl: './stat-circle.html',
  styleUrl: './stat-circle.scss',
})
export class StatCircle {
  readonly value = input.required<string>();
  readonly unit = input<string>();
  readonly label = input.required<string>();
  readonly progress = input(1);

  protected readonly size = SIZE;
  protected readonly radius = RADIUS;
  protected readonly stroke = STROKE;
  /** El arco empieza tras el extremo redondeado inicial, arriba del todo. */
  protected readonly rotation = `rotate(${-90 + CAP_DEG} ${SIZE / 2} ${SIZE / 2})`;
  protected readonly dashArray = computed(() => {
    const visibleDeg = Math.min(Math.max(this.progress(), 0), 1) * 360;
    const dashDeg = Math.max(visibleDeg - 2 * CAP_DEG, 0);
    return `${(dashDeg / 360) * CIRCUMFERENCE} ${CIRCUMFERENCE}`;
  });
}
