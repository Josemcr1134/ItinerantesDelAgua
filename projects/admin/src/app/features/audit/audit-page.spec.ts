import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SessionStore } from 'auth';
import {
  apiErrorInterceptor,
  AuditLogDto,
  Permission,
  provideApi,
  UserProfileDto,
} from 'data-access';
import { AlertService } from 'ui-kit';
import { AdminAccess } from '../../core/access/admin-access';
import AuditPage from './audit-page';

const API = 'https://api.test/api/v1/admin';
const tick = () => new Promise((r) => setTimeout(r));

const entry: AuditLogDto = {
  id: 'l1',
  actor: { id: null, email: 'antes@itinerantes.org', fullName: null },
  action: 'site.metric.update',
  entityType: 'SiteMetric',
  entityId: 'PEOPLE_TRAINED',
  summary: 'Editó la cifra «Personas formadas»',
  changes: { before: { value: 1800, visible: false }, after: { value: 1950, visible: true } },
  createdAt: '2026-10-20T15:00:00.000Z',
};

describe('AuditPage', () => {
  async function setup(permissions: Permission[], inputs: Record<string, string> = {}) {
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
      .expectOne(`${API}/me`)
      .flush({ user: { id: 'me', email: '', fullName: 'Ana' }, roles: [], permissions });
    await loaded;
    http.expectOne(`${API}/roles`).flush({ data: [] });
    const fixture = TestBed.createComponent(AuditPage);
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    await fixture.whenStable();
    const settle = async () => {
      await tick();
      await fixture.whenStable();
    };
    const host = fixture.nativeElement as HTMLElement;
    return { fixture, http, host, settle };
  }

  it('muestra cada acción con su antes y después; sin `users.manage` no filtra por persona', async () => {
    const { http, host, settle } = await setup(['admin.access', 'audit.read']);
    http.expectNone((r) => r.url === `${API}/users`);
    await settle();
    http
      .expectOne((r) => r.url === `${API}/audit-logs`)
      .flush({ data: [entry], meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 } });
    await settle();

    expect(host.textContent).toContain('Editó la cifra «Personas formadas»');
    expect(host.textContent).toContain('cuenta borrada');
    expect(host.querySelector('#audit-actor')).toBeNull();
    const changes = host.querySelector('adm-audit-changes')!.textContent!;
    expect(changes).toContain('Ver cambios (2 campos)');
    expect(changes).toContain('1800');
    expect(changes).toContain('1950');
    expect(changes).toContain('Sí');
  });

  it('con `?entidad=&entidadId=` muestra el historial de esa entidad; la búsqueda filtra por acción', async () => {
    const { fixture, http, host, settle } = await setup(['admin.access', 'audit.read'], {
      entidad: 'Offer',
      entidadId: 'o1',
    });
    await settle();
    const first = http.expectOne((r) => r.url === `${API}/audit-logs`);
    expect(first.request.params.get('entityType')).toBe('Offer');
    expect(first.request.params.get('entityId')).toBe('o1');
    first.flush({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } });
    await settle();
    expect(host.querySelector('.entity')?.textContent).toContain('Historial de');

    const search = host.querySelector<HTMLInputElement>('#audit-action')!;
    search.value = 'offer.';
    search.dispatchEvent(new Event('input'));
    await new Promise((r) => setTimeout(r, 400));
    await fixture.whenStable();
    await settle();
    const filtered = http.expectOne((r) => r.url === `${API}/audit-logs`);
    expect(filtered.request.params.get('action')).toBe('offer.');
    expect(filtered.request.params.has('q')).toBe(false);
  });
});
