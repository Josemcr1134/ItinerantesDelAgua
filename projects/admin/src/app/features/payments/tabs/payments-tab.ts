import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AdminPaymentsApi,
  CURRENCY_VALUES,
  Currency,
  PAYMENT_CONCEPT_VALUES,
  PAYMENT_METHOD_VALUES,
  PAYMENT_STATUS_VALUES,
  PaymentConcept,
  PaymentMethod,
  PaymentSort,
  PaymentStatus,
} from 'data-access';
import { FilterBar } from '../../../shared/filters/filter-bar';
import { FilterDate } from '../../../shared/filters/filter-date';
import { FilterOption, FilterSelect, optionsFrom } from '../../../shared/filters/filter-select';
import { offerOptions } from '../../../shared/filters/offer-options';
import { SearchField } from '../../../shared/filters/search-field';
import { formatDateTime, formatMoney } from '../../../shared/format/format';
import { listController } from '../../../shared/list/list-controller';
import { ListStates } from '../../../shared/list/list-states';
import { Pagination } from '../../../shared/list/pagination';
import { Person } from '../../../shared/person/person';
import { dayEndIso, dayStartIso } from '../date-range';
import {
  PAYMENT_CONCEPT_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONES,
  formatCard,
} from '../payment-labels';

/** Pestaña "Pagos": todos los cobros (sin checkouts abandonados, salvo que se filtren). */
@Component({
  selector: 'adm-payments-tab',
  imports: [
    RouterLink,
    FilterBar,
    FilterSelect,
    FilterDate,
    SearchField,
    ListStates,
    Pagination,
    Person,
  ],
  templateUrl: './payments-tab.html',
  styleUrl: './tabs.scss',
})
export class PaymentsTab {
  private readonly api = inject(AdminPaymentsApi);

  protected readonly statusLabels = PAYMENT_STATUS_LABELS;
  protected readonly statusTones = PAYMENT_STATUS_TONES;
  protected readonly methodLabels = PAYMENT_METHOD_LABELS;
  protected readonly money = formatMoney;
  protected readonly card = formatCard;
  protected readonly formatDateTime = formatDateTime;

  protected readonly status = signal<PaymentStatus | ''>('');
  protected readonly method = signal<PaymentMethod | ''>('');
  protected readonly concept = signal<PaymentConcept | ''>('');
  protected readonly currency = signal<Currency | ''>('');
  protected readonly offerId = signal('');
  protected readonly from = signal('');
  protected readonly to = signal('');
  protected readonly sort = signal<PaymentSort>('CREATED_DESC');

  protected readonly options = {
    offers: offerOptions(),
    status: optionsFrom(PAYMENT_STATUS_VALUES, PAYMENT_STATUS_LABELS),
    method: optionsFrom(PAYMENT_METHOD_VALUES, PAYMENT_METHOD_LABELS),
    concept: optionsFrom(PAYMENT_CONCEPT_VALUES, PAYMENT_CONCEPT_LABELS),
    currency: CURRENCY_VALUES.map((c) => ({ value: c, label: c })),
    sort: [
      { value: 'CREATED_DESC', label: 'Más recientes' },
      { value: 'CREATED_ASC', label: 'Más antiguos' },
      { value: 'PAID_DESC', label: 'Fecha de pago' },
      { value: 'AMOUNT_DESC', label: 'Monto (mayor primero)' },
    ] as FilterOption<PaymentSort>[],
  };

  protected readonly list = listController({
    fetch: ({ status, from, to, ...query }) =>
      this.api.list({
        ...query,
        status: status ? [status] : undefined,
        from: from ? dayStartIso(from) : undefined,
        to: to ? dayEndIso(to) : undefined,
      }),
    filters: () => ({
      status: this.status(),
      method: this.method(),
      concept: this.concept(),
      currency: this.currency(),
      offerId: this.offerId(),
      from: this.from(),
      to: this.to(),
      sort: this.sort(),
    }),
    notFilters: ['sort'],
  });

  protected readonly hasOffers = computed(() => this.options.offers().length > 0);

  protected clearFilters(): void {
    this.list.clearSearch();
    this.status.set('');
    this.method.set('');
    this.concept.set('');
    this.currency.set('');
    this.offerId.set('');
    this.from.set('');
    this.to.set('');
  }
}
