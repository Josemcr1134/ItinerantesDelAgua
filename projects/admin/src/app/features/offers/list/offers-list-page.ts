import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
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
  Paginated,
  requestState,
} from 'data-access';
import { Button } from 'ui-kit';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AdminAccess } from '../../../core/access/admin-access';
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

const PAGE_SIZE = 20;

/**
 * Oferta formativa (HU-27): listado con filtros, estado y conteos. Las
 * acciones dependen de los permisos: `offers.write` edita y crea;
 * `offers.publish` publica, despublica, archiva, duplica y borra borradores.
 */
@Component({
  selector: 'adm-offers-list-page',
  imports: [FormsModule, RouterLink, Button, RowMenu, NewOfferDialog],
  templateUrl: './offers-list-page.html',
  styleUrl: './offers-list-page.scss',
})
export default class OffersListPage {
  private readonly api = inject(AdminOffersApi);
  private readonly actions = inject(OfferActions);
  private readonly router = inject(Router);
  protected readonly access = inject(AdminAccess);

  protected readonly canWrite = computed(() => this.access.permissions().has('offers.write'));
  protected readonly canPublish = computed(() => this.access.permissions().has('offers.publish'));
  protected readonly publicSiteUrl = environment.publicSiteUrl;

  protected readonly types = OFFER_TYPE_VALUES;
  protected readonly modalities = OFFER_MODALITY_VALUES;
  protected readonly origins = OFFER_ORIGIN_VALUES;
  protected readonly statuses = ADMIN_OFFER_STATUS_VALUES;
  protected readonly typeLabels = OFFER_TYPE_LABELS;
  protected readonly modalityLabels = OFFER_MODALITY_LABELS;
  protected readonly originLabels = OFFER_ORIGIN_LABELS;
  protected readonly statusLabels = OFFER_STATUS_LABELS;
  protected readonly formatDate = formatOfferDate;

  // --- Filtros ---
  protected readonly searchText = signal('');
  private readonly search = toSignal(
    toObservable(this.searchText).pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' },
  );
  protected readonly type = signal<OfferType | ''>('');
  protected readonly modality = signal<OfferModality | ''>('');
  protected readonly origin = signal<OfferOrigin | ''>('');
  protected readonly status = signal<AdminOfferStatus | ''>('');
  protected readonly sort = signal<AdminOfferSort>('UPDATED_DESC');
  protected readonly page = signal(1);

  private readonly query = computed(() => ({
    q: this.search().trim() || undefined,
    type: this.type() || undefined,
    modality: this.modality() || undefined,
    origin: this.origin() || undefined,
    status: this.status() || undefined,
    sort: this.sort(),
    page: this.page(),
    pageSize: PAGE_SIZE,
  }));

  protected readonly list = requestState<Paginated<AdminOfferListItemDto>>();
  protected readonly offers = computed(() => this.list.data()?.data ?? []);
  protected readonly meta = computed(() => this.list.data()?.meta ?? null);
  protected readonly hasFilters = computed(
    () => !!(this.search() || this.type() || this.modality() || this.origin() || this.status()),
  );
  protected readonly notice = signal('');
  protected readonly busyId = signal<string | null>(null);
  protected readonly creating = signal(false);

  constructor() {
    effect(() => {
      this.search();
      this.type();
      this.modality();
      this.origin();
      this.status();
      this.sort();
      untracked(() => this.page.set(1));
    });
    effect(() => {
      const query = this.query();
      untracked(() => void this.list.run(this.api.list(query)));
    });
  }

  protected reload(): void {
    void this.list.run(this.api.list(this.query()));
  }

  protected clearFilters(): void {
    this.searchText.set('');
    this.type.set('');
    this.modality.set('');
    this.origin.set('');
    this.status.set('');
  }

  protected previewUrl(offer: AdminOfferListItemDto): string | null {
    return this.publicSiteUrl
      ? `${this.publicSiteUrl.replace(/\/$/, '')}${offer.publicPath}`
      : null;
  }

  // --- Acciones de estado ---
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

  protected async publish(offer: AdminOfferListItemDto): Promise<void> {
    await this.change(offer, () => this.actions.publish(offer), 'Se publicó');
  }

  protected async unpublish(offer: AdminOfferListItemDto): Promise<void> {
    await this.change(offer, () => this.actions.unpublish(offer), 'Volvió a borrador');
  }

  protected async archive(offer: AdminOfferListItemDto): Promise<void> {
    await this.change(offer, () => this.actions.archive(offer), 'Se archivó');
  }

  protected async duplicate(offer: AdminOfferListItemDto): Promise<void> {
    this.busyId.set(offer.id);
    const copy = await this.actions.duplicate(offer);
    this.busyId.set(null);
    if (copy) {
      await this.router.navigate(['/ofertas', copy.id]);
    }
  }

  protected async remove(offer: AdminOfferListItemDto): Promise<void> {
    this.busyId.set(offer.id);
    const removed = await this.actions.remove(offer);
    this.busyId.set(null);
    if (removed) {
      this.notice.set(`Se borró «${offer.name}».`);
      this.reload();
    }
  }

  private async change(
    offer: AdminOfferListItemDto,
    action: () => Promise<AdminOfferListItemDto | null>,
    message: string,
  ): Promise<void> {
    this.busyId.set(offer.id);
    const updated = await action();
    this.busyId.set(null);
    if (updated) {
      this.notice.set(`${message} «${updated.name}».`);
      this.reload();
    }
  }
}
