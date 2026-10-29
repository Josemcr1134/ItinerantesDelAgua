import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideCatalog } from 'catalog';
import { provideApi } from 'data-access';
import { LANDING_CATALOG } from '../../content/portal-links';
import CatalogPage from './catalog-page';

const API = 'https://api.test/api/v1/offers';

const offer = (id: string, extra: object = {}) => ({
  id,
  slug: id,
  name: `Oferta ${id}`,
  type: 'DIPLOMA',
  modality: 'ONLINE_LIVE',
  origin: 'NAS',
  availability: 'ENROLLMENT_OPEN',
  openCallStatus: null,
  summary: '',
  coverImageUrl: null,
  cohortLabel: null,
  publicTopic: null,
  dates: {
    enrollmentOpensAt: null,
    enrollmentClosesAt: '2026-10-30T23:59:00.000Z',
    startsAt: '2026-11-07T16:00:00.000Z',
    endsAt: '2027-03-31T19:00:00.000Z',
  },
  schedule: {
    timezone: 'America/Mexico_City',
    weekdays: [6, 7],
    startTime: '10:00',
    endTime: '13:00',
    firstSession: { startsAt: '2026-11-07T16:00:00.000Z', endsAt: '2026-11-07T19:00:00.000Z' },
  },
  totalHours: 60,
  venue: null,
  pricing: {
    kind: 'PAID',
    currency: 'USD',
    currencySource: 'TIMEZONE',
    price: { amountCents: 58500, currency: 'USD' },
    installments: { maxInstallments: 4 },
  },
  scholarship: { minPercent: 10, maxPercent: 80 },
  teacherNames: [],
  enrolled: false,
  ...extra,
});
const page = (data: object[], total: number, number = 1) => ({
  data,
  meta: { page: number, pageSize: 8, total, totalPages: Math.ceil(total / 8) },
});

describe('CatalogPage', () => {
  async function render(inputs: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideCatalog(LANDING_CATALOG),
      ],
    });
    const fixture = TestBed.createComponent(CatalogPage);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    TestBed.tick();
    return {
      fixture,
      http: TestBed.inject(HttpTestingController),
      host: fixture.nativeElement as HTMLElement,
    };
  }

  it('pide abiertas y próximas por defecto y muestra cada oferta con su costo y beca', async () => {
    const { fixture, http, host } = await render();
    const request = http.expectOne((r) => r.url === API);
    expect(request.request.params.get('status')).toBe('ENROLLMENT_OPEN,UPCOMING');
    expect(request.request.params.get('tz')).toBeTruthy();
    request.flush(
      page(
        [
          offer('eco'),
          offer('lluvia', {
            type: 'COURSE',
            pricing: {
              kind: 'FREE',
              currency: 'MXN',
              currencySource: 'TIMEZONE',
              price: null,
              installments: null,
            },
            scholarship: null,
          }),
        ],
        2,
      ),
    );
    await fixture.whenStable();

    const cards = host.querySelectorAll('cat-offer-card');
    expect(cards).toHaveLength(2);
    const first = cards[0].textContent?.replace(/\s+/g, ' ') ?? '';
    expect(first).toContain('Inscripciones abiertas');
    expect(first).toContain('7 nov 2026 – 31 mar 2027 · 60 h');
    expect(first).toContain('$585 USD');
    expect(first).toContain('hasta 4 cuotas');
    expect(first).toContain('Beca disponible · 10%–80%');
    expect(cards[1].textContent).toContain('Gratuito');
    expect(cards[0].querySelector('a')?.getAttribute('href')).toBe('/escuela/oferta/eco');
    expect(host.querySelector('.more')).toBeNull();
  });

  it('traduce los filtros de la URL a la consulta de la API', async () => {
    const { http } = await render({
      tipo: 'talleres',
      modalidad: 'presencial',
      estado: 'proximamente',
      beca: '1',
      q: 'humedal',
      topic: 'DRY_TOILETS',
    });
    const params = http.expectOne((r) => r.url === API).request.params;
    expect(params.getAll('type')).toEqual(['WORKSHOP']);
    expect(params.get('modality')).toBe('IN_PERSON');
    expect(params.getAll('status')).toEqual(['UPCOMING']);
    expect(params.get('scholarship')).toBe('true');
    expect(params.get('q')).toBe('humedal');
    expect(params.get('topic')).toBe('DRY_TOILETS');
  });

  it('paginación numerada: pide la página de la URL y cambia de página', async () => {
    const { fixture, http, host } = await render({ pagina: '2' });
    const request = http.expectOne((r) => r.url === API);
    expect(request.request.params.get('page')).toBe('2');
    request.flush(page([offer('i'), offer('j')], 18, 2));
    await fixture.whenStable();

    expect(host.querySelectorAll('cat-offer-card')).toHaveLength(2);
    const numbers = [...host.querySelectorAll('.ui-pagination__number')].map((b) =>
      b.textContent?.trim(),
    );
    expect(numbers).toEqual(['1', '2', '3']);
    expect(host.querySelector('ui-pagination [aria-current="page"]')?.textContent?.trim()).toBe(
      '2',
    );

    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    host.querySelector<HTMLButtonElement>('[aria-label="Página 3"]')!.click();
    expect(navigate.mock.calls[0][1]).toMatchObject({ queryParams: { pagina: 3 } });
  });

  it('con una sola página no muestra la paginación', async () => {
    const { fixture, http, host } = await render();
    http.expectOne((r) => r.url === API).flush(page([offer('a')], 1));
    await fixture.whenStable();
    expect(host.querySelector('ui-pagination')).toBeNull();
  });

  it('sin resultados con filtros ofrece limpiarlos', async () => {
    const { fixture, http, host } = await render({ tipo: 'eventos' });
    http.expectOne((r) => r.url === API).flush(page([], 0));
    await fixture.whenStable();
    expect(host.querySelector('.empty')?.textContent).toContain(
      'No encontramos ofertas con estos filtros.',
    );
    expect(host.querySelector('.empty button')?.textContent?.trim()).toBe('Limpiar filtros');
  });
});
