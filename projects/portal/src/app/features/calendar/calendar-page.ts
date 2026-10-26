import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SessionStore } from 'auth';
import { CalendarApi, CalendarCategory, CalendarItemDto, toApiError } from 'data-access';
import { map } from 'rxjs';
import { usePageHeading } from '../../core/page-heading/page-heading';
import { browserTimezone } from '../dashboard/dashboard-format';
import {
  CALENDAR_CATEGORIES,
  CALENDAR_VIEWS,
  CalendarView,
  CATEGORY_BY_VALUE,
  isCalendarView,
  WEEKDAYS,
} from './calendar-options';
import {
  addDays,
  addMonths,
  dayKeyIn,
  dayStartIso,
  durationLabel,
  formatDay,
  formatMonth,
  formatWeek,
  isDayKey,
  monthGrid,
  monthStart,
  timeIn,
  todayIn,
  weekStart,
} from './calendar-time';
import { EventDetail } from './event-detail/event-detail';

/** Actividades visibles por día en la vista de mes (el resto, "+N más"). */
const MAX_PER_CELL = 3;

/**
 * Calendario central (HU-10, Figma): mes, semana, día y lista, con las
 * categorías de color como filtro (en cliente, sin recargar) y el detalle de
 * cada actividad. Vista y fecha van en la URL (`?vista=`, `?fecha=`); las
 * horas y los días se muestran en la zona horaria de la persona.
 */
@Component({
  selector: 'portal-calendar-page',
  imports: [NgTemplateOutlet, RouterLink, EventDetail],
  templateUrl: './calendar-page.html',
  styleUrls: ['./calendar-page.scss', './calendar-views.scss'],
})
export default class CalendarPage {
  private readonly api = inject(CalendarApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly user = inject(SessionStore).user;

  readonly vista = input<string>();
  readonly fecha = input<string>();

  protected readonly categories = CALENDAR_CATEGORIES;
  protected readonly views = CALENDAR_VIEWS;
  protected readonly weekdays = WEEKDAYS;
  protected readonly maxPerCell = MAX_PER_CELL;

  protected readonly timezone = computed(() => this.user()?.timezone ?? browserTimezone());
  protected readonly today = computed(() => todayIn(this.timezone()));
  protected readonly view = computed<CalendarView>(() => {
    const value = this.vista();
    return isCalendarView(value) ? value : 'mes';
  });
  /** Día de referencia del periodo visible. */
  protected readonly anchor = computed(() => {
    const value = this.fecha();
    return isDayKey(value) ? value : this.today();
  });

  /** Categorías marcadas en los chips; ninguna = todas. */
  protected readonly selected = signal<ReadonlySet<CalendarCategory>>(new Set());
  /** Actividad abierta en el detalle. */
  protected readonly opened = signal<CalendarItemDto | null>(null);

  protected readonly grid = computed(() => monthGrid(this.anchor()));
  protected readonly weekDays = computed(() => {
    const start = weekStart(this.anchor());
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  });

  /** Rango que se pide a la API según la vista (`to` exclusivo, máx. 62 días). */
  private readonly range = computed(() => {
    const anchor = this.anchor();
    switch (this.view()) {
      case 'mes': {
        const days = this.grid();
        return { from: days[0].key, to: addDays(days[days.length - 1].key, 1) };
      }
      case 'semana':
        return { from: this.weekDays()[0], to: addDays(this.weekDays()[0], 7) };
      case 'dia':
        return { from: anchor, to: addDays(anchor, 1) };
      case 'lista':
        return { from: monthStart(anchor), to: addMonths(anchor, 1) };
    }
  });

  protected readonly calendar = rxResource({
    params: () => {
      const { from, to } = this.range();
      const tz = this.timezone();
      return { from: dayStartIso(from, tz), to: dayStartIso(to, tz) };
    },
    stream: ({ params }) => this.api.get(params).pipe(map((r) => r.data)),
    defaultValue: [],
  });
  protected readonly loadError = computed(() => {
    const error = this.calendar.error();
    return error ? toApiError(error).message : null;
  });

  /** Actividades por día (en la zona de la persona), ya filtradas por categoría. */
  protected readonly byDay = computed(() => {
    const selected = this.selected();
    const tz = this.timezone();
    const days = new Map<string, CalendarItemDto[]>();
    for (const item of this.calendar.value()) {
      if (selected.size && !selected.has(item.category)) continue;
      const key = dayKeyIn(item.startsAt, tz);
      days.set(key, [...(days.get(key) ?? []), item]);
    }
    return days;
  });
  /** Vista de lista: días con actividades del mes, en orden. */
  protected readonly agenda = computed(() => {
    const month = this.anchor().slice(0, 7);
    return [...this.byDay().entries()]
      .filter(([key]) => key.startsWith(month))
      .sort(([a], [b]) => a.localeCompare(b));
  });

  protected readonly periodTitle = computed(() => {
    const anchor = this.anchor();
    switch (this.view()) {
      case 'semana':
        return formatWeek(this.weekDays()[0]);
      case 'dia':
        return formatDay(anchor);
      default:
        return formatMonth(anchor);
    }
  });

  constructor() {
    usePageHeading().set({ title: 'Calendario' });
  }

  protected eventsOf(key: string): CalendarItemDto[] {
    return this.byDay().get(key) ?? [];
  }

  protected color(item: CalendarItemDto): string {
    return CATEGORY_BY_VALUE.get(item.category)?.color ?? 'var(--color-primary)';
  }

  /** "13:00 · Clase 3" (o solo el título si es de todo el día). */
  protected pillText(item: CalendarItemDto): string {
    return item.allDay ? item.title : `${timeIn(item.startsAt, this.timezone())} · ${item.title}`;
  }

  /** "13:00 – 14:00 (1 h)" para la semana, el día y la lista. */
  protected timeRange(item: CalendarItemDto): string {
    if (item.allDay) return 'Todo el día';
    const tz = this.timezone();
    const end = item.endsAt ? ` – ${timeIn(item.endsAt, tz)}` : '';
    const duration = durationLabel(item.startsAt, item.endsAt);
    return `${timeIn(item.startsAt, tz)}${end}${duration ? ` (${duration})` : ''}`;
  }

  protected dayTitle(key: string): string {
    return formatDay(key);
  }

  protected toggleCategory(category: CalendarCategory): void {
    this.selected.update((current) => {
      const next = new Set(current);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  protected shift(direction: -1 | 1): void {
    const anchor = this.anchor();
    const fecha =
      this.view() === 'semana'
        ? addDays(anchor, 7 * direction)
        : this.view() === 'dia'
          ? addDays(anchor, direction)
          : addMonths(anchor, direction);
    this.go({ fecha });
  }

  protected goToday(): void {
    this.go({ fecha: null });
  }

  protected openDay(key: string): void {
    this.go({ vista: 'dia', fecha: key });
  }

  protected go(params: { vista?: CalendarView | null; fecha?: string | null }): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }
}
