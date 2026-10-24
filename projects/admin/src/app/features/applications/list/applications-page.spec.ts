import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SessionStore } from 'auth';
import {
  AdminApplicationListItemDto,
  apiErrorInterceptor,
  Permission,
  provideApi,
  UserProfileDto,
} from 'data-access';
import { AlertService } from 'ui-kit';
import { AdminAccess } from '../../../core/access/admin-access';
import ApplicationsPage from './applications-page';

const API = 'https://api.test/api/v1';
const item = (id: string, name: string): AdminApplicationListItemDto => ({
  id,
  folio: `BEC-2026-${id}`,
  kind: 'SCHOLARSHIP',
  status: 'SUBMITTED',
  applicant: { userId: `u-${id}`, name, email: `${id}@example.com`, countryCode: 'MX' },
  offer: { id: 'o1', name: 'Diplomado en Ecotecnologías del Agua', slug: 'eco' },
  requestedScholarshipTypeId: 't-al',
  requestedScholarshipType: {
    id: 't-al',
    key: 'AGUAS_LIBRES',
    name: 'Aguas Libres',
    minPercent: 50,
    maxPercent: 50,
    requiresInterview: false,
  },
  assignedScholarshipTypeId: null,
  assignedScholarshipType: null,
  assignedPercent: null,
  submittedAt: '2026-10-12T16:00:00.000Z',
  requiresInterview: false,
  interview: null,
  evaluationCount: 0,
  myEvaluation: null,
  responseDueAt: null,
});

const tick = () => new Promise((r) => setTimeout(r));
const isList = (url: string) => url === `${API}/admin/applications`;

describe('ApplicationsPage', () => {
  async function setup(permissions: Permission[]) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        { provide: AlertService, useValue: { open: () => Promise.resolve(true) } },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(SessionStore).setUser({ id: 'me', roles: [] } as unknown as UserProfileDto);
    const loaded = TestBed.inject(AdminAccess).load();
    http
      .expectOne(`${API}/admin/me`)
      .flush({ user: { id: 'me', email: '', fullName: 'Ana' }, roles: [], permissions });
    await loaded;
    http.expectOne(`${API}/admin/roles`).flush({ data: [] });

    const fixture = TestBed.createComponent(ApplicationsPage);
    await fixture.whenStable();
    http.expectOne(`${API}/locations/countries`).flush({ data: [{ code: 'MX', name: 'México' }] });
    const answer = async (data: AdminApplicationListItemDto[]) => {
      await tick();
      const req = http.expectOne((r) => isList(r.url));
      req.flush({ data, meta: { page: 1, pageSize: 20, total: data.length, totalPages: 1 } });
      await fixture.whenStable();
      return req.request.params;
    };
    const host = fixture.nativeElement as HTMLElement;
    return { fixture, http, host, answer };
  }

  it('abre en Becas, sin borradores, y muestra las insignias', async () => {
    const { host, http, answer } = await setup([
      'admin.access',
      'applications.read',
      'applications.evaluate',
    ]);
    const params = await answer([item('0041', 'María López')]);
    expect(params.get('kind')).toBe('SCHOLARSHIP');
    expect(params.has('status')).toBe(false);
    // Sin `offers.read` no pide las ofertas para el filtro.
    http.expectNone((r) => r.url === `${API}/admin/offers`);

    const row = host.querySelector('tbody tr')!;
    expect(row.textContent).toContain('BEC-2026-0041');
    expect(row.textContent).toContain('México');
    expect(row.textContent).toContain('Beca: Aguas Libres');
    expect(row.textContent).toContain('Sin mi evaluación');
  });

  it('cambia de pestaña y aplica los filtros como los espera la API', async () => {
    const { fixture, host, answer } = await setup(['admin.access', 'applications.read']);
    await answer([]);
    expect(host.querySelector('#applications-mine')).toBeNull();

    fixture.componentRef.setInput('tipo', 'convocatorias');
    await fixture.whenStable();
    let params = await answer([]);
    expect(params.get('kind')).toBe('OPEN_CALL');
    expect(host.querySelector('#applications-scholarship')).toBeNull();

    const select = (id: string, value: string) => {
      const el = host.querySelector<HTMLSelectElement>(id)!;
      el.value = value;
      el.dispatchEvent(new Event('change'));
    };
    select('#applications-status', 'IN_REVIEW');
    select('#applications-interview', 'true');
    await fixture.whenStable();
    params = await answer([]);
    expect(params.get('status')).toBe('IN_REVIEW');
    expect(params.get('requiresInterview')).toBe('true');
  });

  it('exporta con los filtros actuales y descarga el archivo', async () => {
    const { fixture, http, host, answer } = await setup(['admin.access', 'applications.read']);
    await answer([]);
    const created: string[] = [];
    URL.createObjectURL = () => (created.push('blob'), 'blob:x');
    URL.revokeObjectURL = () => undefined;

    [...host.querySelectorAll('button')].find((b) => b.textContent?.includes('Exportar'))!.click();
    await fixture.whenStable();
    const req = http.expectOne((r) => r.url === `${API}/admin/applications/export`);
    expect(req.request.params.get('kind')).toBe('SCHOLARSHIP');
    expect(req.request.params.has('page')).toBe(false);
    req.flush(new Blob(['folio'], { type: 'text/csv' }));
    await tick();
    expect(created).toEqual(['blob']);
  });
});
