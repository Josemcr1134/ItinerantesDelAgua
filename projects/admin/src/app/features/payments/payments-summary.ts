import { Component, input } from '@angular/core';
import { AdminPaymentsSummaryDto } from 'data-access';
import { formatMoney } from '../../shared/format/format';

/** Resumen de pagos: cobrado, reembolsado y neto por moneda (MXN y USD nunca se suman). */
@Component({
  selector: 'adm-payments-summary',
  template: `
    @let s = summary();
    <ul class="cards" aria-label="Resumen por moneda">
      @for (c of s.currencies; track c.currency) {
        <li class="card">
          <p class="card__label">Neto {{ c.currency }}</p>
          <p class="card__value">{{ money(c.net) }}</p>
          <p class="card__meta">
            Cobrado {{ money(c.collected) }} · reembolsado {{ money(c.refunded) }}
          </p>
          <p class="card__meta">
            {{ c.paymentCount }} {{ c.paymentCount === 1 ? 'pago' : 'pagos' }}
          </p>
        </li>
      }
      <li class="card card--alert" [class.card--quiet]="!s.pendingTransfers.count">
        <p class="card__label">Transferencias por conciliar</p>
        <p class="card__value">{{ s.pendingTransfers.count }}</p>
        @if (s.pendingTransfers.count) {
          <p class="card__meta">{{ money(s.pendingTransfers.amount) }}</p>
        }
      </li>
      <li class="card card--alert" [class.card--quiet]="!s.plans.pastDue && !s.plans.delinquent">
        <p class="card__label">Planes con problemas</p>
        <p class="card__value">{{ s.plans.pastDue + s.plans.delinquent }}</p>
        <p class="card__meta">
          {{ s.plans.pastDue }} cobro fallido · {{ s.plans.delinquent }} en mora ·
          {{ s.plans.accessSuspended }} con acceso suspendido
        </p>
      </li>
      @if (s.pendingRefunds) {
        <li class="card">
          <p class="card__label">Reembolsos en proceso</p>
          <p class="card__value">{{ s.pendingRefunds }}</p>
        </li>
      }
    </ul>
  `,
  styles: `
    :host {
      display: block;
      margin-top: var(--space-4);
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 14rem), 1fr));
      gap: var(--space-3);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .card {
      padding: var(--space-3) var(--space-4);
      border-radius: 20px;
      background-color: var(--color-surface);
    }
    .card--alert {
      border-left: 4px solid var(--color-sun);
    }
    .card--quiet {
      border-left-color: transparent;
    }
    .card__label {
      margin: 0;
      color: var(--color-primary);
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .card__value {
      margin: var(--space-1) 0;
      font-family: var(--font-family-numeric);
      font-size: 1.5rem;
      font-weight: 700;
      overflow-wrap: anywhere;
    }
    .card__meta {
      margin: 0;
      color: color-mix(in srgb, var(--color-raisin-black) 65%, transparent);
      font-size: 0.8125rem;
    }
  `,
})
export class PaymentsSummary {
  readonly summary = input.required<AdminPaymentsSummaryDto>();
  protected readonly money = formatMoney;
}
