import { computed, inject, Injectable, signal } from '@angular/core';
import {
  AdminContentApi,
  AdminOfferDetailDto,
  AdminOffersApi,
  AdminSessionDto,
  AdminSessionsApi,
  ApiBody,
  GenerateSessionsBody,
  requestState,
} from 'data-access';
import { catchError, firstValueFrom, forkJoin, map, of } from 'rxjs';
import { ErrorPresenter } from '../../../core/error-presenter';
import { formatSessionSlot, notifiedText, sessionHours } from './session-labels';

/** Módulo para elegir en una sesión. */
export interface ModuleOption {
  readonly id: string;
  readonly label: string;
}

/**
 * Estado y operaciones de las sesiones de una oferta (HU-29). Se provee en
 * la página: los diálogos lo inyectan. Cada operación actualiza la lista con
 * la respuesta de la API, presenta el error si falla y devuelve `null`.
 */
@Injectable()
export class SessionsStore {
  private readonly api = inject(AdminSessionsApi);
  private readonly offersApi = inject(AdminOffersApi);
  private readonly contentApi = inject(AdminContentApi);
  private readonly errors = inject(ErrorPresenter);

  private readonly request =
    requestState<[readonly AdminSessionDto[], AdminOfferDetailDto, readonly ModuleOption[]]>();
  private readonly sessionsState = signal<readonly AdminSessionDto[] | null>(null);

  readonly sessions = computed(() => this.sessionsState() ?? []);
  readonly offer = computed(() => this.request.data()?.[1] ?? null);
  readonly modules = computed(() => this.request.data()?.[2] ?? []);
  readonly loaded = computed(() => this.sessionsState() !== null && this.offer() !== null);
  readonly error = computed(() => this.request.error());
  /** En línea: las sesiones llevan enlaces de videollamada y grabación. */
  readonly online = computed(() => this.offer()?.modality === 'ONLINE_LIVE');
  readonly notice = signal('');
  /** Sesión con una acción en curso (`'new'` al crear o generar). */
  readonly busyId = signal<string | null>(null);

  /** "12 sesiones · 24 h · 2 sin enlace · 1 grabación pendiente". */
  readonly summary = computed(() => {
    const active = this.sessions().filter((s) => s.status !== 'CANCELLED');
    const hours = active.reduce((sum, s) => sum + sessionHours(s.startsAt, s.endsAt), 0);
    return {
      count: active.length,
      hours: Math.round(hours * 10) / 10,
      cancelled: this.sessions().length - active.length,
      missingLink: active.filter((s) => s.flags.missingLink).length,
      recordingPending: active.filter((s) => s.flags.recordingPending).length,
    };
  });

  private offerId = '';

  async load(offerId: string): Promise<void> {
    this.offerId = offerId;
    const result = await this.request.run(
      forkJoin([
        this.api.list(offerId).pipe(map((r) => r.data)),
        this.offersApi.detail(offerId),
        // Los módulos solo sirven para elegir; si no cargan, se sigue sin ellos.
        this.contentApi.list(offerId).pipe(
          map((r) => r.modules.map((m) => ({ id: m.id, label: `Módulo ${m.number}: ${m.title}` }))),
          catchError(() => of([])),
        ),
      ]),
    );
    if (result) this.sessionsState.set(result[0]);
  }

  reload(): Promise<void> {
    return this.load(this.offerId);
  }

  async create(body: ApiBody<'AdminSessions_create'>): Promise<AdminSessionDto | null> {
    return this.run('new', async () => {
      const session = await firstValueFrom(this.api.create(this.offerId, body));
      this.sessionsState.set(sortByStart([...this.sessions(), session]));
      this.notice.set(
        `Se agregó la sesión del ${formatSessionSlot(session.startsAt, session.endsAt)}.`,
      );
      return session;
    });
  }

  previewGeneration(body: GenerateSessionsBody) {
    return this.run('new', () => firstValueFrom(this.api.preview(this.offerId, body)));
  }

  async generate(body: GenerateSessionsBody) {
    const result = await this.run('new', () =>
      firstValueFrom(this.api.generate(this.offerId, body)),
    );
    if (result) {
      // La regla y las fechas importantes pudieron cambiar en la oferta.
      await this.reload();
      this.notice.set(result.message);
    }
    return result;
  }

  async update(
    session: AdminSessionDto,
    body: ApiBody<'AdminSessions_update'>,
    message: string,
  ): Promise<AdminSessionDto | null> {
    return this.run(session.id, async () => {
      const result = await firstValueFrom(this.api.update(session.id, body));
      this.replace(result.session);
      this.notice.set(message + notifiedText(result.notifiedCount));
      return result.session;
    });
  }

  async reschedule(
    session: AdminSessionDto,
    body: ApiBody<'AdminSessions_reschedule'>,
  ): Promise<AdminSessionDto | null> {
    return this.run(session.id, async () => {
      const result = await firstValueFrom(this.api.reschedule(session.id, body));
      this.sessionsState.set(
        sortByStart(this.sessions().map((s) => (s.id === session.id ? result.session : s))),
      );
      this.notice.set(
        `La sesión pasó al ${formatSessionSlot(result.session.startsAt, result.session.endsAt)}.` +
          notifiedText(result.notifiedCount),
      );
      return result.session;
    });
  }

  async cancel(
    session: AdminSessionDto,
    body: ApiBody<'AdminSessions_cancel'>,
  ): Promise<AdminSessionDto | null> {
    return this.run(session.id, async () => {
      const result = await firstValueFrom(this.api.cancel(session.id, body));
      this.replace(result.session);
      this.notice.set(
        `Se canceló la sesión del ${formatSessionSlot(session.startsAt, session.endsAt)}.` +
          notifiedText(result.notifiedCount),
      );
      return result.session;
    });
  }

  async remove(session: AdminSessionDto): Promise<boolean> {
    const done = await this.run(session.id, async () => {
      await firstValueFrom(this.api.remove(session.id), { defaultValue: undefined });
      return true;
    });
    if (done) {
      this.sessionsState.set(this.sessions().filter((s) => s.id !== session.id));
      this.notice.set(
        `Se borró la sesión del ${formatSessionSlot(session.startsAt, session.endsAt)}.`,
      );
    }
    return !!done;
  }

  private replace(session: AdminSessionDto): void {
    this.sessionsState.set(this.sessions().map((s) => (s.id === session.id ? session : s)));
  }

  private async run<T>(id: string, task: () => Promise<T>): Promise<T | null> {
    this.busyId.set(id);
    try {
      return await task();
    } catch (error) {
      void this.errors.present(error);
      return null;
    } finally {
      this.busyId.set(null);
    }
  }
}

function sortByStart(sessions: readonly AdminSessionDto[]): AdminSessionDto[] {
  return [...sessions].sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
}
