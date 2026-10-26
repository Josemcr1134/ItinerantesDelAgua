import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CalendarItemDto } from 'data-access';
import { Button, Dialog } from 'ui-kit';
import { CATEGORY_BY_VALUE, KIND_LABELS } from '../calendar-options';
import { dayKeyIn, durationLabel, formatDay, timeIn } from '../calendar-time';

/** Hora oficial de las actividades (HU-11). */
const CDMX = 'America/Mexico_City';

/**
 * Detalle de una actividad del calendario: cuándo (tu hora y la de CDMX),
 * dónde, y el acceso a la sesión o al aula (HU-10 → HU-12).
 */
@Component({
  selector: 'portal-event-detail',
  imports: [RouterLink, Button, Dialog],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.scss',
})
export class EventDetail {
  /** Actividad abierta; `null` cierra el diálogo. */
  readonly event = input.required<CalendarItemDto | null>();
  readonly timezone = input.required<string>();
  readonly closed = output<void>();

  protected readonly kinds = KIND_LABELS;
  protected readonly category = computed(() => {
    const event = this.event();
    return event ? CATEGORY_BY_VALUE.get(event.category) : undefined;
  });

  /** "Viernes, 9 de octubre · 18:00 – 19:00 (1 h)". */
  protected readonly when = computed(() => {
    const event = this.event();
    if (!event) return '';
    const tz = this.timezone();
    const day = formatDay(dayKeyIn(event.startsAt, tz));
    if (event.allDay) return `${day} · Todo el día`;
    const end = event.endsAt ? ` – ${timeIn(event.endsAt, tz)}` : '';
    const duration = durationLabel(event.startsAt, event.endsAt);
    return `${day} · ${timeIn(event.startsAt, tz)}${end}${duration ? ` (${duration})` : ''}`;
  });

  /** "17:00 hora CDMX" si la persona está en otra zona. */
  protected readonly cdmx = computed(() => {
    const event = this.event();
    if (!event || event.allDay || this.timezone() === CDMX) return null;
    const own = timeIn(event.startsAt, this.timezone());
    const official = timeIn(event.startsAt, CDMX);
    return own === official ? null : `${official} hora CDMX`;
  });

  protected readonly opensAt = computed(() => {
    const join = this.event()?.join;
    return join?.state === 'NOT_YET' ? timeIn(join.opensAt, this.timezone()) : null;
  });

  protected onOpenChange(open: boolean): void {
    if (!open) this.closed.emit();
  }
}
