import { Component, computed, input, signal } from '@angular/core';
import { formatCompact, formatCount, niceTicks } from './chart-scale';

export interface ChartSeries {
  readonly name: string;
  readonly color: string;
  readonly values: readonly number[];
}

/**
 * Columnas por periodo (una o varias series agrupadas, en la misma unidad).
 * Al pasar el cursor por un periodo se ven sus cifras; la tabla con todos los
 * datos queda en "Ver datos en tabla" (la gráfica es decorativa para lectores
 * de pantalla). Con más de una serie, leyenda arriba.
 */
@Component({
  selector: 'adm-column-chart',
  template: `
    @if (series().length > 1) {
      <ul class="legend" aria-hidden="true">
        @for (s of series(); track s.name) {
          <li><span class="swatch" [style.background-color]="s.color"></span>{{ s.name }}</li>
        }
      </ul>
    }

    <div class="chart" aria-hidden="true">
      <div class="axis">
        @for (tick of ticks(); track tick) {
          <span class="axis__tick" [style.bottom.%]="percent(tick)">{{ axisFormat()(tick) }}</span>
        }
      </div>
      <div class="plot" (mouseleave)="active.set(null)">
        <div class="grid">
          @for (tick of ticks(); track tick) {
            <span class="grid__line" [style.bottom.%]="percent(tick)"></span>
          }
        </div>
        @for (label of labels(); track $index; let i = $index, first = $first, last = $last) {
          <div
            class="group"
            [class.group--active]="active() === i"
            (mouseenter)="active.set(i)"
            (click)="active.set(i)"
          >
            <div class="bars">
              @for (s of series(); track s.name) {
                <span
                  class="bar"
                  [class.bar--empty]="!s.values[i]"
                  [style.height.%]="percent(s.values[i])"
                  [style.background-color]="s.color"
                ></span>
              }
            </div>
            <span class="group__label">{{ label }}</span>
            @if (active() === i) {
              <div class="tip" [class.tip--start]="first" [class.tip--end]="last && !first">
                <strong class="tip__title">{{ fullLabels()[i] }}</strong>
                @for (s of series(); track s.name) {
                  <span class="tip__row">
                    <span class="swatch" [style.background-color]="s.color"></span>
                    {{ s.name }}
                    <strong class="tip__value">{{ format()(s.values[i]) }}</strong>
                  </span>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>

    <details class="data">
      <summary>Ver datos en tabla</summary>
      <div class="data__scroll">
        <table>
          <caption class="visually-hidden">
            {{
              caption()
            }}
          </caption>
          <thead>
            <tr>
              <th scope="col">Mes</th>
              @for (s of series(); track s.name) {
                <th scope="col">{{ s.name }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (label of fullLabels(); track $index; let i = $index) {
              <tr>
                <th scope="row">{{ label }}</th>
                @for (s of series(); track s.name) {
                  <td>{{ format()(s.values[i]) }}</td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    </details>
  `,
  styles: `
    :host {
      --plot-h: 200px;
      display: block;
      color: var(--color-raisin-black);
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 18px;
      margin: 0 0 var(--space-3);
      padding: 0;
      font-size: 0.875rem;
      list-style: none;

      li {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }
    .swatch {
      flex: none;
      width: 10px;
      height: 10px;
      border-radius: 3px;
    }
    .chart {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      gap: 8px;
    }
    .axis {
      position: relative;
      height: var(--plot-h);
      min-width: 2.25rem;
    }
    .axis__tick {
      position: absolute;
      right: 0;
      color: color-mix(in srgb, var(--color-raisin-black) 60%, transparent);
      font-size: 0.75rem;
      font-variant-numeric: tabular-nums;
      line-height: 1;
      translate: 0 50%;
    }
    .plot {
      position: relative;
      display: grid;
      grid-auto-columns: minmax(0, 1fr);
      grid-auto-flow: column;
    }
    .grid {
      position: absolute;
      inset: 0 0 auto;
      height: var(--plot-h);
      pointer-events: none;
    }
    .grid__line {
      position: absolute;
      right: 0;
      left: 0;
      border-top: 1px solid #ece8dc;
    }
    .group {
      position: relative;
      display: grid;
      grid-template-rows: var(--plot-h) auto;
      justify-items: center;
      border-radius: 8px;
      cursor: default;
    }
    .group--active {
      background-color: color-mix(in srgb, var(--color-primary) 6%, transparent);
    }
    .bars {
      position: relative;
      display: flex;
      align-items: flex-end;
      gap: 2px;
      width: 100%;
      justify-content: center;
    }
    .bar {
      width: min(24px, 28%);
      min-height: 2px;
      border-radius: 4px 4px 0 0;
    }
    .bar--empty {
      min-height: 0;
    }
    .group__label {
      padding-top: 6px;
      color: color-mix(in srgb, var(--color-raisin-black) 70%, transparent);
      font-size: 0.75rem;
      text-transform: capitalize;
    }
    .tip {
      position: absolute;
      bottom: calc(100% - 12px);
      left: 50%;
      z-index: 2;
      display: grid;
      gap: 4px;
      min-width: 11rem;
      padding: 10px 12px;
      border-radius: 10px;
      background-color: var(--color-raisin-black);
      box-shadow: 0 8px 24px rgb(27 30 48 / 0.25);
      color: #fff;
      font-size: 0.8125rem;
      translate: -50% 0;
      pointer-events: none;
    }
    .tip--start {
      left: 0;
      translate: none;
    }
    .tip--end {
      right: 0;
      left: auto;
      translate: none;
    }
    .tip__title {
      text-transform: capitalize;
    }
    .tip__row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .tip__value {
      margin-left: auto;
      padding-left: 12px;
      font-variant-numeric: tabular-nums;
    }
    .data {
      margin-top: var(--space-2);
      font-size: 0.8125rem;

      summary {
        width: fit-content;
        color: var(--color-primary);
        font-weight: 600;
        cursor: pointer;
      }
    }
    .data__scroll {
      overflow-x: auto;
    }
    table {
      width: 100%;
      margin-top: var(--space-2);
      border-collapse: collapse;
      font-variant-numeric: tabular-nums;
    }
    th,
    td {
      padding: 6px 8px;
      border-bottom: 1px solid #ece8dc;
      text-align: right;
      white-space: nowrap;
    }
    th:first-child {
      text-align: left;
      text-transform: capitalize;
    }
  `,
})
export class ColumnChart {
  /** Etiqueta corta de cada periodo (eje X). */
  readonly labels = input.required<readonly string[]>();
  /** Etiqueta completa (globo y tabla). */
  readonly fullLabels = input.required<readonly string[]>();
  readonly series = input.required<readonly ChartSeries[]>();
  readonly caption = input.required<string>();
  readonly format = input<(value: number) => string>(formatCount);
  readonly axisFormat = input<(value: number) => string>(formatCompact);

  protected readonly active = signal<number | null>(null);
  protected readonly ticks = computed(() =>
    niceTicks(Math.max(0, ...this.series().flatMap((s) => s.values))),
  );
  private readonly top = computed(() => this.ticks().at(-1) ?? 1);

  protected percent(value: number | undefined): number {
    return Math.max(0, ((value ?? 0) / this.top()) * 100);
  }
}
