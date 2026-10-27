import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAuth } from 'auth';
import { apiErrorInterceptor, provideApi } from 'data-access';
import { ExternalNavigation } from '../../../shared/external-navigation';
import { MyPayments } from './my-payments';

const API = 'https://api.test/api/v1/me/payments';
const usd = (cents: number) => ({ amountCents: cents, currency: 'USD' });
const offer = { id: 'o1', slug: 'eco', name: 'Diplomado en Ecotecnologías' };
const plan = {
  id: 'pl1',
  status: 'PAST_DUE',
  concept: 'FULL_PRICE',
  offer,
  total: usd(58500),
  installmentCount: 3,
  paidCount: 1,
  paidAmount: usd(19500),
  pendingAmount: usd(39000),
  nextCharge: null,
  card: { brand: 'Visa', last4: '4242' },
  failedSince: '2026-10-20T06:00:00.000Z',
  delinquencyAt: null,
  daysSinceFailure: 6,
  accessSuspended: false,
  canPayNow: true,
  canUpdateCard: true,
  installments: [
    {
      id: 'i1',
      sequence: 1,
      amount: usd(19500),
      dueAt: '2026-09-20T06:00:00.000Z',
      status: 'PAID',
      paidAt: '2026-09-20T06:00:00.000Z',
      attempts: 1,
      nextRetryAt: null,
      failureMessage: null,
    },
    {
      id: 'i2',
      sequence: 2,
      amount: usd(19500),
      dueAt: '2026-10-20T06:00:00.000Z',
      status: 'FAILED',
      paidAt: null,
      attempts: 2,
      nextRetryAt: null,
      failureMessage: 'Fondos insuficientes',
    },
  ],
  activatedAt: '2026-09-20T06:00:00.000Z',
};

describe('MyPayments', () => {
  async function render() {
    const go = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ platformName: 'Portal' }),
        { provide: ExternalNavigation, useValue: { go, save: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(MyPayments);
    TestBed.tick();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${API}/summary`).flush({
      activePlans: [plan],
      alerts: [
        {
          type: 'INSTALLMENT_FAILED',
          offer,
          amount: usd(19500),
          date: '2026-10-20T06:00:00.000Z',
          planId: 'pl1',
          paymentId: null,
          applicationId: null,
          card: null,
        },
      ],
      hasPayments: true,
      moodleOnly: false,
    });
    http.expectOne(`${API}/plans`).flush({ data: [plan] });
    http.expectOne(`${API}?pageSize=50`).flush({
      data: [
        {
          id: 'p1',
          folio: 'PAG-1',
          concept: 'INSTALLMENT',
          conceptLabel: 'Cuota 1 de 3',
          method: 'CARD',
          status: 'PAID',
          amount: usd(19500),
          offer,
          receiptAvailable: true,
          transfer: null,
          checkout: null,
          failureMessage: null,
          createdAt: '2026-09-20T06:00:00.000Z',
          paidAt: '2026-09-20T06:00:00.000Z',
        },
      ],
      meta: { page: 1, pageSize: 50, total: 1, totalPages: 1 },
    });
    await fixture.whenStable();
    return { fixture, http, go, host: fixture.nativeElement as HTMLElement };
  }

  it('muestra el aviso de cobro fallido, el plan con sus cuotas y el historial', async () => {
    const { host } = await render();
    expect(host.querySelector('.alert__label')?.textContent?.trim()).toBe('Cobro fallido');
    expect(host.querySelector('.plan .chip')?.textContent?.trim()).toBe('Cobro fallido');
    expect(host.querySelector('.plan__meta')?.textContent).toContain('1 de 3 cuotas pagadas');
    expect(host.querySelector('.plan__meta')?.textContent).toContain('Visa •••• 4242');
    expect(host.querySelectorAll('.installments li')).toHaveLength(2);
    expect(host.querySelector('.payment__concept')?.textContent?.trim()).toBe('Cuota 1 de 3');
    expect(host.querySelector('.payment .chip')?.textContent?.trim()).toBe('Pagado');
  });

  it('[Actualizar tarjeta] lleva a Stripe', async () => {
    const { http, host, go } = await render();
    const update = [...host.querySelectorAll<HTMLButtonElement>('.plan .action')].find(
      (b) => b.textContent?.trim() === 'Actualizar tarjeta',
    )!;
    update.click();
    http
      .expectOne(`${API}/plans/pl1/card-update`)
      .flush({ checkoutUrl: 'https://checkout.stripe.test/setup', expiresAt: '' });
    await new Promise((r) => setTimeout(r));
    expect(go).toHaveBeenCalledWith('https://checkout.stripe.test/setup');
  });
});
