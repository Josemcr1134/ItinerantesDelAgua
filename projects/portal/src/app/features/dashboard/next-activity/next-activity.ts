import { Component, computed, effect, input, output } from '@angular/core';
import { CalendarItemDto } from 'data-access';
import { Button } from 'ui-kit';
import { cdmxTimeLabel, dayTimeLabel, timeLabel } from '../dashboard-format';

/**
 * "Próxima actividad" (HU-06 con el acceso de HU-12): la siguiente sesión o
 * evento con su hora en la zona de la persona (y la de CDMX si está en otra,
 * HU-11) y el botón para entrar.
 */
@Component({
  selector: 'portal-next-activity',
  imports: [Button],
  templateUrl: './next-activity.html',
  styleUrl: './next-activity.scss',
})
export class NextActivity {
  /** `null`: no hay actividades en los próximos días. */
  readonly activity = input.required<CalendarItemDto | null>();
  readonly timezone = input.required<string>();
  /** El enlace se habilita a una hora: al llegar, hay que volver a pedir la sesión. */
  readonly expired = output<void>();

  protected readonly when = computed(() => {
    const activity = this.activity();
    return activity ? dayTimeLabel(activity.startsAt, this.timezone()) : '';
  });
  /** "18:00 hora CDMX" si la persona está en otra zona. */
  protected readonly cdmx = computed(() => {
    const activity = this.activity();
    return activity && !activity.allDay ? cdmxTimeLabel(activity.startsAt, this.timezone()) : null;
  });
  protected readonly join = computed(() => this.activity()?.join ?? null);
  protected readonly opensAt = computed(() => {
    const join = this.join();
    return join?.state === 'NOT_YET' ? timeLabel(join.opensAt, this.timezone()) : null;
  });

  constructor() {
    effect((onCleanup) => {
      const join = this.join();
      if (join?.state !== 'NOT_YET') return;
      const wait = new Date(join.opensAt).getTime() - Date.now();
      // Tope de setTimeout (~24 días): más allá no tiene sentido esperar abierto.
      if (wait > 2 ** 31 - 1) return;
      const timer = setTimeout(() => this.expired.emit(), Math.max(wait, 0) + 1000);
      onCleanup(() => clearTimeout(timer));
    });
  }
}
