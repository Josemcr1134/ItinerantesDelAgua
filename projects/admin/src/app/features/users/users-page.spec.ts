import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SessionStore } from 'auth';
import { AdminUserDto, apiErrorInterceptor, provideApi, UserProfileDto } from 'data-access';
import { AlertService } from 'ui-kit';
import { AdminAccess } from '../../core/access/admin-access';
import UsersPage from './users-page';

const API = 'https://api.test/api/v1';
const settle = () => new Promise((resolve) => setTimeout(resolve));

const account = (
  id: string,
  fullName: string,
  extra: Partial<AdminUserDto> = {},
): AdminUserDto => ({
  id,
  fullName,
  email: `${id}@x.org`,
  username: id,
  roles: ['PARTICIPANT'],
  permissions: [],
  status: 'ACTIVE',
  countryCode: 'MX',
  emailVerifiedAt: '2026-10-01T12:00:00.000Z',
  lastLoginAt: null,
  createdAt: '2026-10-01T12:00:00.000Z',
  ...extra,
});

describe('UsersPage', () => {
  async function setup() {
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
    http.expectOne(`${API}/admin/me`).flush({
      user: { id: 'me', email: 'me@x.org', fullName: 'Ana' },
      roles: ['PARTICIPANT', 'SUPER_ADMIN'],
      permissions: ['admin.access', 'users.manage'],
    });
    await loaded;
    http.expectOne(`${API}/admin/roles`).flush({
      data: [
        { role: 'PARTICIPANT', label: 'Participante', permissions: [] },
        { role: 'FINANCE', label: 'Finanzas', permissions: ['payments.read'] },
      ],
    });

    const fixture = TestBed.createComponent(UsersPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const list = http.expectOne((req) => req.url === `${API}/admin/users`);
    list.flush({
      data: [
        account('me', 'Ana', { roles: ['PARTICIPANT', 'SUPER_ADMIN'] }),
        account('p1', 'Lucía Torres', {
          countryCode: 'CO',
          status: 'PENDING_VERIFICATION',
          emailVerifiedAt: null,
        }),
      ],
      meta: { page: 1, pageSize: 20, total: 2, totalPages: 1 },
    });
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const row = (index: number) => host.querySelectorAll('tbody tr')[index];
    const menuItem = (index: number, text: string) =>
      [...row(index).querySelectorAll<HTMLButtonElement>('.adm-menuitem')].find((b) =>
        b.textContent?.includes(text),
      );
    return { fixture, http, host, row, menuItem, request: list.request };
  }

  it('lista todas las cuentas (no solo el equipo), con país, rol y verificación', async () => {
    const { host, row, request } = await setup();
    expect(request.params.has('staffOnly')).toBe(false);
    expect(request.params.get('sort')).toBe('CREATED_DESC');

    const participant = row(1).textContent ?? '';
    expect(participant).toContain('Lucía Torres');
    expect(participant).toContain('Colombia');
    expect(participant).toContain('Participante');
    expect(participant).toContain('Correo sin verificar');
    // Mi fila no tiene menú (no puedo deshabilitarme).
    expect(row(0).querySelector('adm-row-menu')).toBeNull();
    // El filtro de rol incluye a los participantes.
    const roles = [...host.querySelectorAll('#users-role option')].map((o) =>
      o.textContent?.trim(),
    );
    expect(roles).toContain('Participante');
  });

  it('deshabilita la cuenta de un participante tras confirmar', async () => {
    const { fixture, http, row, menuItem } = await setup();
    menuItem(1, 'Deshabilitar cuenta')!.click();
    await fixture.whenStable();
    const request = http.expectOne(`${API}/admin/users/p1/disable`);
    expect(request.request.method).toBe('POST');
    request.flush(account('p1', 'Lucía Torres', { status: 'DISABLED', emailVerifiedAt: null }));
    await settle();
    await fixture.whenStable();
    expect(row(1).classList).toContain('row--disabled');
    expect(fixture.nativeElement.textContent).toContain(
      'Se deshabilitó la cuenta de Lucía Torres.',
    );
  });

  it('marca el correo como verificado', async () => {
    const { fixture, http, row, menuItem } = await setup();
    menuItem(1, 'Marcar correo como verificado')!.click();
    await fixture.whenStable();
    http
      .expectOne(`${API}/admin/users/p1/verify-email`)
      .flush(account('p1', 'Lucía Torres', { countryCode: 'CO' }));
    await settle();
    await fixture.whenStable();
    expect(row(1).textContent).not.toContain('Correo sin verificar');
  });
});
