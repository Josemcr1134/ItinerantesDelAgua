import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAuth } from 'auth';
import { apiErrorInterceptor, provideApi } from 'data-access';
import { ExternalNavigation } from '../../../shared/external-navigation';
import CheckoutPage from './checkout-page';

const API = 'https://api.test/api/v1/me/payments';
const usd = (cents: number) => ({ amountCents: cents, currency: 'USD' });
const mxn = (cents: number) => ({ amountCents: cents, currency: 'MXN' });
const offer = {
  id: 'o1',
  slug: 'eco',
  name: 'Diplomado en Ecotecnologías',
  type: 'DIPLOMA',
  cohortLabel: '2027-1',
  startsAt: null,
  endsAt: null,
};
const option = (count: number, available = true) => ({
  count,
  available,
  reason: available ? null : 'LAST_INSTALLMENT_AFTER_END',
  perInstallment: usd(58500 / count),
  schedule: Array.from({ length: count }, (_, i) => ({
    id: `i${i}`,
    sequence: i + 1,
    amount: usd(58500 / count),
    dueAt: `2026-1${i}-01T06:00:00.000Z`,
    status: 'SCHEDULED',
    paidAt: null,
    attempts: 0,
    nextRetryAt: null,
    failureMessage: null,
  })),
});
const quote = (extra: object = {}) => ({
  concept: 'FULL_PRICE',
  offer,
  application: null,
  amount: usd(58500),
  methods: [
    { method: 'CARD', available: true, reason: null },
    { method: 'BANK_TRANSFER', available: false, reason: 'NOT_MEXICO' },
  ],
  installments: { max: 4, options: [option(2), option(3), option(4, false)] },
  bankTransfer: null,
  blocker: null,
  openCheckout: null,
  latestTransfer: null,
  ...extra,
});

describe('CheckoutPage', () => {
  async function render(inputs: Record<string, string>, body: object) {
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
    const fixture = TestBed.createComponent(CheckoutPage);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    TestBed.tick();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne((r) => r.url === `${API}/quote`).flush(body);
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const check = async (index: number) => {
      host.querySelectorAll<HTMLInputElement>('.check input')[index].click();
      await fixture.whenStable();
    };
    return { fixture, http, host, go, check };
  }

  it('en cuotas: muestra el calendario, pide autorizar el cobro y va al checkout de Stripe', async () => {
    const { fixture, http, host, go, check } = await render({ oferta: 'o1', cuotas: '1' }, quote());
    const options = [...host.querySelectorAll('.option')].map((o) =>
      o.textContent?.replace(/\s+/g, ' ').trim(),
    );
    expect(options[0]).toContain('Pago único');
    expect(options[0]).toContain('$585 USD');
    expect(options[3]).toContain('La última cuota caería después del fin de la oferta.');
    // Llega desde [Pagar en cuotas]: la primera opción disponible (2 cuotas).
    expect(host.querySelectorAll('.schedule__list li')).toHaveLength(2);
    expect(host.querySelector('.schedule__list li')?.textContent).toContain(
      'Se cobra al confirmar',
    );

    const pay = () => host.querySelector<HTMLButtonElement>('.panel > .button')!;
    expect(pay().textContent?.trim()).toBe('Pagar la 1.ª cuota ($292.50 USD)');
    expect(pay().disabled).toBe(true);
    await check(0);
    expect(pay().disabled).toBe(true);
    await check(1);
    expect(pay().disabled).toBe(false);

    pay().click();
    const request = http.expectOne(`${API}/checkout`);
    expect(request.request.body).toEqual({
      offerId: 'o1',
      termsAccepted: true,
      installmentCount: 2,
      autoDebitAuthorized: true,
    });
    request.flush({
      paymentId: 'p1',
      checkoutUrl: 'https://checkout.stripe.test/s1',
      expiresAt: '',
      reused: false,
    });
    await new Promise((r) => setTimeout(r));
    expect(go).toHaveBeenCalledWith('https://checkout.stripe.test/s1');
    await fixture.whenStable();
  });

  it('sin la pasarela configurada, lo explica en lugar de un error técnico', async () => {
    const { fixture, http, host, check } = await render({ oferta: 'o1' }, quote());
    await check(0);
    host.querySelector<HTMLButtonElement>('.panel > .button')!.click();
    http
      .expectOne(`${API}/checkout`)
      .flush(
        { statusCode: 503, code: 'PAYMENTS_NOT_CONFIGURED', message: 'Stripe' },
        { status: 503, statusText: 'Service Unavailable' },
      );
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
    expect(host.querySelector('.error')?.textContent).toContain(
      'Los pagos con tarjeta aún no están disponibles',
    );
  });

  it('si Stripe no responde, aclara que no hubo cargo', async () => {
    const { fixture, http, host, check } = await render({ oferta: 'o1' }, quote());
    await check(0);
    host.querySelector<HTMLButtonElement>('.panel > .button')!.click();
    http
      .expectOne(`${API}/checkout`)
      .flush(
        { statusCode: 502, code: 'PAYMENT_PROVIDER_ERROR', message: 'Stripe timeout' },
        { status: 502, statusText: 'Bad Gateway' },
      );
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
    expect(host.querySelector('.error')?.textContent).toContain('No se hizo ningún cargo');
  });

  it('saldo tras beca en México: ofrece transferencia con los datos bancarios', async () => {
    const { fixture, host } = await render(
      { postulacion: 'a1' },
      quote({
        concept: 'BALANCE',
        application: {
          id: 'a1',
          folio: 'BEC-1',
          kind: 'SCHOLARSHIP',
          status: 'APPROVED_PENDING_PAYMENT',
          assignedScholarshipTypeId: 't3',
          assignedScholarshipType: {
            id: 't3',
            key: 't3',
            name: 'Aguas Libres',
            minPercent: 50,
            maxPercent: 50,
            requiresInterview: false,
          },
          assignedPercent: 50,
          originalAmount: mxn(1097000),
          dueAt: '2026-12-27T06:00:00.000Z',
        },
        amount: mxn(548500),
        methods: [
          { method: 'CARD', available: true, reason: null },
          { method: 'BANK_TRANSFER', available: true, reason: null },
        ],
        installments: null,
        bankTransfer: {
          accountHolder: 'Escuela Itinerante del Agua AC',
          bankName: 'Banco',
          clabe: '012345678901234567',
          reference: 'EIA-BEC-1',
          amount: mxn(548500),
        },
      }),
    );
    expect(host.querySelector('.summary__total')?.textContent).toContain('$5,485 MXN');
    const transfer = [...host.querySelectorAll<HTMLInputElement>('input[name="pay-method"]')][1];
    transfer.click();
    await fixture.whenStable();
    expect(host.querySelector('portal-transfer-form')?.textContent).toContain('012345678901234567');
    expect(host.querySelector('portal-transfer-form')?.textContent).toContain('EIA-BEC-1');
  });

  it('ya inscrito: no deja pagar y lleva al aula', async () => {
    const { host } = await render(
      { oferta: 'o1' },
      quote({ blocker: { code: 'ENROLLMENT_ALREADY_EXISTS', meta: {} } }),
    );
    expect(host.querySelector('.blocked__title')?.textContent?.trim()).toBe(
      'Ya estás inscrito en esta formación.',
    );
    expect(host.querySelector('.blocked a')?.getAttribute('href')).toBe('/formacion/aula/o1');
    expect(host.querySelector('.panel > .button')).toBeNull();
  });
});
