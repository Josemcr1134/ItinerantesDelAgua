import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  AdminFollowUpApi,
  FunnelOfferDto,
  OfferFunnelDto,
  Paginated,
  requestState,
} from 'data-access';
import { firstValueFrom } from 'rxjs';
import { Button } from 'ui-kit';
import { AdminAccess } from '../../core/access/admin-access';
import { ErrorPresenter } from '../../core/error-presenter';
import { formatDateTime } from '../../shared/format/format';
import { Notice } from '../../shared/notice/notice';
import { PageHeader } from '../../shared/page-header/page-header';
import { ReasonDialog } from '../../shared/reason-dialog/reason-dialog';
import { RequestState } from '../../shared/request-state/request-state';
import { OFFER_TYPE_LABELS } from '../offers/offer-labels';
import { FollowUpList } from './follow-up-list';
import { FunnelView } from './funnel-view';

/**
 * Seguimiento (HU-32): por oferta, el embudo de conversión y las personas
 * aprobadas sin pagar o vencidas, para contactarlas. La oferta va en la URL
 * (`?oferta=`). Ver requiere `followup.read`; cerrar inscripciones y
 * contactar, `followup.manage`.
 */
@Component({
  selector: 'adm-follow-up-page',
  imports: [Button, Notice, PageHeader, ReasonDialog, RequestState, FunnelView, FollowUpList],
  templateUrl: './follow-up-page.html',
  styleUrl: './follow-up-page.scss',
})
export default class FollowUpPage implements OnInit {
  /** `?oferta=<id>`. */
  readonly oferta = input<string>();

  private readonly api = inject(AdminFollowUpApi);
  private readonly router = inject(Router);
  private readonly errors = inject(ErrorPresenter);
  private readonly access = inject(AdminAccess);
  protected readonly canManage = computed(() => this.access.can('followup.manage'));
  protected readonly typeLabels = OFFER_TYPE_LABELS;

  protected readonly offers = requestState<Paginated<FunnelOfferDto>>();
  protected readonly funnel = requestState<OfferFunnelDto>();
  protected readonly notice = signal('');

  /** Oferta elegida (la de la URL o, si no, la más reciente). */
  protected readonly offerId = computed(
    () => this.oferta() || this.offers.data()?.data[0]?.id || null,
  );
  protected readonly offer = computed(
    () => this.offers.data()?.data.find((o) => o.id === this.offerId()) ?? null,
  );

  protected readonly closing = signal(false);
  protected readonly closeBusy = signal(false);

  constructor() {
    effect(() => {
      const id = this.offerId();
      untracked(() => {
        this.notice.set('');
        if (id) void this.funnel.run(this.api.funnel(id));
      });
    });
  }

  ngOnInit(): void {
    this.loadOffers();
  }

  protected loadOffers(): void {
    void this.offers.run(this.api.offers({ pageSize: 100 }));
  }

  protected pick(offerId: string): void {
    void this.router.navigate([], {
      queryParams: { oferta: offerId },
      queryParamsHandling: 'merge',
    });
  }

  protected reloadFunnel(): void {
    const id = this.offerId();
    if (id) void this.funnel.run(this.api.funnel(id));
  }

  protected async closeEnrollment(reason: string): Promise<void> {
    const id = this.offerId();
    if (!id) return;
    this.closeBusy.set(true);
    try {
      const result = await firstValueFrom(this.api.closeEnrollment(id, reason ? { reason } : {}));
      this.closing.set(false);
      this.notice.set(
        `Se cerraron las inscripciones de «${this.offer()?.name}» (${formatDateTime(result.enrollmentClosesAt)}).`,
      );
    } catch (error) {
      void this.errors.present(error);
    } finally {
      this.closeBusy.set(false);
    }
  }
}
