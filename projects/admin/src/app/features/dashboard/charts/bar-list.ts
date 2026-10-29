import { Component, computed, input } from '@angular/core';
import { formatCount } from './chart-scale';

export interface BarItem {
  readonly label: string;
  readonly value: number;
}

/**
 * Ranking en barras horizontales (una sola serie y un solo color): nombre y
 * cifra arriba, barra proporcional al mayor debajo.
 */
@Component({
  selector: 'adm-bar-list',
  template: `
    <ul class="list">
      @for (item of items(); track item.label) {
        <li class="item">
          <span class="item__label">{{ item.label }}</span>
          <span class="item__value">{{ format()(item.value) }}</span>
          <span class="track" aria-hidden="true">
            <span
              class="bar"
              [style.width.%]="(item.value / max()) * 100"
              [style.background-color]="color()"
            ></span>
          </span>
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: block;
    }
    .list {
      display: grid;
      gap: 12px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .item {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 4px 12px;
      color: var(--color-raisin-black);
      font-size: 0.875rem;
    }
    .item__label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .item__value {
      font-family: var(--font-family-numeric);
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }
    .track {
      grid-column: 1 / -1;
      height: 10px;
      border-radius: 4px;
      background-color: #f1eee4;
    }
    .bar {
      display: block;
      min-width: 2px;
      height: 100%;
      border-radius: 4px;
    }
  `,
})
export class BarList {
  readonly items = input.required<readonly BarItem[]>();
  readonly color = input('#399f71');
  readonly format = input<(value: number) => string>(formatCount);

  protected readonly max = computed(() => Math.max(1, ...this.items().map((i) => i.value)));
}
