import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SessionStore } from 'auth';
import {
  AdminTeacherDto,
  apiErrorInterceptor,
  Permission,
  provideApi,
  UserProfileDto,
} from 'data-access';
import { AlertService } from 'ui-kit';
import { AdminAccess } from '../../core/access/admin-access';
import TeachersPage from './teachers-page';

const API = 'https://api.test/api/v1';
const teacher = (id: string, fullName: string, offerCount = 0): AdminTeacherDto => ({
  id,
  slug: id,
  fullName,
  bio: null,
  cvUrl: null,
  photoKey: null,
  photoUrl: null,
  offerCount,
  moduleCount: 0,
  updatedAt: '2026-10-22T12:00:00.000Z',
});

describe('TeachersPage', () => {
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

    const fixture = TestBed.createComponent(TeachersPage);
    await fixture.whenStable();
    http
      .expectOne((r) => r.url === `${API}/admin/teachers`)
      .flush({
        data: [teacher('t1', 'Marta Torres', 3), teacher('t2', 'Elena Cruz')],
        meta: { page: 1, pageSize: 20, total: 2, totalPages: 1 },
      });
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const button = (text: string, root: ParentNode = host) =>
      [...root.querySelectorAll<HTMLButtonElement>('button')].find((b) =>
        b.textContent?.trim().startsWith(text),
      );
    return { fixture, http, host, button };
  }

  it('solo lectura: lista sin registrar, editar ni borrar', async () => {
    const { host, button } = await setup(['admin.access', 'offers.read']);
    expect(host.querySelectorAll('.card').length).toBe(2);
    expect(button('Registrar docente')).toBeUndefined();
    expect(button('Editar')).toBeUndefined();
  });

  it('no deja borrar a quien está asignado y borra a quien no', async () => {
    const { fixture, http, host, button } = await setup([
      'admin.access',
      'offers.read',
      'offers.write',
    ]);
    const [assigned, free] = [...host.querySelectorAll('.card')];
    expect(button('Borrar', assigned)!.disabled).toBe(true);
    button('Borrar', free)!.click();
    await fixture.whenStable();
    const req = http.expectOne(`${API}/admin/teachers/t2`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
    http
      .expectOne((r) => r.url === `${API}/admin/teachers`)
      .flush({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } });
    await fixture.whenStable();
    expect(host.querySelector('[role="status"]')?.textContent).toContain('Se borró a Elena Cruz');
  });

  it('registrar: valida nombre y CV https y envía vacíos como null', async () => {
    const { fixture, http, host, button } = await setup([
      'admin.access',
      'offers.read',
      'offers.write',
    ]);
    button('Registrar docente')!.click();
    await fixture.whenStable();
    const dialog = host.querySelector('dialog')!;
    const submit = () => button('Registrar docente', dialog)!.click();
    const type = async (id: string, value: string) => {
      const el = host.querySelector<HTMLInputElement>('#' + id)!;
      el.value = value;
      el.dispatchEvent(new Event('input'));
      await fixture.whenStable();
    };

    submit();
    await fixture.whenStable();
    expect(host.querySelector('#teacher-name-error')).not.toBeNull();
    await type('teacher-name', '  Sofía Hernández ');
    await type('teacher-cv', 'http://inseguro.com');
    submit();
    await fixture.whenStable();
    expect(host.querySelector('#teacher-cv-error')).not.toBeNull();
    http.expectNone(`${API}/admin/teachers`);

    await type('teacher-cv', '');
    submit();
    await fixture.whenStable();
    const req = http.expectOne((r) => r.method === 'POST' && r.url === `${API}/admin/teachers`);
    expect(req.request.body).toEqual({
      fullName: 'Sofía Hernández',
      bio: null,
      cvUrl: null,
      photoKey: null,
    });
  });
});
