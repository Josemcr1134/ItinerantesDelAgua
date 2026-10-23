import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SessionStore } from 'auth';
import {
  AdminPaymentDetailDto,
  AdminPaymentPlanDto,
  apiErrorInterceptor,
  Permission,
  provideApi,
  UserProfileDto,
} from 'data-access';
import { AlertService } from 'ui-kit';
import { AdminAccess } from '../../core/access/admin-access';
import PaymentDetailPage from './payment/payment-detail-page';
import PaymentsPage from './payments-page';
import PlanDetailPage from './plan/plan-detail-page';

const API = 'https://api.test/api/v1/admin';
const tick = () => new Promise((r) => setTimeout(r));
const MXN = (amountCents: number) => ({ amountCents, currency: 'MXN' as const });

const offer = {
  id: 'o1',
  slug: 'eco',
  name: 'Diplomado en Ecotecnologías del Agua',
  type: 'DIPLOMA' as const,
  cohortLabel: null,
  startsAt: null,
  endsAt: null,
};
const payer = {
  id: 'u1',
  fullName: 'Andrea Solís',
  email: 'andrea@example.com',
  countryCode: 'CR',
  phone: null,
};

function transferPayment(extra: Partial<AdminPaymentDetailDto> = {}): AdminPaymentDetailDto {
  return {
    id: 'p2',
    folio: 'PAG-000124',
    concept: 'BALANCE',
    conceptLabel: 'Saldo tras beca',
    installment: null,
    method: 'BANK_TRANSFER',
    status: 'PENDING_VALIDATION',
    amount: MXN(510000),
    refunded: MXN(0),
    refundable: MXN(0),
    payer,
    offer,
    applicationId: null,
    enrollmentId: null,
    planId: null,
    card: null,
    stripe: { paymentIntentId: null, checkoutSessionId: null, chargeId: null, receiptUrl: null },
    transfer: {
      reference: 'ITA-2026-0044',
      expectedAmount: MXN(510000),
      declaredAmount: MXN(510000),
      declaredPaidOn: '2026-10-20',
      trackingKey: null,
      proofFileName: 'spei.pdf',
      proofMimeType: 'application/pdf',
      proofSizeBytes: 1000,
      submittedAt: '2026-10-21T16:00:00.000Z',
      receivedAmount: null,
      receivedOn: null,
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null,
      rejectionNote: null,
    },
    failureMessage: null,
    createdAt: '2026-10-20T16:00:00.000Z',
    paidAt: null,
    failedAt: null,
    refundedAt: null,
    refunds: [],
    actions: { canRefund: false, canReview: true },
    ...extra,
  };
}

const plan: AdminPaymentPlanDto = {
  id: 'pl1',
  status: 'DELINQUENT',
  concept: 'FULL_PRICE',
  offer,
  total: MXN(1020000),
  installmentCount: 3,
  paidCount: 1,
  paidAmount: MXN(340000),
  pendingAmount: MXN(680000),
  nextCharge: null,
  card: { brand: 'visa', last4: '4242' },
  failedSince: '2026-10-19T16:00:00.000Z',
  delinquencyAt: null,
  daysSinceFailure: 3,
  accessSuspended: true,
  canPayNow: true,
  canUpdateCard: true,
  installments: [],
  activatedAt: null,
  payer,
  enrollmentId: 'e1',
  enrollmentStatus: 'SUSPENDED',
  accessSuspendedAt: '2026-10-21T16:00:00.000Z',
  delinquentAt: null,
  cancelledAt: null,
  cancelReason: null,
  availableActions: ['RETRY', 'RESTORE_ACCESS', 'CANCEL'],
};

describe('Pagos', () => {
  async function setup<T>(
    component: Type<T>,
    permissions: Permission[],
    inputs: Record<string, unknown> = {},
  ) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        {
          provide: AlertService,
          useValue: { open: () => Promise.resolve(true), confirm: () => Promise.resolve(true) },
        },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(SessionStore).setUser({ id: 'me', roles: [] } as unknown as UserProfileDto);
    const loaded = TestBed.inject(AdminAccess).load();
    http
      .expectOne(`${API}/me`)
      .flush({ user: { id: 'me', email: '', fullName: 'Ana' }, roles: [], permissions });
    await loaded;
    http.expectOne(`${API}/roles`).flush({ data: [] });
    const fixture = TestBed.createComponent(component);
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const settle = async () => {
      await tick();
      await fixture.whenStable();
    };
    const button = (text: string, root: ParentNode = document) =>
      [...root.querySelectorAll<HTMLButtonElement>('button')].find((b) =>
        b.textContent?.trim().startsWith(text),
      );
    return { fixture, http, host, settle, button };
  }

  it('muestra el resumen por moneda y abre la pestaña de la URL', async () => {
    const { http, host, settle } = await setup(PaymentsPage, ['admin.access', 'payments.read'], {
      pestana: 'transferencias',
    });
    http.expectOne(`${API}/payments/summary`).flush({
      currencies: [
        {
          currency: 'MXN',
          collected: MXN(100000),
          refunded: MXN(0),
          net: MXN(100000),
          paymentCount: 1,
        },
        {
          currency: 'USD',
          collected: { amountCents: 5000, currency: 'USD' },
          refunded: { amountCents: 0, currency: 'USD' },
          net: { amountCents: 5000, currency: 'USD' },
          paymentCount: 1,
        },
      ],
      pendingTransfers: { count: 2, amount: MXN(1020000) },
      plans: { pastDue: 1, delinquent: 0, accessSuspended: 0 },
      pendingRefunds: 0,
    });
    await settle();
    // Sin `offers.read` no se piden ofertas para el filtro.
    http.expectNone((r) => r.url === `${API}/offers`);
    const transfers = http.expectOne((r) => r.url === `${API}/transfers`);
    expect(transfers.request.params.get('status')).toBe('PENDING_VALIDATION');
    transfers.flush({
      data: [transferPayment()],
      meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    });
    await settle();

    expect(host.textContent).toContain('Neto MXN');
    expect(host.textContent).toContain('Neto USD');
    expect(host.querySelector('.tabs__tab--active')?.textContent).toContain('2');
    expect(host.querySelector('tbody')?.textContent).toContain('Revisar');
  });

  it('validar con un monto menor ofrece rechazar con «Monto no coincide»', async () => {
    const { http, host, settle, button } = await setup(
      PaymentDetailPage,
      ['admin.access', 'payments.read', 'payments.manage'],
      { id: 'p2' },
    );
    http.expectOne(`${API}/payments/p2`).flush(transferPayment());
    await settle();

    button('Validar', host)!.click();
    await settle();
    const amount = document.querySelector<HTMLInputElement>('#transfer-received')!;
    amount.value = '5000';
    amount.dispatchEvent(new Event('input'));
    await settle();
    document.querySelector<HTMLFormElement>('#transfer-review-form')!.requestSubmit();
    await settle();
    const validate = http.expectOne(`${API}/transfers/p2/validate`);
    expect(validate.request.body).toEqual({
      receivedAmountCents: 500000,
      receivedOn: '2026-10-20',
    });
    validate.flush(
      {
        statusCode: 422,
        code: 'PAYMENT_TRANSFER_AMOUNT_MISMATCH',
        message: 'Monto menor',
        requestId: 'r',
        meta: { differenceCents: 10000 },
      },
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await settle();
    expect(document.querySelector('dialog[open] .adm-callout')?.textContent).toContain(
      '$100.00 MXN',
    );

    button('Rechazar con')!.click();
    await settle();
    document.querySelector<HTMLFormElement>('#transfer-review-form')!.requestSubmit();
    await settle();
    const reject = http.expectOne(`${API}/transfers/p2/reject`);
    expect(reject.request.body).toEqual({ reason: 'AMOUNT_MISMATCH' });
    reject.flush(
      transferPayment({ status: 'REJECTED', actions: { canRefund: false, canReview: false } }),
    );
    await settle();
    expect(host.querySelector('.adm-notice')?.textContent).toContain('Se rechazó la transferencia');
  });

  it('reembolsa en centavos, hasta lo reembolsable', async () => {
    const paid = transferPayment({
      method: 'CARD',
      status: 'PAID',
      refundable: MXN(510000),
      transfer: null,
      actions: { canRefund: true, canReview: false },
    });
    const { http, host, settle, button } = await setup(
      PaymentDetailPage,
      ['admin.access', 'payments.read', 'payments.manage'],
      { id: 'p2' },
    );
    http.expectOne(`${API}/payments/p2`).flush(paid);
    await settle();
    button('Reembolsar', host)!.click();
    await settle();
    expect(document.querySelector<HTMLInputElement>('#refund-amount')!.value).toBe('5100');
    const amount = document.querySelector<HTMLInputElement>('#refund-amount')!;
    amount.value = '1200.5';
    amount.dispatchEvent(new Event('input'));
    const reason = document.querySelector<HTMLTextAreaElement>('#refund-reason')!;
    reason.value = 'Baja parcial';
    reason.dispatchEvent(new Event('input'));
    await settle();
    document.querySelector<HTMLFormElement>('#refund-form')!.requestSubmit();
    await settle();
    const refund = http.expectOne(`${API}/payments/p2/refund`);
    expect(refund.request.body).toEqual({ amountCents: 120050, reason: 'Baja parcial' });
  });

  it('plan: sin `payments.manage` no hay acciones; con él, restablece el acceso con motivo', async () => {
    const readOnly = await setup(PlanDetailPage, ['admin.access', 'payments.read'], { id: 'pl1' });
    readOnly.http.expectOne(`${API}/payment-plans/pl1`).flush(plan);
    await readOnly.settle();
    expect(readOnly.host.querySelector('.actions')).toBeNull();
    expect(readOnly.host.textContent).toContain('Acceso suspendido');
    TestBed.resetTestingModule();

    const { http, host, settle, button } = await setup(
      PlanDetailPage,
      ['admin.access', 'payments.read', 'payments.manage'],
      { id: 'pl1' },
    );
    http.expectOne(`${API}/payment-plans/pl1`).flush(plan);
    await settle();
    expect([...host.querySelectorAll('.actions button')].map((b) => b.textContent?.trim())).toEqual(
      ['Reintentar cobro', 'Restablecer acceso', 'Cancelar plan'],
    );
    button('Restablecer acceso', host)!.click();
    await settle();
    const reason = document.querySelector<HTMLTextAreaElement>('dialog[open] textarea')!;
    reason.value = 'Acordó pagar el viernes';
    reason.dispatchEvent(new Event('input'));
    await settle();
    document.querySelector<HTMLFormElement>('dialog[open] form')!.requestSubmit();
    await settle();
    const restore = http.expectOne(`${API}/payment-plans/pl1/restore-access`);
    expect(restore.request.body).toEqual({ reason: 'Acordó pagar el viernes' });
  });
});
