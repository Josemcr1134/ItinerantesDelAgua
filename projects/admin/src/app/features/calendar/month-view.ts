import { Component, computed, input, output } from '@angular/core';
import { AdminCalendarItemDto } from 'data-access';
import {
  CALENDAR_KIND_LABELS,
  CalendarDay,
  CATEGORY_CLASS,
  dayKeyOf,
  formatDayKey,
  formatTime,
  todayKey,
} from './calendar-labels';

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;
/** Elementos visibles por día en la cuadrícula (el resto, "+N más"). */
const MAX_PER_DAY = 3;

/**
 * Mes del calendario: cuadrícula de lunes a domingo (desde md) o agenda por
 * día (en móvil), con cada elemento en el color de su categoría.
 */
@Component({
  selector: 'adm-month-view',
  templateUrl: './month-view.html',
  styleUrl: './month-view.scss',
})
export class MonthView {
  readonly days = input.required<readonly CalendarDay[]>();
  readonly items = input.required<readonly AdminCalendarItemDto[]>();
  readonly selectItem = output<AdminCalendarItemDto>();
  /** Clic en un día (para crear un evento ese día). */
  readonly selectDay = output<string>();

  protected readonly weekdays = WEEKDAYS;
  protected readonly maxPerDay = MAX_PER_DAY;
  protected readonly categoryClass = CATEGORY_CLASS;
  protected readonly kindLabels = CALENDAR_KIND_LABELS;
  protected readonly formatTime = formatTime;
  protected readonly formatDay = formatDayKey;
  protected readonly today = todayKey();

  /** Elementos por día (CDMX), en orden de inicio. */
  protected readonly byDay = computed(() => {
    const map = new Map<string, AdminCalendarItemDto[]>();
    for (const item of [...this.items()].sort((a, b) => a.startsAt.localeCompare(b.startsAt))) {
      const key = dayKeyOf(item.startsAt);
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return map;
  });

  /** Días del mes con algo, para la agenda. */
  protected readonly agenda = computed(() =>
    this.days()
      .filter((d) => d.inMonth && this.byDay().has(d.key))
      .map((d) => ({ day: d, items: this.byDay().get(d.key) ?? [] })),
  );

  protected itemsOf(key: string): readonly AdminCalendarItemDto[] {
    return this.byDay().get(key) ?? [];
  }

  /** "18:00 · Sesión · Diplomado…" para lectores de pantalla y el título. */
  protected describe(item: AdminCalendarItemDto): string {
    const parts = [
      item.allDay ? 'Todo el día' : formatTime(item.startsAt),
      this.kindLabels[item.kind],
      item.title,
    ];
    if (item.offer) parts.push(item.offer.name);
    if (item.status === 'CANCELLED') parts.push('cancelado');
    if (item.edited) parts.push('reprogramada');
    if (item.missingLink) parts.push('sin enlace');
    return parts.join(' · ');
  }
}
