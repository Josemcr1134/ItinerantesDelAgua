import {
  CardDto,
  InstallmentStatus,
  PaymentConcept,
  PaymentMethod,
  PaymentPlanStatus,
  PaymentStatus,
  RefundStatus,
  TransferRejectionReason,
  TransferStatus,
} from 'data-access';

/** Textos de pagos (HU-33), como los nombra la API. TODO(contenido): validar con el equipo. */
export const PAYMENT_STATUS_LABELS: Readonly<Record<PaymentStatus, string>> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  FAILED: 'Fallido',
  CANCELLED: 'Abandonado',
  REFUNDED: 'Reembolsado',
  PENDING_VALIDATION: 'Por validar',
  VALIDATED: 'Validado',
  REJECTED: 'Rechazado',
};

/** Tono de la insignia (`adm-badge--<tono>`). */
export const PAYMENT_STATUS_TONES: Readonly<Record<PaymentStatus, string>> = {
  PENDING: 'neutral',
  PAID: 'success',
  FAILED: 'danger',
  CANCELLED: 'neutral',
  REFUNDED: 'info',
  PENDING_VALIDATION: 'pending',
  VALIDATED: 'success',
  REJECTED: 'danger',
};

export const PAYMENT_METHOD_LABELS: Readonly<Record<PaymentMethod, string>> = {
  CARD: 'Tarjeta',
  BANK_TRANSFER: 'Transferencia',
};

export const PAYMENT_CONCEPT_LABELS: Readonly<Record<PaymentConcept, string>> = {
  FULL_PRICE: 'Precio completo',
  BALANCE: 'Saldo tras beca',
  INSTALLMENT: 'Cuota',
};

export const TRANSFER_STATUS_LABELS: Readonly<Record<TransferStatus, string>> = {
  PENDING_VALIDATION: 'Por validar',
  VALIDATED: 'Validadas',
  REJECTED: 'Rechazadas',
  REFUNDED: 'Reembolsadas',
};

export const REJECTION_REASON_LABELS: Readonly<Record<TransferRejectionReason, string>> = {
  ILLEGIBLE: 'Ilegible',
  AMOUNT_MISMATCH: 'Monto no coincide',
  NOT_FOUND: 'No encontrado',
  OTHER: 'Otro',
};

export const PLAN_STATUS_LABELS: Readonly<Record<PaymentPlanStatus, string>> = {
  PENDING_ACTIVATION: 'Sin activar',
  CURRENT: 'Al día',
  PAST_DUE: 'Cobro fallido',
  DELINQUENT: 'En mora',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};

export const PLAN_STATUS_TONES: Readonly<Record<PaymentPlanStatus, string>> = {
  PENDING_ACTIVATION: 'neutral',
  CURRENT: 'success',
  PAST_DUE: 'pending',
  DELINQUENT: 'danger',
  COMPLETED: 'info',
  CANCELLED: 'neutral',
};

export const INSTALLMENT_STATUS_LABELS: Readonly<Record<InstallmentStatus, string>> = {
  SCHEDULED: 'Programada',
  PROCESSING: 'En cobro',
  PAID: 'Pagada',
  FAILED: 'Fallida',
  CANCELLED: 'Cancelada',
};

export const REFUND_STATUS_LABELS: Readonly<Record<RefundStatus, string>> = {
  PENDING: 'En proceso',
  SUCCEEDED: 'Reembolsado',
  FAILED: 'Fallido',
};

export const REFUND_STATUS_TONES: Readonly<Record<RefundStatus, string>> = {
  PENDING: 'pending',
  SUCCEEDED: 'success',
  FAILED: 'danger',
};

/** "Visa •••• 4242" (o `null` sin datos de la tarjeta). */
export function formatCard(card: CardDto | null): string | null {
  if (!card?.last4) return null;
  const brand = card.brand ? card.brand.charAt(0).toUpperCase() + card.brand.slice(1) : 'Tarjeta';
  return `${brand} •••• ${card.last4}`;
}
