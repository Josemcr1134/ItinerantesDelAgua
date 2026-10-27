import {
  InstallmentStatus,
  PaymentAlertType,
  PaymentPlanStatus,
  PaymentStatus,
  TransferRejectionReason,
} from 'data-access';

/**
 * Textos de pagos (Fase 05: HU-22 a HU-26). Los estados siguen las
 * descripciones de la API. TODO(contenido): confirmar con el equipo (no hay
 * Figma de estas pantallas).
 */
export const PAYMENT_STATUS_LABELS: Readonly<Record<PaymentStatus, string>> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  FAILED: 'Fallido',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
  PENDING_VALIDATION: 'Pendiente de validación',
  VALIDATED: 'Validada',
  REJECTED: 'Rechazada',
};

export const PLAN_STATUS_LABELS: Readonly<Record<PaymentPlanStatus, string>> = {
  PENDING_ACTIVATION: 'Por activar',
  CURRENT: 'Al día',
  PAST_DUE: 'Cobro fallido',
  DELINQUENT: 'En mora',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
};

export const INSTALLMENT_STATUS_LABELS: Readonly<Record<InstallmentStatus, string>> = {
  SCHEDULED: 'Programada',
  PROCESSING: 'En cobro',
  PAID: 'Pagada',
  FAILED: 'Fallida',
  CANCELLED: 'Cancelada',
};

export const ALERT_LABELS: Readonly<Record<PaymentAlertType, string>> = {
  INSTALLMENT_FAILED: 'Cobro fallido',
  PLAN_DELINQUENT: 'En mora',
  TRANSFER_REJECTED: 'Comprobante rechazado',
  TRANSFER_PENDING: 'Comprobante en validación',
  INSTALLMENT_UPCOMING: 'Próximo cobro',
};

export const REJECTION_LABELS: Readonly<Record<TransferRejectionReason, string>> = {
  ILLEGIBLE: 'Comprobante ilegible',
  AMOUNT_MISMATCH: 'El monto no coincide',
  NOT_FOUND: 'No encontramos la transferencia',
  OTHER: 'Otro motivo',
};

/** Motivo por el que no se puede pagar (`quote.blocker.code`). */
export const BLOCKER_LABELS: Readonly<Record<string, string>> = {
  ENROLLMENT_ALREADY_EXISTS: 'Ya estás inscrito en esta formación.',
  OFFER_SOLD_OUT: 'El cupo está agotado.',
  ENROLLMENT_CLOSED: 'Las inscripciones están cerradas.',
  PAYMENT_NOT_ALLOWED: 'Esta oferta no se paga en línea.',
  PAYMENT_BALANCE_NOT_DUE: 'Esta postulación no tiene un saldo por pagar.',
  APPLICATION_DEADLINE_PASSED: 'La fecha límite de pago ya pasó.',
  PAYMENT_TRANSFER_PENDING: 'Tu comprobante de transferencia está en validación.',
};

export const PAYMENT_TEXTS = {
  titleOffer: 'Inscripción y pago',
  titleBalance: 'Pagar saldo',
  how: 'Elige cómo pagar',
  single: 'Pago único',
  installments: (n: number) => `${n} cuotas`,
  perInstallment: (amount: string) => `de ${amount}`,
  installmentUnavailable: 'La última cuota caería después del fin de la oferta.',
  schedule: 'Calendario de cuotas',
  firstCharge: 'Se cobra al confirmar',
  method: 'Método de pago',
  card: 'Tarjeta de crédito o débito',
  cardHint: 'Pagas en la página segura de Stripe; el portal no ve los datos de tu tarjeta.',
  transfer: 'Transferencia bancaria (SPEI)',
  transferHint: 'Solo en México. Subes tu comprobante y el equipo lo valida en 1–2 días hábiles.',
  terms: 'Acepto los términos de inscripción y la política de cancelación y reembolso.',
  autoDebit: 'Autorizo a la Escuela a cobrar automáticamente en mi tarjeta las cuotas restantes.',
  payCard: (amount: string) => `Pagar ${amount} con tarjeta`,
  payFirst: (amount: string) => `Pagar la 1.ª cuota (${amount})`,
  redirecting: 'Te llevamos a Stripe…',
  openCheckout: 'Tienes un pago con tarjeta sin terminar.',
  continuePayment: 'Continuar pago',
  cancelPayment: 'Cancelar ese pago',
  notConfigured:
    'Los pagos con tarjeta aún no están disponibles. Inténtalo más tarde o escríbenos.',
  summary: 'Resumen',
  total: 'Total a pagar',
  original: 'Costo original',
  scholarship: (name: string, percent: number) => `Beca ${name} (${percent}%)`,
  balance: 'Saldo a pagar',
  dueAt: (date: string) => `Fecha límite: ${date}`,
  goToClassroom: 'Ir a mi aula',
  myPayments: 'Ver Mis pagos',
  backToOffer: 'Volver a la ficha',
  transferForm: {
    title: 'Datos para la transferencia',
    holder: 'Titular',
    bank: 'Banco',
    clabe: 'CLABE',
    reference: 'Referencia (escríbela en el concepto)',
    amount: 'Monto',
    copy: 'Copiar',
    copied: 'Copiado',
    proof: 'Comprobante (PDF, JPG o PNG, hasta 5 MB)',
    choose: 'Seleccionar archivo',
    noFile: 'Ningún archivo elegido',
    declared: 'Monto transferido (MXN)',
    paidOn: 'Fecha de la transferencia',
    tracking: 'Clave de rastreo',
    submit: 'Enviar comprobante',
    sending: 'Enviando…',
    pending:
      'Tu comprobante está en validación: el equipo lo revisa en 1–2 días hábiles. Tu lugar está apartado.',
    rejected: (reason: string) =>
      `Tu último comprobante fue rechazado: ${reason}. Puedes enviar otro.`,
    invalidFile: 'Sube un PDF, JPG o PNG de hasta 5 MB.',
  },
  result: {
    processing: 'Procesando tu pago…',
    processingHint: 'No cierres esta página; tarda unos segundos.',
    paid: 'Pago confirmado',
    paidHint: (concept: string) => `${concept}. Te enviamos el comprobante a tu correo.`,
    cancelled: 'Pago cancelado',
    cancelledHint: 'No se realizó ningún cargo. Puedes intentarlo de nuevo cuando quieras.',
    failed: 'El pago no se completó',
    slow: 'Tu pago sigue en proceso. Revisa el estado en Mis pagos en unos minutos.',
    retry: 'Intentar de nuevo',
    receipt: 'Descargar comprobante',
  },
  mine: {
    empty: 'Aún no tienes pagos.',
    moodleOnly: 'Tus formaciones de Moodle se pagaron fuera del portal.',
    alerts: 'Avisos',
    plans: 'Planes de cuotas',
    history: 'Historial',
    paid: (paid: number, total: number) => `${paid} de ${total} cuotas pagadas`,
    nextCharge: (amount: string, date: string) => `Próximo cobro: ${amount} el ${date}`,
    card: (brand: string, last4: string) => `${brand} •••• ${last4}`,
    suspended: 'Acceso al aula suspendido hasta regularizar el pago.',
    updateCard: 'Actualizar tarjeta',
    payNow: 'Pagar ahora',
    uploadProof: 'Subir comprobante',
    receipt: 'Comprobante',
    proof: 'Ver mi comprobante',
    cardUpdated: 'Guardamos tu tarjeta. Si había cuotas pendientes, las cobramos en un momento.',
    cardUpdateCancelled: 'No se cambió tu tarjeta.',
    paidNow: 'Listo: cobramos las cuotas pendientes y tu plan está al día.',
  },
} as const;
