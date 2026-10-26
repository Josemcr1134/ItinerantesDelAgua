import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ClassroomsApi, participantAttendance, SessionCardDto, toApiError } from 'data-access';
import { map } from 'rxjs';
import {
  ATTENDANCE_LABELS,
  cdmxTime,
  dayParts,
  RECORDING_LABELS,
  sessionWhen,
} from '../classroom-format';
import { timeIn } from '../../calendar/calendar-time';
import { weekdayDateIn } from '../../scholarships/scholarship-format';
import { SessionJoin } from '../session-join';

/**
 * Sesiones del aula (HU-17): próximas con su acceso y pasadas con la
 * grabación y la asistencia (Pendiente lleva a registrarla).
 */
@Component({
  selector: 'portal-classroom-sessions',
  imports: [RouterLink, SessionJoin],
  templateUrl: './classroom-sessions.html',
  styleUrl: './classroom-sessions.scss',
})
export class ClassroomSessions {
  private readonly api = inject(ClassroomsApi);

  readonly offerId = input.required<string>();
  readonly timezone = input.required<string>();

  protected readonly recordings = RECORDING_LABELS;
  protected readonly attendanceLabels = ATTENDANCE_LABELS;
  protected readonly attendance = participantAttendance;

  protected readonly upcoming = rxResource({
    params: () => this.offerId(),
    stream: ({ params }) =>
      this.api.sessions(params, { scope: 'UPCOMING', pageSize: 20 }).pipe(map((r) => r.data)),
  });
  protected readonly past = rxResource({
    params: () => this.offerId(),
    stream: ({ params }) =>
      this.api.sessions(params, { scope: 'PAST', pageSize: 50 }).pipe(map((r) => r.data)),
  });
  protected readonly lists = computed(() => [
    {
      key: 'upcoming',
      title: 'Próximas sesiones',
      empty: 'No hay sesiones próximas.',
      items: this.upcoming.hasValue() ? this.upcoming.value() : null,
      error: this.upcoming.error(),
    },
    {
      key: 'past',
      title: 'Sesiones pasadas',
      empty: 'Aún no hay sesiones pasadas.',
      items: this.past.hasValue() ? this.past.value() : null,
      error: this.past.error(),
    },
  ]);

  protected title(session: SessionCardDto): string {
    return session.module
      ? `Módulo ${session.module.number} · ${session.module.title}`
      : session.offer.name;
  }

  protected when(session: Pick<SessionCardDto, 'startsAt' | 'endsAt'>): string {
    return sessionWhen(session, this.timezone());
  }

  /** "jue 22 oct 2026 · 18:00". */
  protected moment(iso: string): string {
    return `${weekdayDateIn(iso, this.timezone())} · ${timeIn(iso, this.timezone())}`;
  }

  protected cdmx(iso: string): string | null {
    return cdmxTime(iso, this.timezone());
  }

  protected day(iso: string) {
    return dayParts(iso, this.timezone());
  }

  protected message(error: unknown): string {
    return toApiError(error).message;
  }

  protected retry(key: string): void {
    (key === 'upcoming' ? this.upcoming : this.past).reload();
  }
}
