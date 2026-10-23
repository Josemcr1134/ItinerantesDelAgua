import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  ADMIN_OFFER_STATUS_VALUES,
  AdminOfferListItemDto,
  AdminOfferSort,
  AdminOfferStatus,
  AdminOffersApi,
  OFFER_MODALITY_VALUES,
  OFFER_ORIGIN_VALUES,
  OFFER_TYPE_VALUES,
  OfferModality,
  OfferOrigin,
  OfferType,
} from 'data-access';
import { Button } from 'ui-kit';
import { environment } from '../../../../environments/environment';
import { AdminAccess } from '../../../core/access/admin-access';
import { FilterSelect, optionsFrom } from '../../../shared/filters/filter-select';
import { SearchField } from '../../../shared/filters/search-field';
import { listController } from '../../../shared/list/list-controller';
import { ListStates } from '../../../shared/list/list-states';
import { Pagination } from '../../../shared/list/pagination';
import { rowActions } from '../../../shared/list/row-actions';
import { PageHeader } from '../../../shared/page-header/page-header';
import { RowMenu } from '../../../shared/row-menu/row-menu';
import {
  OFFER_MODALITY_LABELS,
  OFFER_ORIGIN_LABELS,
  OFFER_STATUS_LABELS,
  OFFER_TYPE_LABELS,
} from '../offer-labels';
import { NewOfferDialog } from '../shared/new-offer-dialog';
import { OfferActions } from '../shared/offer-actions';
import { formatOfferDate } from '../shared/zoned-time';
import { Notice } from '../../../shared/notice/notice';
import { FilterBar } from '../../../shared/filters/filter-bar';

/**
 * Oferta formativa (HU-27): listado con filtros, estado y conteos. Las
 * acciones dependen de los permisos: `offers.write` edita y crea;
 * `offers.publish` publica, despublica, archiva, duplica y borra borradores.
 */
@Component({
  selector: 'adm-offers-list-page',
  imports: [
    FilterBar,
    Notice,
    RouterLink,
    Button,
    RowMenu,
    NewOfferDialog,
    PageHeader,
    SearchField,
    FilterSelect,
    ListStates,
    Pagination,
  ],
  templateUrl: './offers-list-page.html',
  styleUrl: './offers-list-page.scss',
})
export default class OffersListPage {
  private readonly api = inject(AdminOffersApi);
  private readonly actions = inject(OfferActions);
  private readonly router = inject(Router);
  private readonly access = inject(AdminAccess);

  protected readonly canWrite = computed(() => this.access.permissions().has('offers.write'));
  protected readonly canPublish = computed(() => this.access.permissions().has('offers.publish'));
  protected readonly canReadAudit = computed(() => this.access.permissions().has('audit.read'));
  protected readonly canReadAttendance = computed(() =>
    this.access.permissions().has('attendance.read'),
  );
  protected readonly publicSiteUrl = environment.publicSiteUrl;

  protected readonly typeLabels = OFFER_TYPE_LABELS;
  protected readonly modalityLabels = OFFER_MODALITY_LABELS;
  protected readonly statusLabels = OFFER_STATUS_LABELS;
  protected readonly formatDate = formatOfferDate;

  // --- Filtros ---
  protected readonly status = signal<AdminOfferStatus | ''>('');
  protected readonly type = signal<OfferType | ''>('');
  protected readonly modality = signal<OfferModality | ''>('');
  protected readonly origin = signal<OfferOrigin | ''>('');
  protected readonly sort = signal<AdminOfferSort>('UPDATED_DESC');
  protected readonly options = {
    status: optionsFrom(ADMIN_OFFER_STATUS_VALUES, OFFER_STATUS_LABELS),
    type: optionsFrom(OFFER_TYPE_VALUES, OFFER_TYPE_LABELS),
    modality: optionsFrom(OFFER_MODALITY_VALUES, OFFER_MODALITY_LABELS),
    origin: optionsFrom(OFFER_ORIGIN_VALUES, OFFER_ORIGIN_LABELS),
    sort: [
      { value: 'UPDATED_DESC', label: 'Recientes' },
      { value: 'STARTS_AT_ASC', label: 'Fecha de inicio' },
      { value: 'NAME_ASC', label: 'Nombre (A-Z)' },
    ] as const,
  };

  protected readonly list = listController({
    fetch: (query) => this.api.list(query),
    filters: () => ({
      status: this.status(),
      type: this.type(),
      modality: this.modality(),
      origin: this.origin(),
      sort: this.sort(),
    }),
    notFilters: ['sort'],
  });
  protected readonly rows = rowActions();
  protected readonly notice = signal('');
  protected readonly creating = signal(false);

  protected clearFilters(): void {
    this.list.clearSearch();
    this.status.set('');
    this.type.set('');
    this.modality.set('');
    this.origin.set('');
  }

  protected previewUrl(offer: AdminOfferListItemDto): string | null {
    return this.publicSiteUrl
      ? `${this.publicSiteUrl.replace(/\/$/, '')}${offer.publicPath}`
      : null;
  }

  // --- Acciones de estado (válidas según el estado de publicación) ---
  protected canPublishNow(offer: AdminOfferListItemDto): boolean {
    return offer.publicationStatus === 'DRAFT';
  }

  protected canUnpublish(offer: AdminOfferListItemDto): boolean {
    return offer.publicationStatus !== 'DRAFT';
  }

  protected canArchive(offer: AdminOfferListItemDto): boolean {
    return offer.publicationStatus !== 'ARCHIVED';
  }

  /** Solo borradores sin inscripciones ni postulaciones (lo confirma la API). */
  protected canRemove(offer: AdminOfferListItemDto): boolean {
    return (
      offer.publicationStatus === 'DRAFT' &&
      offer.counts.enrollments === 0 &&
      offer.counts.applications === 0
    );
  }

  protected publish(offer: AdminOfferListItemDto): Promise<void> {
    return this.change(offer, () => this.actions.publish(offer), 'Se publicó');
  }

  protected unpublish(offer: AdminOfferListItemDto): Promise<void> {
    return this.change(offer, () => this.actions.unpublish(offer), 'Volvió a borrador');
  }

  protected archive(offer: AdminOfferListItemDto): Promise<void> {
    return this.change(offer, () => this.actions.archive(offer), 'Se archivó');
  }

  protected async duplicate(offer: AdminOfferListItemDto): Promise<void> {
    const copy = await this.rows.run(offer.id, () => this.actions.duplicate(offer));
    if (copy) await this.router.navigate(['/ofertas', copy.id]);
  }

  protected async remove(offer: AdminOfferListItemDto): Promise<void> {
    if (await this.rows.run(offer.id, () => this.actions.remove(offer))) {
      this.notice.set(`Se borró «${offer.name}».`);
      this.list.reload();
    }
  }

  private async change(
    offer: AdminOfferListItemDto,
    action: () => Promise<AdminOfferListItemDto | null>,
    message: string,
  ): Promise<void> {
    const updated = await this.rows.run(offer.id, action);
    if (updated) {
      this.notice.set(`${message} «${updated.name}».`);
      this.list.reload();
    }
  }
}
