import { Component, computed, inject, output, signal } from '@angular/core';
import {
  AdminCalendarApi,
  AdminCalendarEventDto,
  CALENDAR_CATEGORY_VALUES,
  CALENDAR_EVENT_KIND_VALUES,
  CalendarCategory,
  CalendarEventKind,
} from 'data-access';
import { firstValueFrom } from 'rxjs';
import { AdminAccess } from '../../core/access/admin-access';
import { FilterBar } from '../../shared/filters/filter-bar';
import { FilterOption, FilterSelect, optionsFrom } from '../../shared/filters/filter-select';
import { offerOptions } from '../../shared/filters/offer-options';
import { formatDateTime } from '../../shared/format/format';
import { listController } from '../../shared/list/list-controller';
import { ListStates } from '../../shared/list/list-states';
import { Pagination } from '../../shared/list/pagination';
import { rowActions } from '../../shared/list/row-actions';
import { RowMenu } from '../../shared/row-menu/row-menu';
import { CALENDAR_CATEGORY_LABELS } from '../offers/offer-labels';
import { formatOfferDate } from '../offers/shared/zoned-time';
import { AUDIENCE_LABELS, CALENDAR_KIND_LABELS, CATEGORY_CLASS } from './calendar-labels';

type Status = 'SCHEDULED' | 'CANCELLED';

/** Eventos manuales y fechas importantes: filtrar, editar, cancelar y borrar. */
@Component({
  selector: 'adm-events-tab',
  imports: [FilterBar, FilterSelect, ListStates, Pagination, RowMenu],
  templateUrl: './events-tab.html',
  styleUrl: './events-tab.scss',
})
export class EventsTab {
  readonly edit = output<AdminCalendarEventDto>();
  /** Aviso del resultado de una acción. */
  readonly notice = output<string>();

  private readonly api = inject(AdminCalendarApi);
  private readonly access = inject(AdminAccess);
  protected readonly canWrite = computed(() => this.access.can('offers.write'));

  protected readonly kindLabels = CALENDAR_KIND_LABELS;
  protected readonly categoryLabels = CALENDAR_CATEGORY_LABELS;
  protected readonly categoryClass = CATEGORY_CLASS;
  protected readonly audienceLabels = AUDIENCE_LABELS;
  protected readonly formatDateTime = formatDateTime;
  protected readonly formatDate = formatOfferDate;

  protected readonly kind = signal<CalendarEventKind | ''>('');
  protected readonly category = signal<CalendarCategory | ''>('');
  protected readonly status = signal<Status | ''>('SCHEDULED');
  protected readonly offerId = signal('');
  protected readonly options = {
    offers: offerOptions(),
    kind: optionsFrom(CALENDAR_EVENT_KIND_VALUES, CALENDAR_KIND_LABELS),
    category: optionsFrom(CALENDAR_CATEGORY_VALUES, CALENDAR_CATEGORY_LABELS),
    status: [
      { value: 'SCHEDULED', label: 'Programados' },
      { value: 'CANCELLED', label: 'Cancelados' },
    ] as FilterOption<Status>[],
  };

  // La API de eventos no tiene búsqueda: no se envía `q`.
  protected readonly list = listController({
    fetch: ({ q: _q, ...query }) => this.api.events(query),
    filters: () => ({
      kind: this.kind(),
      category: this.category(),
      status: this.status(),
      offerId: this.offerId(),
    }),
  });
  protected readonly rows = rowActions();

  protected clearFilters(): void {
    this.kind.set('');
    this.category.set('');
    this.status.set('');
    this.offerId.set('');
  }

  reload(): void {
    this.list.reload();
  }

  protected async cancel(event: AdminCalendarEventDto): Promise<void> {
    const updated = await this.rows.confirmRun(
      event.id,
      {
        title: `¿Cancelar «${event.title}»?`,
        message:
          'Seguirá visible en el calendario como «Cancelado» y sin enlace. No se avisa a nadie.',
        confirmLabel: 'Cancelar evento',
      },
      () => firstValueFrom(this.api.cancelEvent(event.id)),
    );
    if (updated) {
      this.list.replace((e) => e.id === event.id, updated);
      this.notice.emit(`Se canceló «${event.title}».`);
    }
  }

  protected async remove(event: AdminCalendarEventDto): Promise<void> {
    const done = await this.rows.confirmRun(
      event.id,
      {
        title: `¿Borrar «${event.title}»?`,
        message: 'Desaparece del calendario. Si quieres que se vea como cancelado, cancélalo.',
        confirmLabel: 'Borrar',
        variant: 'error',
      },
      async () => {
        await firstValueFrom(this.api.removeEvent(event.id), { defaultValue: undefined });
        return true;
      },
    );
    if (done) {
      this.notice.emit(`Se borró «${event.title}».`);
      this.list.reload();
    }
  }
}
