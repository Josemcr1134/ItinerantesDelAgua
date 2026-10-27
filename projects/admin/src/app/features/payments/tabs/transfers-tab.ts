import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminPaymentsApi, TRANSFER_STATUS_VALUES, TransferStatus } from 'data-access';
import { FilterBar } from '../../../shared/filters/filter-bar';
import { FilterSelect, optionsFrom } from '../../../shared/filters/filter-select';
import { offerOptions } from '../../../shared/filters/offer-options';
import { SearchField } from '../../../shared/filters/search-field';
import { formatDateTime, formatMoney } from '../../../shared/format/format';
import { listController } from '../../../shared/list/list-controller';
import { ListStates } from '../../../shared/list/list-states';
import { Person } from '../../../shared/person/person';
import { formatOfferDate } from '../../offers/shared/zoned-time';
import {
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONES,
  TRANSFER_STATUS_LABELS,
} from '../payment-labels';
import { Pagination } from 'ui-kit';

/** Pestaña "Transferencias por conciliar": por defecto las pendientes, la más antigua primero. */
@Component({
  selector: 'adm-transfers-tab',
  imports: [RouterLink, FilterBar, FilterSelect, SearchField, ListStates, Pagination, Person],
  templateUrl: './transfers-tab.html',
  styleUrl: './tabs.scss',
})
export class TransfersTab {
  private readonly api = inject(AdminPaymentsApi);

  protected readonly paymentLabels = PAYMENT_STATUS_LABELS;
  protected readonly paymentTones = PAYMENT_STATUS_TONES;
  protected readonly money = formatMoney;
  protected readonly formatDateTime = formatDateTime;
  protected readonly formatDate = formatOfferDate;

  protected readonly status = signal<TransferStatus | ''>('PENDING_VALIDATION');
  protected readonly offerId = signal('');
  protected readonly options = {
    offers: offerOptions(),
    status: optionsFrom(TRANSFER_STATUS_VALUES, TRANSFER_STATUS_LABELS),
  };

  protected readonly list = listController({
    fetch: (query) => this.api.transfers(query),
    filters: () => ({ status: this.status(), offerId: this.offerId() }),
    notFilters: ['status'],
  });

  protected clearFilters(): void {
    this.list.clearSearch();
    this.offerId.set('');
  }
}
