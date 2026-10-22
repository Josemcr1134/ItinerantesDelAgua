import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SessionStore } from 'auth';
import { AdminUserDto, apiErrorInterceptor, provideApi, UserProfileDto } from 'data-access';
import { AlertService } from 'ui-kit';
import { AdminAccess } from '../../core/access/admin-access';
import AdministratorsPage from './administrators-page';

const API = 'https://api.test/api/v1';
const tick = () => new Promise((resolve) => setTimeout(resolve, 350));

const user = (id: string, fullName: string, roles: AdminUserDto['roles']): AdminUserDto => ({
  id,
  fullName,
  email: `${id}@x.org`,
  username: id,
  roles: ['PARTICIPANT', ...roles],
  permissions: [],
  status: 'ACTIVE',
  countryCode: 'MX',
  lastLoginAt: null,
  createdAt: '2026-10-01T12:00:00.000Z',
});

describe('AdministratorsPage', () => {
  let confirmAnswer: boolean;

  async function setup() {
    confirmAnswer = true;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        {
          provide: AlertService,
          useValue: {
            confirm: () => Promise.resolve(confirmAnswer),
            open: () => Promise.resolve(true),
          },
        },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    // Sesión iniciada (como tras authGuard) y mi acceso: soy la superadministradora "me".
    TestBed.inject(SessionStore).setUser({
      id: 'me',
      fullName: 'Ana',
      roles: [],
    } as unknown as UserProfileDto);
    const access = TestBed.inject(AdminAccess);
    const loaded = access.load();
    http.expectOne(`${API}/admin/me`).flush({
      user: { id: 'me', email: 'me@x.org', fullName: 'Ana' },
      roles: ['PARTICIPANT', 'SUPER_ADMIN'],
      permissions: ['admin.access', 'users.manage'],
    });
    await loaded;
    http.expectOne(`${API}/admin/roles`).flush({ data: [] });

    const fixture = TestBed.createComponent(AdministratorsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const list = http.expectOne((req) => req.url === `${API}/admin/users`);
    expect(list.request.params.get('staffOnly')).toBe('true');
    list.flush({
      data: [user('me', 'Ana', ['SUPER_ADMIN']), user('u2', 'Laura', ['FINANCE'])],
      meta: { page: 1, pageSize: 20, total: 2, totalPages: 1 },
    });
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    /** Opción del menú "Más acciones" de una fila (`undefined` si no hay menú). */
    const menuItem = (row: number, text: string) =>
      [
        ...host
          .querySelectorAll('tbody tr')
          [row].querySelectorAll<HTMLButtonElement>('.adm-menuitem'),
      ].find((b) => b.textContent?.includes(text));
    return { fixture, http, host, menuItem };
  }

  it('lista al equipo y no ofrece deshabilitarme ni quitarme del equipo', async () => {
    const { host, menuItem } = await setup();
    expect(host.querySelectorAll('tbody tr').length).toBe(2);
    // Mi fila no tiene menú de acciones; la de Laura sí, con sus dos opciones.
    expect(host.querySelectorAll('tbody tr')[0].querySelector('adm-row-menu')).toBeNull();
    expect(menuItem(1, 'Deshabilitar cuenta')?.disabled).toBe(false);
    expect(menuItem(1, 'Quitar del equipo')?.disabled).toBe(false);
  });

  it('quitar del equipo deja la cuenta sin roles del equipo y recarga la lista', async () => {
    const { fixture, http, host, menuItem } = await setup();
    menuItem(1, 'Quitar del equipo')!.click();
    await fixture.whenStable();
    const req = http.expectOne(`${API}/admin/users/u2/roles`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ roles: [] });
    req.flush(user('u2', 'Laura', []));
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
    http
      .expectOne((r) => r.url === `${API}/admin/users`)
      .flush({
        data: [user('me', 'Ana', ['SUPER_ADMIN'])],
        meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      });
    await fixture.whenStable();
    expect(host.querySelector('[role="status"]')?.textContent).toContain(
      'Laura ya no forma parte del equipo',
    );
  });

  it('si cancelo la confirmación no llama a la API', async () => {
    const { fixture, http, menuItem } = await setup();
    confirmAnswer = false;
    menuItem(1, 'Deshabilitar cuenta')!.click();
    await fixture.whenStable();
    http.expectNone(`${API}/admin/users/u2/disable`);
  });

  it('al buscar filtra en la API (con espera) y vuelve a la página 1', async () => {
    const { fixture, http, host } = await setup();
    const input = host.querySelector<HTMLInputElement>('#admins-search')!;
    input.value = 'lau';
    input.dispatchEvent(new Event('input'));
    await tick();
    await fixture.whenStable();
    const req = http.expectOne((r) => r.url === `${API}/admin/users`);
    expect(req.request.params.get('q')).toBe('lau');
    expect(req.request.params.get('page')).toBe('1');
    req.flush({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } });
    await fixture.whenStable();
    expect(host.textContent).toContain('No hay administradores con esos filtros');
  });
});
