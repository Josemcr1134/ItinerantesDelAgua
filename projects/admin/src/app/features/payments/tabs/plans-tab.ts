import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AdminPaymentsApi,
  PAYMENT_PLAN_STATUS_VALUES,
  PaymentPlanSort,
  PaymentPlanStatus,
} from 'data-access';
import { FilterBar } from '../../../shared/filters/filter-bar';
import { FilterOption, FilterSelect, optionsFrom } from '../../../shared/filters/filter-select';
import { offerOptions } from '../../../shared/filters/offer-options';
import { SearchField } from '../../../shared/filters/search-field';
import { formatMoney } from '../../../shared/format/format';
import { listController } from '../../../shared/list/list-controller';
import { ListStates } from '../../../shared/list/list-states';
import { Person } from '../../../shared/person/person';
import { formatOfferDate } from '../../offers/shared/zoned-time';
import { PLAN_STATUS_LABELS, PLAN_STATUS_TONES } from '../payment-labels';
import { InstallmentDots } from '../plan/installment-dots';
import { Pagination } from 'ui-kit';

/** Pestaña "Planes de cuotas": los que llevan más días con cobro fallido primero. */
@Component({
  selector: 'adm-plans-tab',
  imports: [
    RouterLink,
    FilterBar,
    FilterSelect,
    SearchField,
    ListStates,
    Pagination,
    Person,
    InstallmentDots,
  ],
  templateUrl: './plans-tab.html',
  styleUrl: './tabs.scss',
})
export class PlansTab {
  private readonly api = inject(AdminPaymentsApi);

  protected readonly statusLabels = PLAN_STATUS_LABELS;
  protected readonly statusTones = PLAN_STATUS_TONES;
  protected readonly money = formatMoney;
  protected readonly formatDate = formatOfferDate;

  protected readonly status = signal<PaymentPlanStatus | ''>('');
  protected readonly offerId = signal('');
  protected readonly sort = signal<PaymentPlanSort>('FAILED_SINCE_ASC');
  protected readonly options = {
    offers: offerOptions(),
    status: optionsFrom(PAYMENT_PLAN_STATUS_VALUES, PLAN_STATUS_LABELS),
    sort: [
      { value: 'FAILED_SINCE_ASC', label: 'Más días con cobro fallido' },
      { value: 'CREATED_DESC', label: 'Más recientes' },
    ] as FilterOption<PaymentPlanSort>[],
  };

  protected readonly list = listController({
    fetch: ({ status, ...query }) =>
      this.api.plans({ ...query, status: status ? [status] : undefined }),
    filters: () => ({ status: this.status(), offerId: this.offerId(), sort: this.sort() }),
    notFilters: ['sort'],
  });

  protected clearFilters(): void {
    this.list.clearSearch();
    this.status.set('');
    this.offerId.set('');
  }
}
