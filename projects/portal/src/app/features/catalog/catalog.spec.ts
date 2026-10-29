import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideCatalog } from 'catalog';
import { provideApi } from 'data-access';
import { PageHeading } from '../../core/page-heading/page-heading';
import CatalogPage from './catalog-page';
import OfferPage from './offer-page';
import { PORTAL_CATALOG } from './portal-catalog';

const API = 'https://api.test/api/v1/offers';

const offer = {
  id: 'o1',
  slug: 'eco',
  name: 'Diplomado en Ecotecnologías del Agua',
  type: 'DIPLOMA',
  modality: 'ONLINE_LIVE',
  origin: 'NAS',
  availability: 'ENROLLMENT_OPEN',
  openCallStatus: null,
  summary: 'Resumen',
  coverImageUrl: null,
  cohortLabel: null,
  publicTopic: null,
  dates: {
    enrollmentOpensAt: null,
    enrollmentClosesAt: '2026-11-01T05:59:00Z',
    startsAt: '2026-11-07T16:00:00Z',
    endsAt: '2027-03-31T19:00:00Z',
    finalProjectDueAt: null,
  },
  schedule: null,
  totalHours: 60,
  venue: null,
  pricing: {
    kind: 'PAID',
    currency: 'MXN',
    currencySource: 'PROFILE',
    price: { amountCents: 1020000, currency: 'MXN' },
    installments: null,
  },
  scholarship: null,
  teacherNames: [],
  enrolled: false,
};

const action = (type: string, extra: object = {}) => ({
  type,
  enabled: true,
  primary: false,
  requiresLogin: true,
  reason: null,
  availableFrom: null,
  applicationId: null,
  applicationStatus: null,
  ...extra,
});

const detail = {
  ...offer,
  description: 'Descripción del diplomado.',
  learningOutcomes: [],
  requirements: null,
  carouselImageUrls: [],
  sessionCount: 36,
  calendarCategory: 'TRAINING',
  teachers: [],
  modules: [],
  scholarshipDetails: null,
  eligibility: null,
  capacity: { total: 30, soldOut: false },
  viewer: { authenticated: true, enrolled: false, application: null },
  actions: [action('ENROLL_AND_PAY', { primary: true })],
};

describe('Catálogo en el Portal', () => {
  async function render<T>(component: Type<T>, inputs: Record<string, unknown> = {}) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideCatalog(PORTAL_CATALOG),
      ],
    });
    const fixture = TestBed.createComponent(component);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    TestBed.tick();
    return {
      fixture,
      http: TestBed.inject(HttpTestingController),
      host: fixture.nativeElement as HTMLElement,
    };
  }

  it('el catálogo abre las fichas dentro del Portal', async () => {
    const { fixture, http, host } = await render(CatalogPage);
    expect(TestBed.inject(PageHeading).current().title).toBe('Catálogo');
    http
      .expectOne((r) => r.url === API)
      .flush({ data: [offer], meta: { page: 1, pageSize: 8, total: 1, totalPages: 1 } });
    await fixture.whenStable();
    const card = host.querySelector('cat-offer-card')!;
    expect(card.textContent).toContain('Diplomado en Ecotecnologías del Agua');
    expect(card.querySelector('a')?.getAttribute('href')).toBe('/catalogo/eco');
  });

  it('la ficha sigue en el Portal: acciones a /inscripcion y migas en el encabezado', async () => {
    const { fixture, http, host } = await render(OfferPage, { slug: 'eco' });
    http.expectOne((r) => r.url === `${API}/eco`).flush(detail);
    await fixture.whenStable();

    const primary = host.querySelector<HTMLAnchorElement>('.actions .action--primary')!;
    expect(primary.getAttribute('href')).toBe('/inscripcion/eco?accion=ENROLL_AND_PAY');
    // Ya hay sesión: sin el aviso de iniciar sesión ni las migas propias de la ficha.
    expect(host.querySelector('.actions__hint')).toBeNull();
    expect(host.querySelector('.crumbs')).toBeNull();
    expect(TestBed.inject(PageHeading).current().breadcrumb).toEqual([
      { label: 'Catálogo', link: '/catalogo' },
      { label: 'Diplomado en Ecotecnologías del Agua' },
    ]);
  });
});
