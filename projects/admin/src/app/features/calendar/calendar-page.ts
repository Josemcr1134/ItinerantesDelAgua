import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  AdminCalendarApi,
  AdminCalendarDto,
  AdminCalendarEventDto,
  AdminCalendarItemDto,
  CALENDAR_CATEGORY_VALUES,
  CalendarCategory,
  requestState,
} from 'data-access';
import { firstValueFrom } from 'rxjs';
import { Button } from 'ui-kit';
import { AdminAccess } from '../../core/access/admin-access';
import { ErrorPresenter } from '../../core/error-presenter';
import { FilterSelect, optionsFrom } from '../../shared/filters/filter-select';
import { offerOptions } from '../../shared/filters/offer-options';
import { dayEndIso, dayStartIso } from '../../shared/format/date-range';
import { Notice } from '../../shared/notice/notice';
import { PageHeader } from '../../shared/page-header/page-header';
import { RequestState } from '../../shared/request-state/request-state';
import { CALENDAR_CATEGORY_LABELS } from '../offers/offer-labels';
import {
  CATEGORY_CLASS,
  dayKeyOf,
  formatMonth,
  monthGrid,
  normalizeMonth,
  shiftMonth,
  todayKey,
} from './calendar-labels';
import { EventFormDialog } from './event-form-dialog';
import { EventsTab } from './events-tab';
import { MonthView } from './month-view';

type View = 'mes' | 'eventos';

/**
 * Calendario del panel (HU-29): sesiones de todas las ofertas y eventos por
 * mes, en el color de su categoría, y la lista de eventos manuales y fechas
 * importantes. Vista y mes en la URL (`?vista=&mes=AAAA-MM`). Ver requiere
 * `offers.read`; crear y cambiar eventos, `offers.write`.
 */
@Component({
  selector: 'adm-calendar-page',
  imports: [
    RouterLink,
    Button,
    FilterSelect,
    Notice,
    PageHeader,
    RequestState,
    MonthView,
    EventsTab,
    EventFormDialog,
  ],
  templateUrl: './calendar-page.html',
  styleUrl: './calendar-page.scss',
})
export default class CalendarPage {
  readonly vista = input<string>();
  readonly mes = input<string>();

  private readonly api = inject(AdminCalendarApi);
  private readonly router = inject(Router);
  private readonly errors = inject(ErrorPresenter);
  private readonly access = inject(AdminAccess);
  protected readonly canWrite = computed(() => this.access.can('offers.write'));

  protected readonly view = computed<View>(() => (this.vista() === 'eventos' ? 'eventos' : 'mes'));
  protected readonly month = computed(() => normalizeMonth(this.mes()));
  protected readonly monthTitle = computed(() => formatMonth(this.month()));
  protected readonly grid = computed(() => monthGrid(this.month()));
  protected readonly prevMonth = computed(() => shiftMonth(this.month(), -1));
  protected readonly nextMonth = computed(() => shiftMonth(this.month(), 1));
  protected readonly isCurrentMonth = computed(() => this.month() === todayKey().slice(0, 7));

  // --- Filtros del mes ---
  protected readonly offerId = signal('');
  protected readonly category = signal<CalendarCategory | ''>('');
  protected readonly options = {
    offers: offerOptions(),
    category: optionsFrom(CALENDAR_CATEGORY_VALUES, CALENDAR_CATEGORY_LABELS),
  };
  protected readonly legend = CALENDAR_CATEGORY_VALUES.map((c) => ({
    label: CALENDAR_CATEGORY_LABELS[c],
    className: CATEGORY_CLASS[c],
  }));

  protected readonly calendar = requestState<AdminCalendarDto>();
  protected readonly items = computed(() => this.calendar.data()?.data ?? []);
  protected readonly notice = signal('');

  // --- Diálogo de evento ---
  protected readonly formOpen = signal(false);
  protected readonly editing = signal<AdminCalendarEventDto | null>(null);
  protected readonly newDate = signal('');
  private readonly eventsTab = viewChild(EventsTab);

  constructor() {
    effect(() => {
      if (this.view() !== 'mes') return;
      const { from, to } = this.grid();
      const query = {
        from,
        to,
        offerId: this.offerId() || undefined,
        category: this.category() || undefined,
      };
      untracked(() => void this.calendar.run(this.api.view(query)));
    });
  }

  protected reload(): void {
    const { from, to } = this.grid();
    void this.calendar.run(
      this.api.view({
        from,
        to,
        offerId: this.offerId() || undefined,
        category: this.category() || undefined,
      }),
    );
  }

  protected openNew(date = ''): void {
    this.editing.set(null);
    this.newDate.set(date || (this.isCurrentMonth() ? todayKey() : `${this.month()}-01`));
    this.formOpen.set(true);
  }

  protected openEdit(event: AdminCalendarEventDto): void {
    this.editing.set(event);
    this.formOpen.set(true);
  }

  protected onSaved(event: AdminCalendarEventDto): void {
    this.notice.set(this.editing() ? `Se guardó «${event.title}».` : `Se creó «${event.title}».`);
    if (this.view() === 'mes') this.reload();
    else this.eventsTab()?.reload();
  }

  /** Sesión → sus sesiones en la oferta; evento → editarlo (con `offers.write`). */
  protected async selectItem(item: AdminCalendarItemDto): Promise<void> {
    if (item.source === 'SESSION') {
      if (item.offer) void this.router.navigate(['/ofertas', item.offer.id, 'sesiones']);
      return;
    }
    if (!this.canWrite()) return;
    // La API no tiene detalle por id: se busca en los eventos de ese día.
    const day = dayKeyOf(item.startsAt);
    try {
      const page = await firstValueFrom(
        this.api.events({
          from: dayStartIso(day),
          to: dayEndIso(day),
          pageSize: 100,
        }),
      );
      const event = page.data.find((e) => e.id === item.id);
      if (event) this.openEdit(event);
    } catch (error) {
      void this.errors.present(error);
    }
  }

  protected selectDay(day: string): void {
    if (this.canWrite()) this.openNew(day);
  }
}
