import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { SessionStore } from 'auth';
import { UserProfileDto } from 'data-access';
import { apiErrorInterceptor, Permission, provideApi } from 'data-access';
import { AlertService } from 'ui-kit';
import { permissionGuard } from './access.guards';
import { AdminAccess } from './admin-access';

const API = 'https://api.test/api/v1';
const me = (permissions: string[]) => ({
  user: { id: 'u1', email: 'ana@x.org', fullName: 'Ana Pérez' },
  roles: ['PARTICIPANT', 'ACADEMIC_COORDINATOR'],
  permissions,
});

describe('AdminAccess', () => {
  let warnings: string[];

  beforeEach(() => {
    warnings = [];
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        {
          provide: AlertService,
          useValue: { warning: (title: string) => (warnings.push(title), Promise.resolve(true)) },
        },
      ],
    });
  });

  const http = () => TestBed.inject(HttpTestingController);

  // Como tras authGuard: la persona de la sesión ya está cargada.
  beforeEach(() =>
    TestBed.inject(SessionStore).setUser({
      id: 'u1',
      fullName: 'Ana Pérez',
      roles: [],
    } as unknown as UserProfileDto),
  );

  it('carga roles y permisos una sola vez aunque se pidan a la vez', async () => {
    const access = TestBed.inject(AdminAccess);
    const a = access.load();
    const b = access.load();
    http()
      .expectOne(`${API}/admin/me`)
      .flush(me(['admin.access', 'offers.read']));
    expect(await a).toBe('granted');
    expect(await b).toBe('granted');
    http().expectOne(`${API}/admin/roles`).flush({ data: [] });

    expect(access.can('offers.read')).toBe(true);
    expect(access.can('users.manage')).toBe(false);
    expect(access.roles()).toEqual(['ACADEMIC_COORDINATOR']);
    expect(await access.load()).toBe('granted');
    http().expectNone(`${API}/admin/me`);
  });

  it('distingue a quien no es del equipo (403) de un fallo de conexión', async () => {
    const access = TestBed.inject(AdminAccess);
    const forbidden = access.load();
    http()
      .expectOne(`${API}/admin/me`)
      .flush(
        { statusCode: 403, code: 'FORBIDDEN', message: 'No', requestId: 'r' },
        { status: 403, statusText: 'Forbidden' },
      );
    expect(await forbidden).toBe('forbidden');

    const offline = access.load();
    http().expectOne(`${API}/admin/me`).error(new ProgressEvent('error'));
    expect(await offline).toBe('error');
  });

  it('usa el nombre del rol del catálogo de la API', async () => {
    const access = TestBed.inject(AdminAccess);
    const loaded = access.load();
    http()
      .expectOne(`${API}/admin/me`)
      .flush(me(['admin.access']));
    await loaded;
    http()
      .expectOne(`${API}/admin/roles`)
      .flush({
        data: [{ role: 'ACADEMIC_COORDINATOR', label: 'Coordinación académica', permissions: [] }],
      });
    await Promise.resolve();
    expect(access.roleLabel('ACADEMIC_COORDINATOR')).toBe('Coordinación académica');
    expect(access.roleLabel('FINANCE')).toBe('FINANCE');
  });

  it('olvida el acceso al cerrar la sesión', async () => {
    const access = TestBed.inject(AdminAccess);
    const session = TestBed.inject(SessionStore);
    const loaded = access.load();
    http()
      .expectOne(`${API}/admin/me`)
      .flush(me(['admin.access']));
    await loaded;
    session.end('logout');
    TestBed.tick();
    expect(access.me()).toBeNull();
  });

  it('permissionGuard deja pasar con el permiso y si no vuelve al inicio con aviso', async () => {
    const access = TestBed.inject(AdminAccess);
    const loaded = access.load();
    http()
      .expectOne(`${API}/admin/me`)
      .flush(me(['admin.access', 'offers.read']));
    await loaded;

    const run = (permission: Permission) =>
      TestBed.runInInjectionContext(() =>
        permissionGuard(permission)({} as never, {} as never),
      ) as Promise<boolean | UrlTree>;

    expect(await run('offers.read')).toBe(true);
    const denied = await run('users.manage');
    expect(TestBed.inject(Router).serializeUrl(denied as UrlTree)).toBe('/');
    expect(warnings).toEqual(['Sin permiso']);
  });
});
