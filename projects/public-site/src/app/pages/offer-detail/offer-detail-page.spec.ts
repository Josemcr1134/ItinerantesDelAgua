import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideApi } from 'data-access';
import OfferDetailPage from './offer-detail-page';

const API = 'https://api.test/api/v1/offers/eco';
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
    finalProjectDueAt: '2027-03-20T05:59:00Z',
  },
  schedule: {
    timezone: 'America/Mexico_City',
    weekdays: [6, 7],
    startTime: '10:00',
    endTime: '13:00',
    firstSession: { startsAt: '2026-11-07T16:00:00Z', endsAt: '2026-11-07T19:00:00Z' },
  },
  totalHours: 60,
  venue: null,
  pricing: {
    kind: 'PAID',
    currency: 'USD',
    currencySource: 'TIMEZONE',
    price: { amountCents: 58500, currency: 'USD' },
    installments: { maxInstallments: 3 },
  },
  scholarship: { minPercent: 10, maxPercent: 80 },
  teacherNames: [],
  enrolled: false,
  description: 'Descripción del diplomado.',
  learningOutcomes: ['Aprendizaje 1', 'Aprendizaje 2'],
  requirements: null,
  carouselImageUrls: ['a.webp', 'b.webp'],
  sessionCount: 36,
  calendarCategory: 'TRAINING',
  teachers: [
    { id: 't1', fullName: 'Ana Pérez', photoUrl: null, bio: 'x'.repeat(200), cvUrl: 'https://cv' },
  ],
  modules: Array.from({ length: 9 }, (_, i) => ({
    number: i + 1,
    title: `Tema ${i + 1}`,
    description: 'Contenido',
  })),
  scholarshipDetails: {
    minPercent: 10,
    maxPercent: 80,
    windowStatus: 'OPEN',
    opensAt: null,
    closesAt: '2026-10-16T05:59:00Z',
    scholarshipTypes: [
      {
        scholarshipTypeId: 'a',
        scholarshipType: {
          id: 'a',
          key: 'a',
          name: 'Agua Viva',
          minPercent: 10,
          maxPercent: 10,
          requiresInterview: false,
        },
        description: null,
        estimatedScholarship: null,
        estimatedBalance: null,
        availableRecipients: null,
        isFull: false,
      },
      {
        scholarshipTypeId: 'e',
        scholarshipType: {
          id: 'e',
          key: 'e',
          name: 'Beca especial',
          minPercent: 71,
          maxPercent: 80,
          requiresInterview: true,
        },
        description: null,
        estimatedScholarship: null,
        estimatedBalance: null,
        availableRecipients: null,
        isFull: false,
      },
    ],
  },
  eligibility: null,
  capacity: { total: 30, soldOut: false },
  viewer: { authenticated: false, enrolled: false, application: null },
  actions: [
    action('APPLY_SCHOLARSHIP'),
    action('ENROLL_AND_PAY', { primary: true }),
    action('PAY_IN_INSTALLMENTS', { enabled: false, reason: 'ENROLLMENT_CLOSED' }),
  ],
};

describe('OfferDetailPage', () => {
  async function render(flush: (http: HttpTestingController) => void) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
      ],
    });
    const fixture = TestBed.createComponent(OfferDetailPage);
    fixture.componentRef.setInput('slug', 'eco');
    TestBed.tick();
    flush(TestBed.inject(HttpTestingController));
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('muestra la oferta, el temario y el costo por módulo y en cuotas', async () => {
    const host = await render((http) => http.expectOne((r) => r.url === API).flush(detail));
    expect(host.querySelector('h1')?.textContent?.trim()).toBe(
      'Diplomado en Ecotecnologías del Agua',
    );
    expect(host.querySelector('.section__meta')?.textContent?.trim()).toBe(
      '9 módulos · 60 h + proyecto final · aprox. 5 meses',
    );
    expect(host.querySelectorAll('details.module')).toHaveLength(9);
    expect(host.querySelector('details.module')?.hasAttribute('open')).toBe(true);
    expect(host.querySelector('.price')?.textContent?.trim()).toBe('$585 USD');
    expect(host.textContent).toContain(
      'Equivale a $65 USD por módulo o en 3 cuotas mensuales sin recargo.',
    );
    expect(host.querySelector('.grant')?.textContent).toContain(
      'Beca especial: entrevista por Zoom',
    );
  });

  it('las acciones llevan al Portal con la intención; las deshabilitadas, con su motivo', async () => {
    const host = await render((http) => http.expectOne((r) => r.url === API).flush(detail));
    const grant = host.querySelector<HTMLAnchorElement>('.grant .action')!;
    expect(grant.textContent?.trim()).toBe('Postular a beca');
    expect(grant.getAttribute('href')).toMatch(/\/inscripcion\/eco\?accion=APPLY_SCHOLARSHIP$/);
    const primary = host.querySelector<HTMLAnchorElement>('.actions .action--primary')!;
    expect(primary.textContent?.trim()).toBe('Inscribirme y pagar');
    expect(primary.getAttribute('href')).toMatch(/accion=ENROLL_AND_PAY$/);
    const off = host.querySelector('.actions .action--off');
    expect(off?.textContent?.trim()).toBe('Pagar en cuotas');
    expect(off?.getAttribute('aria-disabled')).toBe('true');
    expect(host.querySelector('.actions__note')?.textContent?.trim()).toBe(
      'Inscripciones cerradas',
    );
  });

  it('si la oferta no existe, lo dice y ofrece volver al catálogo', async () => {
    const host = await render((http) =>
      http
        .expectOne((r) => r.url === API)
        .flush(
          { statusCode: 404, code: 'OFFER_NOT_AVAILABLE', message: 'No disponible' },
          { status: 404, statusText: 'Not Found' },
        ),
    );
    expect(host.querySelector('.empty')?.textContent).toContain('Esta oferta no está disponible.');
  });
});
