import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAuth } from 'auth';
import { apiErrorInterceptor, provideApi } from 'data-access';
import { PageHeading } from '../../core/page-heading/page-heading';
import ScholarshipApplicationPage from './scholarship-application-page';

const API = 'https://api.test/api/v1';
const submitted = {
  id: 'b1',
  folio: 'BEC-2027-0142',
  kind: 'SCHOLARSHIP',
  status: 'IN_REVIEW',
  offer: {
    id: 'o1',
    slug: 'eco',
    name: 'Diplomado en Ecotecnologías del Agua',
    cohortLabel: '2027-1',
  },
  submittedAt: '2026-12-02T15:00:00.000Z',
  updatedAt: '2026-12-02T15:00:00.000Z',
  requiresAction: false,
  action: { type: 'VIEW', enabled: true, reason: null, dueAt: null },
  timeline: [],
  interview: null,
  scholarshipResult: null,
  response: null,
  applicant: { phone: { countryCode: '+57', number: '3001234567' } },
  answers: {
    age: 34,
    requestedScholarshipType: { name: 'Aguas Libres', minPercent: 50, maxPercent: 50 },
    intentLetter: 'Mi carta',
    evidenceLinks: ['https://youtu.be/x'],
  },
  documents: [],
};

describe('ScholarshipApplicationPage', () => {
  async function render(flush: (http: HttpTestingController) => void) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ platformName: 'Portal' }),
      ],
    });
    const fixture = TestBed.createComponent(ScholarshipApplicationPage);
    fixture.componentRef.setInput('id', 'b1');
    TestBed.tick();
    flush(TestBed.inject(HttpTestingController));
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('enviada: muestra el seguimiento, lo que se envió y las migas', async () => {
    const host = await render((http) =>
      http.expectOne(`${API}/me/applications/b1`).flush(submitted),
    );
    expect(host.querySelector('portal-scholarship-tracker')).not.toBeNull();
    expect(host.querySelector('.sent')?.textContent).toContain('Aguas Libres (50%)');
    const heading = TestBed.inject(PageHeading).current();
    expect(heading.title).toBe('Mi postulación a beca');
    expect(heading.breadcrumb?.map((c) => c.label)).toEqual([
      'Becas',
      'Mis postulaciones',
      'Diplomado en Ecotecnologías del Agua · Cohorte 2027-1',
    ]);
  });

  it('si la postulación no existe, avisa sin romper la página', async () => {
    const host = await render((http) =>
      http
        .expectOne(`${API}/me/applications/b1`)
        .flush(
          { statusCode: 404, code: 'NOT_FOUND', message: 'No encontramos la postulación.' },
          { status: 404, statusText: 'Not Found' },
        ),
    );
    expect(host.querySelector('.notice')?.textContent).toContain('No encontramos la postulación.');
  });
});
