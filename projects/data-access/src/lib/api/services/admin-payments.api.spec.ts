import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApi } from '../api-config';
import { AdminPaymentsApi } from './admin-payments.api';

const API = 'https://api.test/api/v1/admin';

describe('AdminPaymentsApi', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
      ],
    }),
  );

  it('usa la ruta de cada operación', () => {
    const api = TestBed.inject(AdminPaymentsApi);
    const http = TestBed.inject(HttpTestingController);
    const reason = { reason: 'Acuerdo con la persona' };
    const cases: [() => unknown, string, string][] = [
      [() => api.summary().subscribe(), 'GET', `${API}/payments/summary`],
      [() => api.detail('p1').subscribe(), 'GET', `${API}/payments/p1`],
      [() => api.proof('p1').subscribe(), 'GET', `${API}/payments/p1/proof`],
      [
        () => api.refund('p1', { amountCents: 100, reason: 'Baja' }).subscribe(),
        'POST',
        `${API}/payments/p1/refund`,
      ],
      [
        () =>
          api
            .validateTransfer('p1', { receivedAmountCents: 510000, receivedOn: '2026-10-20' })
            .subscribe(),
        'POST',
        `${API}/transfers/p1/validate`,
      ],
      [
        () => api.rejectTransfer('p1', { reason: 'ILLEGIBLE' }).subscribe(),
        'POST',
        `${API}/transfers/p1/reject`,
      ],
      [() => api.planDetail('pl1').subscribe(), 'GET', `${API}/payment-plans/pl1`],
      [() => api.retryPlan('pl1').subscribe(), 'POST', `${API}/payment-plans/pl1/retry`],
      [
        () => api.markDelinquent('pl1').subscribe(),
        'POST',
        `${API}/payment-plans/pl1/mark-delinquent`,
      ],
      [
        () => api.suspendAccess('pl1', reason).subscribe(),
        'POST',
        `${API}/payment-plans/pl1/suspend-access`,
      ],
      [
        () => api.restoreAccess('pl1', reason).subscribe(),
        'POST',
        `${API}/payment-plans/pl1/restore-access`,
      ],
      [() => api.cancelPlan('pl1', reason).subscribe(), 'POST', `${API}/payment-plans/pl1/cancel`],
    ];
    for (const [call, method, url] of cases) {
      call();
      expect(http.expectOne(url).request.method).toBe(method);
    }
    http.verify();
  });

  it('envía los estados separados por coma en pagos y planes', () => {
    const api = TestBed.inject(AdminPaymentsApi);
    const http = TestBed.inject(HttpTestingController);
    api.list({ status: ['PAID', 'VALIDATED'], currency: 'MXN' }).subscribe();
    const list = http.expectOne((r) => r.url === `${API}/payments`);
    expect(list.request.params.get('status')).toBe('PAID,VALIDATED');
    expect(list.request.params.get('currency')).toBe('MXN');

    api.plans({ status: ['PAST_DUE', 'DELINQUENT'] }).subscribe();
    const plans = http.expectOne((r) => r.url === `${API}/payment-plans`);
    expect(plans.request.params.get('status')).toBe('PAST_DUE,DELINQUENT');

    api.transfers().subscribe();
    http.expectOne((r) => r.url === `${API}/transfers`);
    api.refunds({ status: 'PENDING' }).subscribe();
    expect(http.expectOne((r) => r.url === `${API}/refunds`).request.params.get('status')).toBe(
      'PENDING',
    );
  });
});
