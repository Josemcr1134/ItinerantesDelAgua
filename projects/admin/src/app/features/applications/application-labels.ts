import {
  ApplicationKind,
  ApplicationStatus,
  EmailStatus,
  EvaluationRecommendation,
  FollowUpOutcome,
  InterviewStatus,
  MoneyAmountDto,
} from 'data-access';

/**
 * Textos visibles de las postulaciones (HU-21, HU-31 y HU-32), tal como los
 * nombra la API. TODO(contenido): validar con el equipo.
 */
export const APPLICATION_KIND_LABELS: Readonly<Record<ApplicationKind, string>> = {
  SCHOLARSHIP: 'Becas',
  OPEN_CALL: 'Convocatorias',
};

export const APPLICATION_STATUS_LABELS: Readonly<Record<ApplicationStatus, string>> = {
  DRAFT: 'Borrador',
  SUBMITTED: 'Enviada',
  IN_REVIEW: 'En revisión',
  INTERVIEW_SCHEDULED: 'Entrevista agendada',
  APPROVED_PENDING_PAYMENT: 'Aprobada – pendiente de pago',
  APPROVED_PENDING_CONFIRMATION: 'Aprobada – pendiente de confirmación',
  ENROLLED: 'Inscrita',
  NOT_SELECTED: 'No seleccionada',
  EXPIRED: 'Vencida',
};

/** Tono de la insignia de cada estado (clases `adm-badge--<tono>`). */
export type BadgeTone = 'neutral' | 'info' | 'pending' | 'success' | 'danger';

export const APPLICATION_STATUS_TONES: Readonly<Record<ApplicationStatus, BadgeTone>> = {
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  IN_REVIEW: 'info',
  INTERVIEW_SCHEDULED: 'info',
  APPROVED_PENDING_PAYMENT: 'pending',
  APPROVED_PENDING_CONFIRMATION: 'pending',
  ENROLLED: 'success',
  NOT_SELECTED: 'danger',
  EXPIRED: 'neutral',
};

export const RECOMMENDATION_LABELS: Readonly<Record<EvaluationRecommendation, string>> = {
  APPROVE: 'Aprobar',
  NOT_SELECT: 'No seleccionar',
  UNSURE: 'Tengo dudas',
};

export const RECOMMENDATION_TONES: Readonly<Record<EvaluationRecommendation, BadgeTone>> = {
  APPROVE: 'success',
  NOT_SELECT: 'danger',
  UNSURE: 'pending',
};

export const INTERVIEW_STATUS_LABELS: Readonly<Record<InterviewStatus, string>> = {
  SCHEDULED: 'Agendada',
  COMPLETED: 'Realizada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No asistió',
};

export const EMAIL_STATUS_LABELS: Readonly<Record<EmailStatus, string>> = {
  NOT_REQUESTED: 'Sin correo',
  PENDING: 'Enviando',
  SENT: 'Enviado',
  FAILED: 'Correo no enviado',
};

export const FOLLOW_UP_OUTCOME_LABELS: Readonly<Record<FollowUpOutcome, string>> = {
  NO_RESPONSE: 'Sin respuesta',
  WILL_PAY_SOON: 'Pagará pronto',
  REQUESTS_INSTALLMENTS: 'Solicita cuotas',
  WITHDRAWS: 'Desiste',
};

/** Ya aprobadas: tienen panel de seguimiento (HU-32). */
export const FOLLOW_UP_STATUSES: readonly ApplicationStatus[] = [
  'APPROVED_PENDING_PAYMENT',
  'APPROVED_PENDING_CONFIRMATION',
  'ENROLLED',
  'EXPIRED',
];

const moneyFormats = new Map<string, Intl.NumberFormat>();

/** "$5,100.00 MXN". */
export function formatMoney(amount: MoneyAmountDto | null): string | null {
  if (!amount) return null;
  let format = moneyFormats.get(amount.currency);
  if (!format) {
    format = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: amount.currency,
      currencyDisplay: 'narrowSymbol',
    });
    moneyFormats.set(amount.currency, format);
  }
  return `${format.format(amount.amountCents / 100)} ${amount.currency}`;
}

const dateTime = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Mexico_City',
});

/** Fecha y hora en CDMX ("22 oct 2026, 10:30"). */
export const formatDateTime = (iso: string | null): string | null =>
  iso ? dateTime.format(new Date(iso)) : null;
