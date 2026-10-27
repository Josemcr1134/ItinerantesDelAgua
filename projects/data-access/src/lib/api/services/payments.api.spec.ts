import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApi } from '../api-config';
import { SKIP_GLOBAL_LOADER } from '../http-context';
import { PaymentsApi } from './payments.api';

const API = 'https://api.test/api/v1/me/payments';

describe('PaymentsApi', () => {
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
    const api = TestBed.inject(PaymentsApi);
    const http = TestBed.inject(HttpTestingController);
    const cases: [() => unknown, string, string][] = [
      [() => api.quote({ offerId: 'o1' }).subscribe(), 'GET', `${API}/quote?offerId=o1`],
      [
        () => api.checkout({ offerId: 'o1', termsAccepted: true }).subscribe(),
        'POST',
        `${API}/checkout`,
      ],
      [() => api.list({ pageSize: 20 }).subscribe(), 'GET', `${API}?pageSize=20`],
      [() => api.summary().subscribe(), 'GET', `${API}/summary`],
      [() => api.plans().subscribe(), 'GET', `${API}/plans`],
      [() => api.plan('p1').subscribe(), 'GET', `${API}/plans/p1`],
      [() => api.updateCard('p1').subscribe(), 'POST', `${API}/plans/p1/card-update`],
      [() => api.payNow('p1').subscribe(), 'POST', `${API}/plans/p1/pay-now`],
      [() => api.cancel('x1').subscribe(), 'POST', `${API}/x1/cancel`],
      [() => api.transferProof('x1').subscribe(), 'GET', `${API}/x1/transfer-proof`],
      [() => api.receipt('x1').subscribe(), 'GET', `${API}/x1/receipt`],
    ];
    for (const [call, method, url] of cases) {
      call();
      expect(http.expectOne(url).request.method).toBe(method);
    }
    http.verify();
  });

  it('el estado del pago al volver de Stripe se consulta sin el loader general', () => {
    const api = TestBed.inject(PaymentsApi);
    const http = TestBed.inject(HttpTestingController);
    api.get('x1', { silent: true }).subscribe();
    expect(http.expectOne(`${API}/x1`).request.context.get(SKIP_GLOBAL_LOADER)).toBe(true);
  });

  it('envía el comprobante de transferencia: URL firmada, PUT y confirmación', () => {
    const api = TestBed.inject(PaymentsApi);
    const http = TestBed.inject(HttpTestingController);
    const file = new File(['x'], 'spei.pdf', { type: 'application/pdf' });
    api
      .submitTransfer(file, {
        applicationId: 'a1',
        declaredAmountCents: 548500,
        paidOn: '2026-10-26',
        trackingKey: 'ABC123',
      })
      .subscribe();
    const target = http.expectOne(`${API}/transfers/upload-url`);
    expect(target.request.body).toEqual({
      applicationId: 'a1',
      fileName: 'spei.pdf',
      contentType: 'application/pdf',
      sizeBytes: 1,
    });
    target.flush({
      uploadUrl: 'https://storage.test/up',
      method: 'PUT',
      headers: { 'Content-Type': 'application/pdf' },
      key: 'k1',
      expiresAt: '2026-10-27T00:00:00Z',
    });
    http.expectOne('https://storage.test/up').flush(null);
    const submit = http.expectOne(`${API}/transfers`);
    expect(submit.request.body).toEqual({
      applicationId: 'a1',
      declaredAmountCents: 548500,
      paidOn: '2026-10-26',
      trackingKey: 'ABC123',
      key: 'k1',
      fileName: 'spei.pdf',
    });
  });
});
