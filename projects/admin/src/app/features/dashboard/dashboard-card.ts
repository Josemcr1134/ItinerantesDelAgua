import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavIcon } from '../../core/navigation';
import { Icon } from '../../shared/icon/icon';

/**
 * Tarjeta de un bloque del inicio, con la maqueta de los accesos del
 * Dashboard del Portal (Figma HU-06): ícono redondo montado sobre el borde,
 * título con línea verde, cifra grande con su leyenda, las filas que se
 * proyectan (`adm-dashboard-metric`) y un enlace al módulo. `inline`: franja
 * a lo ancho de la fila para un bloque de una sola cifra.
 */
@Component({
  selector: 'adm-dashboard-card',
  imports: [RouterLink, Icon],
  host: { '[class.inline]': 'inline()' },
  template: `
    <section class="card" [attr.aria-labelledby]="headingId()">
      <span class="card__icon"><adm-icon [name]="icon()" [size]="32" /></span>
      <h2 class="card__title" [id]="headingId()">{{ title() }}</h2>
      <p class="card__value">
        <span class="card__number">{{ value() }}</span>
        <span class="card__caption">{{ caption() }}</span>
      </p>
      <div class="card__rows">
        <ng-content />
      </div>
      @if (link(); as path) {
        <a class="card__link" [routerLink]="path" [queryParams]="linkQuery()">{{ linkLabel() }}</a>
      }
    </section>
  `,
  styles: `
    // Figma HU-06 (Portal): tarjeta blanca de radio 12 px, ícono de 73 px que
    // sobresale la mitad y cifra de 64 px.
    :host {
      display: block;
      padding-top: 37px;
    }
    .card {
      position: relative;
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 50px 16px 20px;
      border-radius: 12px;
      background-color: #fff;
      box-shadow: -18.9px 18.9px 27.3px -8.4px rgb(63 86 68 / 0.15);
      text-align: center;
    }
    .card__icon {
      position: absolute;
      top: -37px;
      left: 50%;
      display: grid;
      place-items: center;
      width: 73px;
      height: 73px;
      border: 4px solid #fff;
      border-radius: 50%;
      background-color: var(--color-primary);
      color: #fff;
      translate: -50% 0;
    }
    .card__title {
      padding-bottom: 13px;
      border-bottom: 1px solid var(--color-primary);
      color: var(--color-raisin-black);
      font-family: var(--font-family-body);
      font-size: 1.28rem;
      font-weight: 600;
      line-height: 26.7px;
    }
    .card__value {
      display: grid;
      margin: 2px 0 16px;
    }
    .card__number {
      color: var(--color-primary);
      font-family: var(--font-family-numeric);
      font-size: clamp(2.5rem, 2rem + 1.6vw, 3.5rem);
      font-weight: 700;
      line-height: 1.5;
      overflow-wrap: anywhere;
    }
    .card__caption {
      color: var(--color-raisin-black);
      font-weight: 500;
    }
    .card__rows {
      display: grid;
      gap: 10px;
      margin-bottom: 16px;

      &:empty {
        display: none;
      }
    }
    .card__link {
      margin-top: auto;
      border-radius: 54px;
      background-color: var(--color-primary);
      color: #fff;
      font-weight: 600;
      line-height: 38px;
      text-decoration: none;

      &:hover {
        background-color: #2e4033;
      }

      &:focus-visible {
        outline: 3px solid var(--color-sun);
        outline-offset: 2px;
      }
    }

    // En línea: franja a lo ancho de la fila (un bloque con una sola cifra).
    :host(.inline) {
      grid-column: 1 / -1;
      padding-top: 0;
    }
    :host(.inline) .card {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px 20px;
      padding: 16px 20px;
      text-align: left;
    }
    :host(.inline) .card__icon {
      position: static;
      width: 56px;
      height: 56px;
      border: 0;
      translate: none;
    }
    :host(.inline) .card__title {
      padding: 0;
      border: 0;
    }
    :host(.inline) .card__value {
      display: flex;
      flex: 1;
      align-items: baseline;
      gap: 8px;
      margin: 0;
    }
    :host(.inline) .card__number {
      font-size: 2.25rem;
      line-height: 1;
    }
    :host(.inline) .card__link {
      margin: 0;
      padding: 0 24px;
    }
  `,
})
export class DashboardCard {
  readonly headingId = input.required<string>();
  readonly title = input.required<string>();
  readonly icon = input.required<NavIcon>();
  readonly value = input.required<number | string>();
  readonly caption = input.required<string>();
  readonly link = input<string>();
  readonly linkQuery = input<Record<string, string>>();
  readonly linkLabel = input('Ver más');
  /** Franja a lo ancho en vez de tarjeta (sin filas). */
  readonly inline = input(false);
}

/**
 * Fila de una tarjeta: pastilla con el nombre y, al lado, la cifra en un
 * círculo verde (amarillo si `alert` y hay algo pendiente).
 */
@Component({
  selector: 'adm-dashboard-metric',
  template: `
    <span class="metric__label">{{ label() }}</span>
    <span class="metric__value">{{ value() }}</span>
  `,
  host: { '[class.metric--alert]': 'alert() && !!value()' },
  styles: `
    :host {
      display: flex;
      gap: 8px;
      min-width: 0;
      text-align: left;
    }
    .metric__label {
      display: flex;
      flex: 1;
      align-items: center;
      min-width: 0;
      min-height: 35px;
      padding: 6px 14px;
      border: 1px solid var(--color-primary);
      border-radius: 18px;
      color: var(--color-primary);
      line-height: 1.2;
    }
    .metric__value {
      display: grid;
      flex: none;
      align-self: center;
      place-items: center;
      min-width: 35px;
      height: 35px;
      padding: 0 8px;
      border-radius: 54px;
      background-color: var(--color-primary);
      color: #fff;
      font-family: var(--font-family-numeric);
      font-size: 0.9375rem;
      font-weight: 700;
    }
    :host(.metric--alert) .metric__value {
      background-color: var(--color-sun);
      color: var(--color-raisin-black);
    }
  `,
})
export class DashboardMetric {
  readonly label = input.required<string>();
  readonly value = input.required<number | string>();
  /** Requiere atención cuando no es 0 (p. ej. transferencias por validar). */
  readonly alert = input(false);
}
