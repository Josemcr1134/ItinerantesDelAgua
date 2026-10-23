import { Component, computed, inject, input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminPaymentsApi, AdminPaymentsSummaryDto, requestState } from 'data-access';
import { PageHeader } from '../../shared/page-header/page-header';
import { PaymentsSummary } from './payments-summary';
import { PaymentsTab } from './tabs/payments-tab';
import { PlansTab } from './tabs/plans-tab';
import { RefundsTab } from './tabs/refunds-tab';
import { TransfersTab } from './tabs/transfers-tab';

type Tab = 'pagos' | 'transferencias' | 'planes' | 'reembolsos';

/**
 * Pagos (HU-33): resumen por moneda y pestañas Pagos, Transferencias por
 * conciliar, Planes de cuotas y Reembolsos (`?pestana=`). Todo el equipo
 * con `payments.read` consulta; actuar requiere `payments.manage`.
 */
@Component({
  selector: 'adm-payments-page',
  imports: [
    RouterLink,
    PageHeader,
    PaymentsSummary,
    PaymentsTab,
    TransfersTab,
    PlansTab,
    RefundsTab,
  ],
  template: `
    <adm-page-header
      title="Pagos"
      lead="Cobros con tarjeta y transferencias, planes de cuotas y reembolsos. MXN y USD se muestran por separado."
    />

    @if (summary.data(); as s) {
      <adm-payments-summary [summary]="s" />
    }

    <nav class="tabs" aria-label="Secciones de pagos">
      @for (t of tabs(); track t.tab) {
        <a
          class="tabs__tab"
          [class.tabs__tab--active]="tab() === t.tab"
          [attr.aria-current]="tab() === t.tab ? 'page' : null"
          routerLink="."
          [queryParams]="{ pestana: t.tab }"
        >
          {{ t.label }}
          @if (t.count) {
            <span class="tabs__count"
              >{{ t.count }}<span class="visually-hidden"> {{ t.countLabel }}</span></span
            >
          }
        </a>
      }
    </nav>

    @switch (tab()) {
      @case ('transferencias') {
        <adm-transfers-tab />
      }
      @case ('planes') {
        <adm-plans-tab />
      }
      @case ('reembolsos') {
        <adm-refunds-tab />
      }
      @default {
        <adm-payments-tab />
      }
    }
  `,
  styles: `
    :host {
      display: block;
      color: var(--color-raisin-black);
    }
    .tabs {
      display: flex;
      gap: var(--space-1);
      margin: var(--space-5) 0 var(--space-4);
      overflow-x: auto;
      border-bottom: 1px solid color-mix(in srgb, var(--color-primary) 18%, transparent);
    }
    .tabs__tab {
      /* Contiene el texto oculto del contador (si no, escapa del desplazamiento). */
      position: relative;
      display: inline-flex;
      flex: none;
      align-items: center;
      gap: var(--space-2);
      margin-bottom: -1px;
      padding: var(--space-2) var(--space-3);
      border-bottom: 3px solid transparent;
      color: color-mix(in srgb, var(--color-raisin-black) 70%, transparent);
      font-weight: 700;
      text-decoration: none;
      white-space: nowrap;
    }
    .tabs__tab:hover {
      color: var(--color-primary);
    }
    .tabs__tab--active {
      border-bottom-color: var(--color-primary);
      color: var(--color-primary);
    }
    .tabs__count {
      display: inline-grid;
      place-items: center;
      min-width: 22px;
      height: 22px;
      padding: 0 6px;
      border-radius: var(--radius-pill);
      background-color: var(--color-sun);
      color: var(--color-raisin-black);
      font-family: var(--font-family-numeric);
      font-size: 0.75rem;
    }
  `,
})
export default class PaymentsPage implements OnInit {
  /** `?pestana=pagos|transferencias|planes|reembolsos`. */
  readonly pestana = input<string>();

  private readonly api = inject(AdminPaymentsApi);
  protected readonly summary = requestState<AdminPaymentsSummaryDto>();

  protected readonly tab = computed<Tab>(() => {
    const tab = this.pestana();
    return tab === 'transferencias' || tab === 'planes' || tab === 'reembolsos' ? tab : 'pagos';
  });

  /** Pestañas con el contador de lo que requiere atención. */
  protected readonly tabs = computed(() => {
    const s = this.summary.data();
    return [
      { tab: 'pagos' as const, label: 'Pagos', count: 0, countLabel: '' },
      {
        tab: 'transferencias' as const,
        label: 'Transferencias por conciliar',
        count: s?.pendingTransfers.count ?? 0,
        countLabel: 'por conciliar',
      },
      {
        tab: 'planes' as const,
        label: 'Planes de cuotas',
        count: (s?.plans.pastDue ?? 0) + (s?.plans.delinquent ?? 0),
        countLabel: 'con cobro fallido o en mora',
      },
      {
        tab: 'reembolsos' as const,
        label: 'Reembolsos',
        count: s?.pendingRefunds ?? 0,
        countLabel: 'en proceso',
      },
    ];
  });

  ngOnInit(): void {
    void this.summary.run(this.api.summary());
  }
}
