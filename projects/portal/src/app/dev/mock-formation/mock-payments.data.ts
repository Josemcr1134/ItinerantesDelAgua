import {
  MoneyDto,
  PaymentDto,
  PaymentPlanDto,
  PaymentQuoteDto,
  PaymentsSummaryDto,
  PlanInstallmentDto,
} from 'data-access';

// Datos de prueba de pagos (solo desarrollo): la pasarela (Stripe) aún no
// está activa. "Pagar con tarjeta" simula volver de Stripe con el pago hecho.

const DAY = 86_400_000;
const iso = (ms: number) => new Date(ms).toISOString();
const usd = (cents: number): MoneyDto => ({ amountCents: cents, currency: 'USD' });
const mxn = (cents: number): MoneyDto => ({ amountCents: cents, currency: 'MXN' });
const offer = {
  id: 'mock-eco',
  slug: 'mock-eco',
  name: 'Diplomado en Ecotecnologías del Agua',
  type: 'DIPLOMA' as const,
  cohortLabel: '2026-2',
  startsAt: iso(Date.now() - 35 * DAY),
  endsAt: iso(Date.now() + 120 * DAY),
};

const installment = (
  sequence: number,
  amount: MoneyDto,
  days: number,
  status: PlanInstallmentDto['status'],
): PlanInstallmentDto => ({
  id: `inst-${sequence}`,
  sequence,
  amount,
  dueAt: iso(Date.now() + days * DAY),
  status,
  paidAt: status === 'PAID' ? iso(Date.now() + days * DAY) : null,
  attempts: status === 'FAILED' ? 2 : status === 'PAID' ? 1 : 0,
  nextRetryAt: null,
  failureMessage: status === 'FAILED' ? 'Fondos insuficientes' : null,
});

/** Pagos hechos en esta pestaña (al "volver de Stripe"). */
const paid = new Map<string, PaymentDto>();

export function mockQuote(offerId: string | null, applicationId: string | null): PaymentQuoteDto {
  const schedule = (count: number, total: number) =>
    Array.from({ length: count }, (_, i) =>
      installment(i + 1, usd(Math.round(total / count)), i * 30, 'SCHEDULED'),
    );
  if (applicationId) {
    return {
      concept: 'BALANCE',
      offer: { ...offer, id: offerId ?? offer.id },
      application: {
        id: applicationId,
        folio: 'BEC-2026-0142',
        kind: 'SCHOLARSHIP',
        status: 'APPROVED_PENDING_PAYMENT',
        assignedScholarshipTypeId: 't3',
        assignedScholarshipType: {
          id: 't3',
          key: 'AGUAS_LIBRES',
          name: 'Aguas Libres',
          minPercent: 50,
          maxPercent: 50,
          requiresInterview: false,
        },
        assignedPercent: 50,
        originalAmount: mxn(1097000),
        dueAt: iso(Date.now() + 5 * DAY),
      },
      amount: mxn(548500),
      methods: [
        { method: 'CARD', available: true, reason: null },
        { method: 'BANK_TRANSFER', available: true, reason: null },
      ],
      installments: null,
      bankTransfer: {
        accountHolder: 'Escuela Itinerante del Agua A.C.',
        bankName: 'Banco de prueba',
        clabe: '012180001234567897',
        reference: 'EIA-BEC-2026-0142',
        amount: mxn(548500),
      },
      blocker: null,
      openCheckout: null,
      latestTransfer: null,
    };
  }
  return {
    concept: 'FULL_PRICE',
    offer: { ...offer, id: offerId ?? offer.id },
    application: null,
    amount: usd(58500),
    methods: [
      { method: 'CARD', available: true, reason: null },
      { method: 'BANK_TRANSFER', available: false, reason: 'NOT_A_BALANCE' },
    ],
    installments: {
      max: 4,
      options: [
        {
          count: 2,
          available: true,
          reason: null,
          perInstallment: usd(29250),
          schedule: schedule(2, 58500),
        },
        {
          count: 3,
          available: true,
          reason: null,
          perInstallment: usd(19500),
          schedule: schedule(3, 58500),
        },
        {
          count: 4,
          available: false,
          reason: 'LAST_INSTALLMENT_AFTER_END',
          perInstallment: usd(14625),
          schedule: schedule(4, 58500),
        },
      ],
    },
    bankTransfer: null,
    blocker: null,
    openCheckout: null,
    latestTransfer: null,
  };
}

export function mockPayment(
  id: string,
  status: PaymentDto['status'] = 'PAID',
  extra: Partial<PaymentDto> = {},
): PaymentDto {
  return {
    id,
    folio: `PAG-${id.slice(-4).toUpperCase()}`,
    concept: 'FULL_PRICE',
    conceptLabel: `Pago completo · ${offer.name}`,
    installment: null,
    method: 'CARD',
    status,
    amount: usd(58500),
    refunded: null,
    offer,
    applicationId: null,
    planId: null,
    card: { brand: 'Visa', last4: '4242' },
    transfer: null,
    receiptAvailable: status === 'PAID' || status === 'VALIDATED',
    stripeReceiptUrl: null,
    failureMessage: null,
    checkout: null,
    createdAt: iso(Date.now()),
    paidAt: status === 'PAID' ? iso(Date.now()) : null,
    failedAt: null,
    ...extra,
  };
}

/** "Checkout": registra el pago y simula la vuelta de Stripe con éxito. */
export function mockCheckout(body: {
  offerId?: string;
  applicationId?: string;
  installmentCount?: number;
}) {
  const id = `mock-pay-${paid.size + 1}`;
  paid.set(
    id,
    mockPayment(id, 'PAID', {
      concept: body.installmentCount
        ? 'INSTALLMENT'
        : body.applicationId
          ? 'BALANCE'
          : 'FULL_PRICE',
      conceptLabel: body.installmentCount
        ? `Cuota 1 de ${body.installmentCount} · ${offer.name}`
        : body.applicationId
          ? `Saldo tras beca · ${offer.name}`
          : `Pago completo · ${offer.name}`,
      applicationId: body.applicationId ?? null,
    }),
  );
  return {
    paymentId: id,
    checkoutUrl: `${location.origin}/pagos/resultado?paymentId=${id}&result=success`,
    expiresAt: iso(Date.now() + 30 * 60_000),
    reused: false,
  };
}

export const mockPaidPayment = (id: string) => paid.get(id) ?? mockPayment(id, 'PAID');

const plan: PaymentPlanDto = {
  id: 'mock-plan',
  status: 'PAST_DUE',
  concept: 'FULL_PRICE',
  offer,
  total: usd(58500),
  installmentCount: 3,
  paidCount: 1,
  paidAmount: usd(19500),
  pendingAmount: usd(39000),
  nextCharge: installment(3, usd(19500), 25, 'SCHEDULED'),
  card: { brand: 'Visa', last4: '4242' },
  failedSince: iso(Date.now() - 5 * DAY),
  delinquencyAt: iso(Date.now() + 10 * DAY),
  daysSinceFailure: 5,
  accessSuspended: false,
  canPayNow: true,
  canUpdateCard: true,
  installments: [
    installment(1, usd(19500), -35, 'PAID'),
    installment(2, usd(19500), -5, 'FAILED'),
    installment(3, usd(19500), 25, 'SCHEDULED'),
  ],
  activatedAt: iso(Date.now() - 35 * DAY),
};

export function mockSummary(): PaymentsSummaryDto {
  return {
    activePlans: [plan],
    alerts: [
      {
        type: 'INSTALLMENT_FAILED',
        offer,
        amount: usd(19500),
        date: iso(Date.now() - 5 * DAY),
        planId: plan.id,
        paymentId: null,
        applicationId: null,
        card: plan.card,
      },
      {
        type: 'INSTALLMENT_UPCOMING',
        offer,
        amount: usd(19500),
        date: iso(Date.now() + 25 * DAY),
        planId: plan.id,
        paymentId: null,
        applicationId: null,
        card: plan.card,
      },
    ],
    hasPayments: true,
    moodleOnly: false,
  };
}

export const mockPlans = () => ({ data: [plan] });

export function mockHistory(): PaymentDto[] {
  return [
    ...paid.values(),
    mockPayment('hist-3', 'FAILED', {
      concept: 'INSTALLMENT',
      conceptLabel: 'Cuota 2 de 3',
      amount: usd(19500),
      failureMessage: 'Fondos insuficientes',
      createdAt: iso(Date.now() - 5 * DAY),
      paidAt: null,
      planId: plan.id,
    }),
    mockPayment('hist-2', 'PAID', {
      concept: 'INSTALLMENT',
      conceptLabel: 'Cuota 1 de 3',
      amount: usd(19500),
      createdAt: iso(Date.now() - 35 * DAY),
      paidAt: iso(Date.now() - 35 * DAY),
      planId: plan.id,
    }),
    mockPayment('hist-1', 'VALIDATED', {
      method: 'BANK_TRANSFER',
      concept: 'BALANCE',
      conceptLabel: 'Saldo tras beca · Diplomado de Ecopedagogías 2025',
      amount: mxn(420000),
      card: null,
      transfer: {
        reference: 'EIA-BEC-2025-0077',
        declaredAmount: mxn(420000),
        paidOn: '2025-11-02',
        trackingKey: 'SPEI123',
        proofFileName: 'spei.pdf',
        submittedAt: iso(Date.now() - 300 * DAY),
        reviewedAt: iso(Date.now() - 298 * DAY),
        rejectionReason: null,
        rejectionNote: null,
      },
      createdAt: iso(Date.now() - 300 * DAY),
      paidAt: iso(Date.now() - 298 * DAY),
    }),
  ];
}
