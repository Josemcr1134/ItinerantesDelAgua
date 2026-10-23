import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../api-client';
import { DecisionPreviewDto, Uuid } from '../models.generated';
import { ApiBody, ApiQuery, ApiResponse } from '../operations.generated';

/** Filtros de la bandeja (los mismos sirven para exportar). */
export type AdminApplicationsQuery = ApiQuery<'AdminApplications_list'>;

/**
 * Cuerpo de "Guardar mi evaluación". El spec declara `comment` como objeto,
 * pero es texto (máx. 2000).
 */
export type EvaluationBody = Omit<ApiBody<'AdminApplications_evaluate'>, 'comment'> & {
  readonly comment?: string | null;
};

/** Asunto y cuerpo del correo de la decisión (el spec lo declara como objeto). */
export interface DecisionEmailPreview {
  readonly subject: string;
  readonly body: string;
}

export type DecisionPreview = Omit<DecisionPreviewDto, 'email'> & {
  readonly email: DecisionEmailPreview;
};

/** La API recibe los estados separados por coma. */
function serialize(query: AdminApplicationsQuery) {
  return { ...query, status: query.status?.length ? query.status.join(',') : undefined };
}

/** Bandeja de postulaciones (HU-31): evaluación, entrevista y decisión. */
@Injectable({ providedIn: 'root' })
export class AdminApplicationsApi {
  private readonly api = inject(ApiClient);

  private path(id: Uuid, rest = ''): string {
    return `/api/v1/admin/applications/${encodeURIComponent(id)}${rest}`;
  }

  /** Nunca incluye borradores. */
  list(query: AdminApplicationsQuery = {}) {
    return this.api.get<ApiResponse<'AdminApplications_list'>>('/api/v1/admin/applications', {
      query: serialize(query),
    });
  }

  /** CSV (UTF-8 con BOM) con los mismos filtros; máx. 5000 filas. */
  export(query: AdminApplicationsQuery = {}) {
    const { page: _page, pageSize: _pageSize, ...filters } = query;
    return this.api.getFile('/api/v1/admin/applications/export', 'postulaciones.csv', {
      query: serialize(filters),
    });
  }

  /**
   * Detalle completo. Si estaba "Enviada" y quien la abre puede evaluar o
   * decidir, pasa a "En revisión" (`reviewStarted`).
   */
  detail(id: Uuid) {
    return this.api.get<ApiResponse<'AdminApplications_detail'>>(this.path(id));
  }

  /** Crea o reemplaza mi evaluación. */
  evaluate(id: Uuid, body: EvaluationBody) {
    return this.api.put<ApiResponse<'AdminApplications_evaluate'>>(
      this.path(id, '/evaluations/me'),
      body,
    );
  }

  /** Agenda o reprograma (cancela la anterior) y notifica al postulante. */
  scheduleInterview(id: Uuid, body: ApiBody<'AdminApplications_scheduleInterview'>) {
    return this.api.post<ApiResponse<'AdminApplications_scheduleInterview'>>(
      this.path(id, '/interview'),
      body,
    );
  }

  completeInterview(id: Uuid, body: ApiBody<'AdminApplications_completeInterview'>) {
    return this.api.post<ApiResponse<'AdminApplications_completeInterview'>>(
      this.path(id, '/interview/complete'),
      body,
    );
  }

  /** La postulación vuelve a "En revisión". */
  cancelInterview(id: Uuid, body: ApiBody<'AdminApplications_cancelInterview'>) {
    return this.api.post<ApiResponse<'AdminApplications_cancelInterview'>>(
      this.path(id, '/interview/cancel'),
      body,
    );
  }

  /** Calcula saldo, plazo y correo sin guardar nada. */
  decisionPreview(id: Uuid, query: ApiQuery<'AdminApplications_decisionPreview'>) {
    return this.api.get<DecisionPreview>(this.path(id, '/decision-preview'), {
      query: { ...query },
    });
  }

  approve(id: Uuid, body: ApiBody<'AdminApplications_approve'>) {
    return this.api.post<ApiResponse<'AdminApplications_approve'>>(this.path(id, '/approve'), body);
  }

  reject(id: Uuid, body: ApiBody<'AdminApplications_reject'>) {
    return this.api.post<ApiResponse<'AdminApplications_reject'>>(this.path(id, '/reject'), body);
  }

  /** Reenvía un correo fallido (por defecto, el último). */
  retryEmail(id: Uuid, body: ApiBody<'AdminApplications_retryEmail'> = {}) {
    return this.api.post<ApiResponse<'AdminApplications_retryEmail'>>(
      this.path(id, '/retry-email'),
      body,
    );
  }
}

/** Seguimiento de postulaciones aprobadas (HU-32): pendientes, inscritas o vencidas. */
@Injectable({ providedIn: 'root' })
export class AdminFollowUpApi {
  private readonly api = inject(ApiClient);

  private path(id: Uuid, rest: string): string {
    return `/api/v1/admin/applications/${encodeURIComponent(id)}${rest}`;
  }

  /** Contacto, saldo, plazo y línea de tiempo. */
  detail(id: Uuid) {
    return this.api.get<ApiResponse<'AdminFollowUp_detail'>>(this.path(id, '/follow-up'));
  }

  notes(id: Uuid) {
    return this.api.get<ApiResponse<'AdminFollowUp_notes'>>(this.path(id, '/notes'));
  }

  /** Nota interna (nunca visible al postulante). */
  addNote(id: Uuid, body: ApiBody<'AdminFollowUp_addNote'>) {
    return this.api.post<ApiResponse<'AdminFollowUp_addNote'>>(this.path(id, '/notes'), body);
  }

  /** Correo de recordatorio; máximo uno cada 24 h. */
  remind(id: Uuid) {
    return this.api.post<ApiResponse<'AdminFollowUp_remind'>>(this.path(id, '/reminders'));
  }

  /** Arma el enlace wa.me (la plataforma no envía el mensaje) y deja una nota. */
  whatsapp(id: Uuid, body: ApiBody<'AdminFollowUp_whatsapp'> = {}) {
    return this.api.post<ApiResponse<'AdminFollowUp_whatsapp'>>(this.path(id, '/whatsapp'), body);
  }

  /** Nueva fecha límite (futura, sin pasar el inicio); reactiva si estaba vencida. */
  extendDeadline(id: Uuid, body: ApiBody<'AdminFollowUp_extendDeadline'>) {
    return this.api.post<ApiResponse<'AdminFollowUp_extendDeadline'>>(
      this.path(id, '/extend-deadline'),
      body,
    );
  }
}
