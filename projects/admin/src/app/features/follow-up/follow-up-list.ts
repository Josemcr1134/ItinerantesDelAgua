import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminFollowUpApi, FollowUpItemDto, FollowUpTab } from 'data-access';
import { AdminAccess } from '../../core/access/admin-access';
import { ErrorPresenter } from '../../core/error-presenter';
import { FilterOption, FilterSelect } from '../../shared/filters/filter-select';
import { formatDateTime, formatMoney } from '../../shared/format/format';
import { listController } from '../../shared/list/list-controller';
import { ListStates } from '../../shared/list/list-states';
import { Notice } from '../../shared/notice/notice';
import { Person } from '../../shared/person/person';
import { FOLLOW_UP_OUTCOME_LABELS } from '../applications/application-labels';
import { FollowUpActions } from '../applications/follow-up-actions';
import { Pagination } from 'ui-kit';

type Started = 'true' | 'false';

/**
 * "Aprobados sin pagar" y "Vencidas" de una oferta (HU-32): contacto, saldo,
 * plazo (los que vencen en 2 días o menos, destacados) y último contacto.
 * Con `followup.manage`: recordatorio por correo y WhatsApp.
 */
@Component({
  selector: 'adm-follow-up-list',
  imports: [RouterLink, FilterSelect, ListStates, Pagination, Notice, Person],
  templateUrl: './follow-up-list.html',
  styleUrl: './follow-up-list.scss',
})
export class FollowUpList {
  readonly offerId = input.required<string>();

  private readonly api = inject(AdminFollowUpApi);
  private readonly actions = inject(FollowUpActions);
  private readonly errors = inject(ErrorPresenter);
  private readonly access = inject(AdminAccess);
  protected readonly canManage = computed(() => this.access.can('followup.manage'));
  protected readonly canOpenApplication = computed(() => this.access.can('applications.read'));

  protected readonly outcomeLabels = FOLLOW_UP_OUTCOME_LABELS;
  protected readonly money = formatMoney;
  protected readonly formatDateTime = formatDateTime;

  protected readonly tab = signal<FollowUpTab>('PENDING');
  protected readonly started = signal<Started | ''>('');
  protected readonly startedOptions: FilterOption<Started>[] = [
    { value: 'true', label: 'Con pago iniciado' },
    { value: 'false', label: 'Sin pago iniciado' },
  ];
  protected readonly tabs: readonly { tab: FollowUpTab; label: string }[] = [
    { tab: 'PENDING', label: 'Aprobados sin pagar' },
    { tab: 'EXPIRED', label: 'Vencidas' },
  ];

  // La API no tiene búsqueda: no se envía `q`.
  protected readonly list = listController({
    fetch: ({ q: _q, offerId, started, ...query }) =>
      this.api.followUps(offerId ?? this.offerId(), {
        ...query,
        paymentStarted: started === undefined ? undefined : started === 'true',
      }),
    filters: () => ({ offerId: this.offerId(), tab: this.tab(), started: this.started() }),
    notFilters: ['offerId', 'tab'],
  });

  protected readonly busyId = signal<string | null>(null);
  protected readonly notice = signal('');

  constructor() {
    // Al cambiar de oferta, se vuelve a la primera pestaña sin filtros.
    effect(() => {
      this.offerId();
      untracked(() => {
        this.tab.set('PENDING');
        this.started.set('');
        this.notice.set('');
      });
    });
  }

  /** "Vence en 2 días" / "Vence hoy" / "Venció hace 3 días". */
  protected remaining(item: FollowUpItemDto): string | null {
    const days = item.remainingDays;
    if (days === null) return null;
    if (days < 0) return `Venció hace ${-days} ${-days === 1 ? 'día' : 'días'}`;
    if (days === 0) return 'Vence hoy';
    return `Vence en ${days} ${days === 1 ? 'día' : 'días'}`;
  }

  protected remind(item: FollowUpItemDto): Promise<void> {
    return this.run(item, () => this.actions.remind(item.applicationId));
  }

  protected whatsapp(item: FollowUpItemDto): Promise<void> {
    return this.run(item, () => this.actions.whatsapp(item.applicationId));
  }

  private async run(item: FollowUpItemDto, task: () => Promise<string>): Promise<void> {
    this.busyId.set(item.applicationId);
    try {
      const message = await task();
      this.notice.set(`${item.name}: ${message.charAt(0).toLowerCase()}${message.slice(1)}`);
      this.list.reload();
    } catch (error) {
      void this.errors.present(error);
    } finally {
      this.busyId.set(null);
    }
  }
}
