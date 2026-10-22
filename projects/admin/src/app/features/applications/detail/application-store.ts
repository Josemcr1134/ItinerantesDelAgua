import { computed, inject, Injectable, signal } from '@angular/core';
import { AdminApplicationDetailDto, AdminApplicationsApi, requestState } from 'data-access';
import { firstValueFrom, Observable } from 'rxjs';
import { AdminAccess } from '../../../core/access/admin-access';
import { ErrorPresenter } from '../../../core/error-presenter';
import { FOLLOW_UP_STATUSES } from '../application-labels';

/** Estados en los que el comité puede evaluar o agendar entrevista. */
const UNDER_REVIEW = ['SUBMITTED', 'IN_REVIEW', 'INTERVIEW_SCHEDULED'] as const;

/**
 * Estado y acciones del detalle de una postulación. Se provee en la página:
 * los paneles (evaluación, entrevista, decisión, seguimiento) lo inyectan.
 * Cada acción reemplaza el detalle con la respuesta de la API, presenta el
 * error si falla y devuelve `null` en ese caso.
 */
@Injectable()
export class ApplicationStore {
  private readonly api = inject(AdminApplicationsApi);
  private readonly errors = inject(ErrorPresenter);
  private readonly access = inject(AdminAccess);

  private readonly request = requestState<AdminApplicationDetailDto>();

  readonly application = computed(() => this.request.data());
  readonly error = computed(() => this.request.error());
  readonly loading = computed(() => this.request.loading());
  /** Mensaje del resultado de la última acción. */
  readonly notice = signal('');
  /** Acción en curso (deshabilita los botones de los paneles). */
  readonly busy = signal(false);

  readonly underReview = computed(() => {
    const status = this.application()?.status;
    return !!status && (UNDER_REVIEW as readonly string[]).includes(status);
  });
  readonly canEvaluate = computed(
    () => this.access.can('applications.evaluate') && this.underReview(),
  );
  readonly canInterview = computed(
    () => this.access.can('applications.interview') && this.underReview(),
  );
  readonly canDecide = computed(
    () => this.access.can('applications.decide') && !!this.application()?.decision.canDecide,
  );
  readonly canRetryEmail = computed(() => this.access.can('applications.decide'));
  /** Ya aprobada y con permiso de seguimiento (HU-32). */
  readonly hasFollowUp = computed(() => {
    const status = this.application()?.status;
    return !!status && FOLLOW_UP_STATUSES.includes(status) && this.access.can('followup.read');
  });
  readonly canManageFollowUp = computed(() => this.access.can('followup.manage'));

  async load(id: string): Promise<void> {
    this.notice.set('');
    const detail = await this.request.run(this.api.detail(id));
    if (detail?.reviewStarted) {
      this.notice.set('La postulación pasó a «En revisión»; el postulante lo verá en su portal.');
    }
  }

  /** Ejecuta una acción que devuelve el detalle actualizado. */
  async update(
    task: (id: string) => Observable<AdminApplicationDetailDto>,
    message: string | ((detail: AdminApplicationDetailDto) => string),
  ): Promise<AdminApplicationDetailDto | null> {
    const updated = await this.run((id) => firstValueFrom(task(id)));
    if (updated) {
      this.request.set(updated);
      this.notice.set(typeof message === 'string' ? message : message(updated));
    }
    return updated;
  }

  /** Ejecuta cualquier acción sobre la postulación actual (con su error presentado). */
  async run<T>(task: (id: string) => Promise<T>): Promise<T | null> {
    const id = this.application()?.id;
    if (!id) return null;
    this.busy.set(true);
    try {
      return await task(id);
    } catch (error) {
      void this.errors.present(error);
      return null;
    } finally {
      this.busy.set(false);
    }
  }

  /** Vuelve a pedir el detalle sin avisos (p. ej. tras reenviar un correo). */
  async refresh(): Promise<void> {
    const id = this.application()?.id;
    if (id) await this.request.run(this.api.detail(id));
  }
}
