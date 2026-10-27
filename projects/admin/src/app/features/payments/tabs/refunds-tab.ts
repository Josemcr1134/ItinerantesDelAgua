import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AdminPaymentsApi,
  PAYMENT_METHOD_VALUES,
  PaymentMethod,
  REFUND_STATUS_VALUES,
  RefundStatus,
} from 'data-access';
import { FilterBar } from '../../../shared/filters/filter-bar';
import { FilterSelect, optionsFrom } from '../../../shared/filters/filter-select';
import { offerOptions } from '../../../shared/filters/offer-options';
import { formatDateTime, formatMoney } from '../../../shared/format/format';
import { listController } from '../../../shared/list/list-controller';
import { ListStates } from '../../../shared/list/list-states';
import { Person } from '../../../shared/person/person';
import { REFUND_STATUS_LABELS, REFUND_STATUS_TONES } from '../payment-labels';
import { Pagination } from 'ui-kit';

/** Origen del reembolso: con tarjeta va por Stripe; con transferencia se registró (hecho fuera). */
const REFUND_METHOD_LABELS: Readonly<Record<PaymentMethod, string>> = {
  CARD: 'Tarjeta (Stripe)',
  BANK_TRANSFER: 'Transferencia (registrado)',
};

/** Pestaña "Reembolsos" (más reciente primero; "En proceso" = pendiente en Stripe). */
@Component({
  selector: 'adm-refunds-tab',
  imports: [RouterLink, FilterBar, FilterSelect, ListStates, Pagination, Person],
  templateUrl: './refunds-tab.html',
  styleUrl: './tabs.scss',
})
export class RefundsTab {
  private readonly api = inject(AdminPaymentsApi);

  protected readonly statusLabels = REFUND_STATUS_LABELS;
  protected readonly statusTones = REFUND_STATUS_TONES;
  protected readonly methodLabels = REFUND_METHOD_LABELS;
  protected readonly money = formatMoney;
  protected readonly formatDateTime = formatDateTime;

  protected readonly status = signal<RefundStatus | ''>('');
  protected readonly method = signal<PaymentMethod | ''>('');
  protected readonly offerId = signal('');
  protected readonly options = {
    offers: offerOptions(),
    status: optionsFrom(REFUND_STATUS_VALUES, REFUND_STATUS_LABELS),
    method: optionsFrom(PAYMENT_METHOD_VALUES, REFUND_METHOD_LABELS),
  };

  // La API de reembolsos no tiene búsqueda: no se envía `q`.
  protected readonly list = listController({
    fetch: ({ q: _q, ...query }) => this.api.refunds(query),
    filters: () => ({ status: this.status(), method: this.method(), offerId: this.offerId() }),
  });

  protected clearFilters(): void {
    this.status.set('');
    this.method.set('');
    this.offerId.set('');
  }
}
