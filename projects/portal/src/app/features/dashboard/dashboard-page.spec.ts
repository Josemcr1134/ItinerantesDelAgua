import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAuth } from 'auth';
import { apiErrorInterceptor, DashboardDto, provideApi } from 'data-access';
import DashboardPage from './dashboard-page';

const API = 'https://api.test/api/v1';

const offer = {
  id: 'o1',
  slug: 'o1',
  name: 'Diplomado en Ecotecnologías',
  type: 'DIPLOMA',
  modality: 'ONLINE_LIVE',
};
const activity = (join: object | null) => ({
  id: 's1',
  source: 'SESSION',
  kind: 'SESSION',
  title: 'Clase 3',
  startsAt: '2026-10-26T00:00:00.000Z',
  offer,
  venue: null,
  join,
});
const dashboard = (overrides: Partial<Record<keyof DashboardDto, unknown>> = {}) => ({
  nextActivity: activity({
    state: 'OPEN',
    opensAt: '2026-10-25T23:50:00.000Z',
    url: 'https://zoom.us/j/1',
  }),
  formations: {
    items: [
      {
        enrollmentId: 'e1',
        status: 'ACTIVE',
        origin: 'NAS',
        offer: { ...offer, coverImageUrl: null },
        progress: { percent: 60 },
      },
    ],
    total: 4,
  },
  upcomingEvents: [
    { id: 'ev1', title: 'Clase 1' },
    { id: 'ev2', title: 'Clase 2' },
  ],
  recommendedResources: [{ id: 'l1', title: 'Manual de captación' }],
  notifications: { unread: 0, pinned: 0 },
  scholarships: {
    latest: { offer, status: 'IN_REVIEW' },
    openCount: 1,
    newCount: 0,
    actionRequired: 0,
  },
  openCalls: { latest: null, openCount: 3, newCount: 3, actionRequired: 0 },
  payments: { upcomingInstallments: [], alerts: [] },
  failedBlocks: [],
  ...overrides,
});

describe('DashboardPage', () => {
  async function render(body: object) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ platformName: 'Portal' }),
      ],
    });
    const fixture = TestBed.createComponent(DashboardPage);
    TestBed.tick();
    TestBed.inject(HttpTestingController).expectOne(`${API}/me/dashboard`).flush(body);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }
  const text = (host: HTMLElement, selector: string) =>
    [...host.querySelectorAll(selector)].map((el) => el.textContent?.replace(/\s+/g, ' ').trim());

  it('muestra la próxima actividad con su acceso, la formación y los accesos rápidos', async () => {
    const host = await render(dashboard());
    expect(host.querySelector('.card__title')?.textContent).toContain(
      'Diplomado en Ecotecnologías',
    );
    const join = host.querySelector<HTMLAnchorElement>('a.join');
    expect(join?.href).toBe('https://zoom.us/j/1');
    expect(join?.target).toBe('_blank');
    expect(host.querySelectorAll('portal-formation-card')).toHaveLength(1);
    expect(host.querySelector('.formations__all')?.textContent).toContain('(4)');
    expect(text(host, '.widget__number')).toEqual(['2', '3', '1', '1']);
    expect(text(host, '.row__label')).toEqual([
      'Clase 1',
      'Clase 2',
      'En revisión',
      'Manual de captación',
    ]);
  });

  it('sin enlace todavía: botón deshabilitado con la hora en que se abre', async () => {
    const host = await render(
      dashboard({
        nextActivity: activity({
          state: 'NOT_YET',
          opensAt: '2099-01-01T23:50:00.000Z',
          url: null,
        }),
      }),
    );
    expect(host.querySelector<HTMLButtonElement>('button.join')?.disabled).toBe(true);
    expect(host.querySelector('.card__hint')?.textContent).toContain('Disponible a las');
  });

  it('un bloque que no llegó muestra su aviso y los demás se ven igual', async () => {
    const host = await render(
      dashboard({ upcomingEvents: null, failedBlocks: ['upcomingEvents'] }),
    );
    expect(host.querySelector('#widget-calendar')?.closest('section')?.textContent).toContain(
      'No se pudo cargar esta información.',
    );
    expect(text(host, '.widget__number')).toEqual(['3', '1', '1']);
  });

  it('avisos de pago: cobro fallido destacado y el próximo cobro, hacia Mis pagos', async () => {
    const offerRef = { id: 'o1', slug: 'eco', name: 'Diplomado en Ecotecnologías' };
    const usd = (cents: number) => ({ amountCents: cents, currency: 'USD' });
    const host = await render(
      dashboard({
        payments: {
          alerts: [
            {
              type: 'INSTALLMENT_FAILED',
              offer: offerRef,
              amount: usd(19500),
              date: '2026-10-20T18:00:00.000Z',
              planId: 'pl1',
              paymentId: null,
              applicationId: null,
              card: null,
            },
          ],
          upcomingInstallments: [
            {
              type: 'INSTALLMENT_UPCOMING',
              offer: offerRef,
              amount: usd(19500),
              date: '2026-10-30T18:00:00.000Z',
              planId: 'pl1',
              paymentId: null,
              applicationId: null,
              card: { brand: 'Visa', last4: '4242' },
            },
          ],
        },
      }),
    );
    const notices = [...host.querySelectorAll('.notice')].map((n) =>
      n.textContent?.replace(/\s+/g, ' ').trim(),
    );
    expect(notices[0]).toContain('Cobro fallido: Diplomado en Ecotecnologías · $195 USD');
    expect(notices[1]).toContain(
      'Próximo cobro automático: $195 USD el 30 oct 2026 con Visa •••• 4242.',
    );
    expect(host.querySelector('.notice a')?.getAttribute('href')).toBe('/perfil?pestana=pagos');
  });

  it('sin cursos, actividades, convocatorias, becas ni materiales: todo en 0', async () => {
    const empty = { latest: null, openCount: 0, newCount: 0, actionRequired: 0 };
    const host = await render(
      dashboard({
        nextActivity: null,
        formations: { items: [], total: 0 },
        upcomingEvents: [],
        recommendedResources: [],
        scholarships: empty,
        openCalls: empty,
      }),
    );
    expect(text(host, '.widget__number')).toEqual(['0', '0', '0', '0']);
    expect(host.querySelectorAll('.row')).toHaveLength(0);
    expect(host.querySelector('.formations__empty')).not.toBeNull();
    expect(host.querySelector('.join')).toBeNull();
    expect(host.textContent).not.toContain('No se pudo cargar');
  });
});
