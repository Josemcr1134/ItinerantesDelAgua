import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAuth } from 'auth';
import { apiErrorInterceptor, provideApi } from 'data-access';
import PaymentResultPage, { POLL_MS } from './payment-result-page';

const API = 'https://api.test/api/v1/me/payments';
const payment = (status: string) => ({
  id: 'p1',
  folio: 'PAG-1',
  concept: 'FULL_PRICE',
  conceptLabel: 'Pago completo · Diplomado en Ecotecnologías',
  status,
  offer: { id: 'o1', slug: 'eco', name: 'Diplomado' },
  applicationId: null,
  receiptAvailable: status === 'PAID',
});

describe('PaymentResultPage', () => {
  async function render(result: string) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ platformName: 'Portal' }),
      ],
    });
    const fixture = TestBed.createComponent(PaymentResultPage);
    fixture.componentRef.setInput('paymentId', 'p1');
    fixture.componentRef.setInput('result', result);
    fixture.detectChanges();
    return {
      fixture,
      http: TestBed.inject(HttpTestingController),
      host: fixture.nativeElement as HTMLElement,
    };
  }

  afterEach(() => vi.useRealTimers());

  it('éxito: "Procesando…" hasta que la API confirma el pago', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout'] });
    const { fixture, http, host } = await render('success');
    await vi.waitFor(() => http.expectOne(`${API}/p1`).flush(payment('PENDING')));
    await fixture.whenStable();
    expect(host.querySelector('.card__title')?.textContent?.trim()).toBe('Procesando tu pago…');

    vi.advanceTimersByTime(POLL_MS);
    await vi.waitFor(() => http.expectOne(`${API}/p1`).flush(payment('PAID')));
    await fixture.whenStable();
    expect(host.querySelector('.card__title')?.textContent?.trim()).toBe('Pago confirmado');
    expect(host.querySelector('.card__folio')?.textContent?.trim()).toBe('Folio: PAG-1');
    expect(host.querySelector('a.button')?.getAttribute('href')).toBe('/formacion/aula/o1');
  });

  it('éxito pero cancelado en Stripe: "no se completó" con Reintentar', async () => {
    const { fixture, http, host } = await render('success');
    await vi.waitFor(() => http.expectOne(`${API}/p1`).flush(payment('CANCELLED')));
    await fixture.whenStable();
    expect(host.querySelector('.card__title')?.textContent?.trim()).toBe('El pago no se completó');
    expect(host.querySelector('a.button')?.textContent?.trim()).toBe('Reintentar');
    http.expectNone(`${API}/p1/cancel`);
  });

  it('sigue pendiente tras un minuto: avisaremos por correo', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'Date'] });
    const { fixture, http, host } = await render('success');
    await vi.waitFor(() => http.expectOne(`${API}/p1`).flush(payment('PENDING')));
    vi.setSystemTime(Date.now() + 61_000);
    vi.advanceTimersByTime(POLL_MS);
    await vi.waitFor(() => http.expectOne(`${API}/p1`).flush(payment('PENDING')));
    await fixture.whenStable();
    expect(host.querySelector('.card__text')?.textContent).toContain('te avisaremos por correo');
  });

  it('cancelado: cierra el checkout y dice que no hubo cargo', async () => {
    const { fixture, http, host } = await render('cancel');
    await vi.waitFor(() => http.expectOne(`${API}/p1/cancel`).flush(null));
    await vi.waitFor(() => http.expectOne(`${API}/p1`).flush(payment('CANCELLED')));
    await fixture.whenStable();
    expect(host.querySelector('.card__title')?.textContent?.trim()).toBe('Pago cancelado');
    expect(host.querySelector('a.button')?.getAttribute('href')).toBe('/pago?oferta=o1');
  });
});
