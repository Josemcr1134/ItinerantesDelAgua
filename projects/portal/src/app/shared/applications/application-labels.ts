import {
  ApplicationActionReason,
  ApplicationActionType,
  ApplicationStatus,
  ApplicationTimelineStep,
  OfferActionReason,
  OfferModality,
} from 'data-access';

/**
 * Textos de las postulaciones (HU-19 a HU-21), mismos que la guía de la
 * Fase 04. TODO(contenido): validar con el equipo.
 */
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

export const TIMELINE_LABELS: Readonly<Record<ApplicationTimelineStep, string>> = {
  SUBMITTED: 'Enviada',
  IN_REVIEW: 'En revisión',
  INTERVIEW: 'Entrevista',
  RESULT: 'Resultado',
  PAYMENT: 'Pago del saldo',
  CONFIRMATION: 'Confirmación',
  ENROLLED: 'Inscrita',
};

export const ACTION_LABELS: Readonly<Record<ApplicationActionType, string>> = {
  CONTINUE_DRAFT: 'Continuar',
  JOIN_INTERVIEW: 'Entrar a la entrevista',
  PAY_BALANCE: 'Pagar saldo',
  CONTINUE_PAYMENT: 'Continuar pago',
  UPLOAD_TRANSFER_PROOF: 'Subir comprobante',
  PAYMENT_IN_VALIDATION: 'Pago en validación',
  CONFIRM_PARTICIPATION: 'Confirmar mi participación',
  GO_TO_CLASSROOM: 'Ir a mi aula',
  VIEW: 'Ver mi postulación',
};

export const ACTION_REASON_LABELS: Readonly<Record<ApplicationActionReason, string>> = {
  WINDOW_CLOSED: 'La convocatoria cerró: el borrador queda en solo lectura.',
  INTERVIEW_NOT_OPEN_YET: 'Disponible 10 min antes de la entrevista.',
  INTERVIEW_LINK_PENDING: 'Enlace de la entrevista aún no disponible.',
  INTERVIEW_ENDED: 'La entrevista terminó.',
  TRANSFER_PENDING_VALIDATION: 'Comprobante en validación.',
};

/** Por qué no se puede postular (mismos textos que la ficha). */
export const WINDOW_REASON_LABELS: Readonly<Record<OfferActionReason, string>> = {
  ENROLLMENT_NOT_OPEN_YET: 'Próximamente',
  ENROLLMENT_CLOSED: 'Convocatoria cerrada',
  OFFER_FINISHED: 'Finalizada',
  SOLD_OUT: 'Cupo agotado',
  SCHOLARSHIP_NOT_OPEN_YET: 'Becas próximamente',
  SCHOLARSHIP_CLOSED: 'Becas cerradas',
  PRICE_NOT_AVAILABLE: 'Precio no disponible',
  TRANSFER_PENDING_VALIDATION: 'Pago en validación',
};

export const MODALITY_LABELS: Readonly<Record<OfferModality, string>> = {
  ONLINE_LIVE: 'En línea',
  IN_PERSON: 'Presencial',
};
