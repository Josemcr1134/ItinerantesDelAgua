import { Component, computed, input, signal } from '@angular/core';
import { formatCount } from './chart-scale';

export interface StackSegment {
  readonly label: string;
  readonly value: number;
  readonly color: string;
}

/**
 * Partes de un total en una barra apilada (separadas por 2 px) con la leyenda
 * debajo: cifra y porcentaje de cada parte. Al pasar por un tramo o por su
 * leyenda se resalta y el resto se atenúa.
 */
@Component({
  selector: 'adm-stacked-bar',
  template: `
    <div class="bar" aria-hidden="true" (mouseleave)="active.set(null)">
      @for (s of visible(); track s.label) {
        <span
          class="segment"
          [class.segment--dim]="active() !== null && active() !== s.label"
          [style.flex-grow]="s.value"
          [style.background-color]="s.color"
          (mouseenter)="active.set(s.label)"
        ></span>
      } @empty {
        <span class="segment segment--none"></span>
      }
    </div>
    <ul class="legend" (mouseleave)="active.set(null)">
      @for (s of segments(); track s.label) {
        <li
          class="legend__item"
          [class.legend__item--active]="active() === s.label"
          (mouseenter)="active.set(s.label)"
        >
          <span class="swatch" [style.background-color]="s.color"></span>
          <span class="legend__label">{{ s.label }}</span>
          <strong class="legend__value">{{ count(s.value) }}</strong>
          <span class="legend__percent">{{ percent(s.value) }}</span>
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: block;
      color: var(--color-raisin-black);
    }
    .bar {
      display: flex;
      gap: 2px;
      height: 24px;
      overflow: hidden;
      border-radius: 6px;
    }
    .segment {
      flex-basis: 0;
      min-width: 4px;

      @media (prefers-reduced-motion: no-preference) {
        transition: opacity 0.15s ease;
      }
    }
    .segment--dim {
      opacity: 0.3;
    }
    .segment--none {
      flex-grow: 1;
      background-color: #f1eee4;
    }
    .legend {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr));
      gap: 4px 16px;
      margin: var(--space-3) 0 0;
      padding: 0;
      font-size: 0.875rem;
      list-style: none;
    }
    .legend__item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 6px;
      border-radius: 6px;
    }
    .legend__item--active {
      background-color: color-mix(in srgb, var(--color-primary) 7%, transparent);
    }
    .swatch {
      flex: none;
      width: 10px;
      height: 10px;
      border-radius: 3px;
    }
    .legend__label {
      flex: 1;
      min-width: 0;
    }
    .legend__value {
      font-family: var(--font-family-numeric);
      font-variant-numeric: tabular-nums;
    }
    .legend__percent {
      min-width: 3.25em;
      color: color-mix(in srgb, var(--color-raisin-black) 60%, transparent);
      font-variant-numeric: tabular-nums;
      text-align: right;
    }
  `,
})
export class StackedBar {
  readonly segments = input.required<readonly StackSegment[]>();

  protected readonly active = signal<string | null>(null);
  protected readonly visible = computed(() => this.segments().filter((s) => s.value > 0));
  private readonly total = computed(() => this.segments().reduce((sum, s) => sum + s.value, 0));
  protected readonly count = formatCount;

  protected percent(value: number): string {
    const total = this.total();
    return total ? `${Math.round((value / total) * 100)} %` : '—';
  }
}
