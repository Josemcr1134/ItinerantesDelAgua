import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminDashboardDto, AdminDashboardTrendsDto, provideApi } from 'data-access';
import DashboardPage from './dashboard-page';

const API = 'https://api.test/api/v1/admin/dashboard';

const people = {
  total: 120,
  active: 110,
  pendingVerification: 8,
  disabled: 2,
  newInPeriod: 15,
  topCountries: [
    { countryCode: 'MX', count: 80 },
    { countryCode: 'CO', count: 20 },
  ],
};

/** Solo `admin.access`: personas y nada más. */
const minimal: AdminDashboardDto = {
  period: { from: '2026-09-29T00:00:00.000Z', to: '2026-10-29T00:00:00.000Z' },
  people,
  training: null,
  applications: null,
  payments: null,
  contact: null,
  tasks: [],
};

const full: AdminDashboardDto = {
  ...minimal,
  training: {
    publishedOffers: 6,
    offersInProgress: 3,
    enrollments: { active: 60, pendingPayment: 3, completed: 20, suspended: 1, cancelled: 0 },
    newEnrollmentsInPeriod: 18,
    bySource: [
      { source: 'PAYMENT', count: 12 },
      { source: 'SCHOLARSHIP', count: 30 },
      { source: 'MANUAL', count: 0 },
    ],
    upcomingSessions7d: 4,
    topOffers: [
      {
        id: 'o1',
        name: 'Diplomado en Ecotecnologías',
        type: 'DIPLOMA',
        enrolled: 29,
        capacity: 30,
      },
      { id: 'o2', name: 'Taller abierto', type: 'WORKSHOP', enrolled: 12, capacity: null },
    ],
  },
  applications: {
    byStatus: [
      { status: 'SUBMITTED', count: 4 },
      { status: 'IN_REVIEW', count: 3 },
      { status: 'EXPIRED', count: 0 },
    ],
    byKind: [
      { kind: 'SCHOLARSHIP', count: 20 },
      { kind: 'OPEN_CALL', count: 5 },
    ],
    toReview: 7,
    interviewsScheduled: 2,
    approvedPending: 3,
    submittedInPeriod: 9,
  },
  payments: {
    currencies: [
      {
        currency: 'MXN',
        collected: { amountCents: 5000000, currency: 'MXN' },
        refunded: { amountCents: 500000, currency: 'MXN' },
        net: { amountCents: 4500000, currency: 'MXN' },
        paymentCount: 40,
      },
      {
        currency: 'USD',
        collected: { amountCents: 25000, currency: 'USD' },
        refunded: { amountCents: 0, currency: 'USD' },
        net: { amountCents: 25000, currency: 'USD' },
        paymentCount: 2,
      },
    ],
    pendingTransfers: 2,
    plans: { pastDue: 1, delinquent: 1 },
    pendingRefunds: 0,
  },
  contact: { unread: 4 },
  tasks: [
    { key: 'TRANSFERS_TO_VALIDATE', label: 'Transferencias por validar', count: 2 },
    { key: 'CONTACT_UNREAD', label: 'Mensajes sin leer', count: 4 },
  ],
};

const trends = (withPayments: boolean): AdminDashboardTrendsDto => ({
  months: ['2026-09', '2026-10'].map((month, i) => ({
    month,
    newParticipants: 10 + i,
    newEnrollments: withPayments ? 5 + i : null,
    submittedApplications: withPayments ? 3 : null,
    netMxnCents: withPayments ? 4500000 : null,
    netUsdCents: withPayments ? 25000 : null,
  })),
});

describe('DashboardPage', () => {
  async function setup(data: AdminDashboardDto, inputs: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(DashboardPage);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    fixture.detectChanges();
    const overview = http.expectOne((r) => r.url === API);
    overview.flush(data);
    const withAll = data.payments !== null;
    http.expectOne((r) => r.url === `${API}/trends`).flush(trends(withAll));
    await fixture.whenStable();
    return { host: fixture.nativeElement as HTMLElement, request: overview.request };
  }

  it('sin permisos solo pinta Personas; sin pendientes, "todo al día"', async () => {
    const { host, request } = await setup(minimal);
    // 30 días: el periodo por defecto de la API.
    expect(request.params.keys()).toEqual([]);

    const titles = [...host.querySelectorAll('.card__title')].map((t) => t.textContent?.trim());
    expect(titles).toEqual(['Personas']);
    expect(host.querySelector('.hero__number')?.textContent).toContain('120');
    expect(host.querySelector('.tasks__empty')?.textContent).toContain('Todo al día');
    // Sin `users.manage`, la tarjeta no enlaza a Usuarios.
    expect(host.querySelector('.card__link')).toBeNull();
    // Sin las series de pagos no hay gráficas por moneda; la de altas tiene una serie.
    expect(host.querySelector('.money')).toBeNull();
    expect(host.querySelectorAll('.panel--wide adm-column-chart')).toHaveLength(1);
    expect(host.querySelector('.legend')).toBeNull();
    expect(host.textContent).toContain('México');
  });

  it('con todos los permisos: tarjetas, pendientes con su pantalla y montos por moneda', async () => {
    const { host } = await setup(full);

    const titles = [...host.querySelectorAll('.card__title')].map((t) => t.textContent?.trim());
    expect(titles).toEqual(['Personas', 'Formación', 'Postulaciones', 'Pagos', 'Mensajes']);

    const tasks = [...host.querySelectorAll<HTMLAnchorElement>('.task')];
    expect(tasks.map((t) => t.getAttribute('href'))).toEqual([
      '/pagos?pestana=transferencias',
      '/mensajes',
    ]);
    expect(tasks[0].textContent).toContain('Transferencias por validar');

    // MXN y USD por separado, nunca sumados.
    const payments = host.querySelector('#card-payments')!.closest('.card')!.textContent!;
    expect(payments).toContain('Neto MXN');
    expect(payments).toContain('$45,000');
    expect(payments).toContain('Neto USD');
    expect(payments).toContain('$250');
    expect(payments).toContain('42'); // 40 + 2 pagos
    expect(host.querySelectorAll('.money adm-column-chart')).toHaveLength(2);

    // Orígenes sin inscripciones fuera; el mayor primero.
    const sources = [...host.querySelectorAll('.panel adm-bar-list')][0].textContent!;
    expect(sources.indexOf('Beca')).toBeLessThan(sources.indexOf('Pago único'));
    expect(sources).not.toContain('Manual');

    // Ocupación: 29 de 30 → "Casi lleno"; sin cupo, sin barra.
    const offers = host.querySelectorAll('.offer');
    expect(offers[0].textContent).toContain('Casi lleno');
    expect(offers[1].querySelector('.meter')).toBeNull();
  });

  it('otro periodo pide el resumen desde esa fecha', async () => {
    const before = Date.now();
    const { request } = await setup(minimal, { periodo: '7' });
    const from = Date.parse(request.params.get('from')!);
    expect(before - from).toBeGreaterThanOrEqual(7 * 86_400_000 - 1000);
    expect(before - from).toBeLessThan(7 * 86_400_000 + 1000);
  });
});
