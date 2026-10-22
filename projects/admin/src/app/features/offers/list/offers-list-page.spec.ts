import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SessionStore } from 'auth';
import { apiErrorInterceptor, Permission, provideApi, UserProfileDto } from 'data-access';
import { AlertService } from 'ui-kit';
import { AdminAccess } from '../../../core/access/admin-access';
import { offerFixture } from '../testing/offer-fixture';
import OffersListPage from './offers-list-page';

const API = 'https://api.test/api/v1';

describe('OffersListPage', () => {
  async function setup(permissions: Permission[]) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        {
          provide: AlertService,
          useValue: { confirm: () => Promise.resolve(true), open: () => Promise.resolve(true) },
        },
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

    const fixture = TestBed.createComponent(OffersListPage);
    await fixture.whenStable();
    const draft = offerFixture();
    const published = offerFixture({
      id: 'o2',
      name: 'Diplomado',
      publicationStatus: 'PUBLISHED',
      adminStatus: 'PUBLISHED',
      counts: { enrollments: 5, applications: 0, sessions: 0, modules: 0 },
    });
    http
      .expectOne((r) => r.url === `${API}/admin/offers`)
      .flush({
        data: [draft, published],
        meta: { page: 1, pageSize: 20, total: 2, totalPages: 1 },
      });
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const menuItems = (row: number) =>
      [...host.querySelectorAll('tbody tr')[row].querySelectorAll('.adm-menuitem')].map((b) =>
        b.textContent?.trim(),
      );
    return { host, menuItems };
  }

  it('solo lectura: sin "Nueva oferta" ni acciones de estado, y "Ver" en lugar de "Editar"', async () => {
    const { host, menuItems } = await setup(['admin.access', 'offers.read']);
    expect(host.textContent).not.toContain('Nueva oferta');
    // Solo puede ir al contenido del aula (en lectura).
    expect(menuItems(0)).toEqual(['Contenido del aula']);
    expect(host.querySelector('tbody .adm-action')?.textContent).toContain('Ver');
  });

  it('con offers.publish ofrece las acciones válidas para cada estado', async () => {
    const { host, menuItems } = await setup([
      'admin.access',
      'offers.read',
      'offers.write',
      'offers.publish',
    ]);
    expect(host.textContent).toContain('Nueva oferta');
    expect(menuItems(0)).toEqual([
      'Contenido del aula',
      'Publicar',
      'Archivar',
      'Duplicar (nueva cohorte)',
      'Borrar borrador',
    ]);
    expect(menuItems(1)).toEqual([
      'Contenido del aula',
      'Volver a borrador',
      'Archivar',
      'Duplicar (nueva cohorte)',
    ]);
  });
});
