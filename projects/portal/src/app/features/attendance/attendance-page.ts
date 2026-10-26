import { Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { SessionStore } from 'auth';
import {
  ApiResponse,
  participantAttendance,
  SessionCardDto,
  SessionsApi,
  toApiError,
} from 'data-access';
import { firstValueFrom, map } from 'rxjs';
import { Crumb, usePageHeading } from '../../core/page-heading/page-heading';
import { dateTimeIn } from '../../shared/applications/application-format';
import { cdmxTime, dayParts, sessionWhen } from '../classroom/classroom-format';
import { SessionJoin } from '../classroom/session-join';
import { browserTimezone } from '../dashboard/dashboard-format';
import { FORMATION_TYPES, formationPath, FormationSlug } from '../formation/formation-options';
import { remainingLabel } from './attendance-format';

/** Máximo del comentario "¿Qué te llevas de esta sesión?". */
export const COMMENT_MAX = 500;

type View = 'form' | 'registered' | 'closed' | 'not-open' | 'cancelled';

/** Errores del registro que cambian el estado de la sesión: se vuelve a pedir. */
const STATE_ERRORS = [
  'ATTENDANCE_ALREADY_REGISTERED',
  'ATTENDANCE_WINDOW_CLOSED',
  'ATTENDANCE_NOT_OPEN_YET',
  'SESSION_CANCELLED',
];

/**
 * Registro de asistencia (HU-18; destino de la notificación y del correo):
 * "Asistí a la sesión" + qué te llevas, dentro de la ventana que abre al
 * terminar la sesión (24 h). Fuera de ella, el registro queda cerrado y se
 * pide la corrección al equipo (HU-30). Abajo, otras sesiones por registrar.
 */
@Component({
  selector: 'portal-attendance-page',
  imports: [RouterLink, SessionJoin],
  templateUrl: './attendance-page.html',
  styleUrls: ['./attendance-page.scss', './attendance-states.scss'],
})
export default class AttendancePage {
  private readonly api = inject(SessionsApi);
  private readonly user = inject(SessionStore).user;
  private readonly heading = usePageHeading();

  /** Sesión (`/asistencia/:sessionId`). */
  readonly sessionId = input.required<string>();

  protected readonly commentMax = COMMENT_MAX;
  protected readonly timezone = computed(() => this.user()?.timezone ?? browserTimezone());
  /** Reloj para la cuenta regresiva del cierre (cada minuto). */
  protected readonly now = signal(Date.now());

  protected readonly session = rxResource({
    params: () => this.sessionId(),
    stream: ({ params }) => this.api.byId(params),
  });
  /** Otras sesiones con el registro abierto (de todas mis formaciones en línea). */
  private readonly past = rxResource({
    params: () => this.sessionId(),
    stream: () =>
      this.api.list({ scope: 'PAST', pageSize: 50 }).pipe(map((response) => response.data)),
  });

  /** Respuesta del registro (sesión ya registrada y progreso recalculado). */
  protected readonly result = signal<ApiResponse<'LiveSessions_registerAttendance'> | null>(null);
  protected readonly current = computed<SessionCardDto | undefined>(
    () => this.result()?.session ?? (this.session.hasValue() ? this.session.value() : undefined),
  );
  protected readonly attendance = computed(() => {
    const session = this.current();
    return session ? participantAttendance(session) : null;
  });

  protected readonly view = computed<View | null>(() => {
    const session = this.current();
    if (!session) return null;
    const a = this.attendance();
    if (session.status === 'CANCELLED' || a?.status === 'NOT_APPLICABLE') return 'cancelled';
    if (a?.status === 'REGISTERED') return 'registered';
    if (a) {
      if (a.windowState === 'NOT_OPEN_YET') return 'not-open';
      return a.canRegister ? 'form' : 'closed';
    }
    // Sin la forma esperada: se decide por la hora y la API confirma al registrar.
    return new Date(session.endsAt).getTime() > this.now() ? 'not-open' : 'form';
  });

  protected readonly others = computed(() =>
    (this.past.hasValue() ? this.past.value() : []).filter(
      (s) => s.id !== this.sessionId() && participantAttendance(s)?.canRegister,
    ),
  );

  protected readonly attended = signal(false);
  protected readonly comment = signal('');
  protected readonly sending = signal(false);
  protected readonly formError = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);

  protected readonly pageError = computed(() => {
    const error = this.session.error();
    if (!error) return null;
    const apiError = toApiError(error);
    // TODO(contenido): confirmar los textos sin acceso a la sesión.
    switch (apiError.code) {
      case 'ENROLLMENT_REQUIRED':
        return 'Esta sesión es solo para personas inscritas en la formación.';
      case 'ENROLLMENT_SUSPENDED':
        return 'Tu acceso está en pausa por un pago pendiente. Al regularizarlo podrás registrar tu asistencia.';
      case 'NOT_FOUND':
        return 'No encontramos esta sesión. Revisa el enlace o entra desde tu aula.';
      default:
        return apiError.message;
    }
  });

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), 60_000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));

    effect(() => {
      const session = this.current();
      const crumbs: Crumb[] = [];
      if (session) {
        const path = formationPath(session.offer.type);
        const slug = path.split('/').pop() as FormationSlug;
        crumbs.push(
          { label: FORMATION_TYPES[slug].label, link: path },
          { label: session.offer.name, link: `/formacion/aula/${session.offer.id}` },
          { label: 'Asistencia' },
        );
      }
      this.heading.set({ title: 'Registro de asistencia', breadcrumb: crumbs });
    });
  }

  protected title(session: SessionCardDto): string {
    return session.module
      ? `Módulo ${session.module.number} · ${session.module.title}`
      : session.offer.name;
  }

  protected when(session: SessionCardDto): string {
    return sessionWhen(session, this.timezone());
  }

  protected cdmx(iso: string): string | null {
    return cdmxTime(iso, this.timezone());
  }

  protected date(iso: string): string {
    return dateTimeIn(iso, this.timezone());
  }

  protected day(iso: string) {
    return dayParts(iso, this.timezone());
  }

  protected remaining(iso: string): string | null {
    return remainingLabel(iso, this.now());
  }

  protected async register(): Promise<void> {
    this.formError.set(null);
    this.notice.set(null);
    if (!this.attended()) {
      this.formError.set('Marca «Asistí a la sesión» para registrar tu asistencia.');
      return;
    }
    this.sending.set(true);
    try {
      const comment = this.comment().trim();
      this.result.set(
        await firstValueFrom(
          this.api.registerAttendance(this.sessionId(), {
            attended: true,
            ...(comment ? { comment } : {}),
          }),
        ),
      );
    } catch (error) {
      const apiError = toApiError(error);
      if (STATE_ERRORS.includes(apiError.code)) {
        // La sesión cambió (ya registrada, cerrada…): se muestra su estado real.
        this.notice.set(apiError.message);
        this.session.reload();
      } else {
        this.formError.set(apiError.message);
      }
    } finally {
      this.sending.set(false);
    }
  }
}
