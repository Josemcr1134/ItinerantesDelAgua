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

const tick = () => new Promise((r) => setTimeout(r));

describe('TeachersPage', () => {
  let warnings: { title: string; message: string }[];

  async function setup(permissions: Permission[]) {
    warnings = [];
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        {
          provide: AlertService,
          useValue: {
            confirm: () => Promise.resolve(true),
            open: () => Promise.resolve(true),
            warning: (title: string, message: string) => (
              warnings.push({ title, message }),
              Promise.resolve(true)
            ),
          },
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

  /** Responde la revisión de uso (listado buscado por nombre) con estas cifras. */
  async function answerUsage(http: HttpTestingController, found: AdminTeacherDto): Promise<void> {
    await tick();
    const check = http.expectOne((r) => r.url === `${API}/admin/teachers` && r.params.has('q'));
    expect(check.request.params.get('q')).toBe(found.fullName);
    check.flush({ data: [found], meta: { page: 1, pageSize: 100, total: 1, totalPages: 1 } });
    await tick();
  }

  it('al borrar a quien participa en ofertas, informa en cuántas y no lo borra', async () => {
    const { fixture, http, host, button } = await setup([
      'admin.access',
      'offers.read',
      'offers.write',
    ]);
    const [assigned] = [...host.querySelectorAll('.card')];
    expect(button('Borrar', assigned)!.disabled).toBe(false);

    button('Borrar', assigned)!.click();
    await answerUsage(http, { ...teacher('t1', 'Marta Torres', 3), moduleCount: 1 });
    await fixture.whenStable();

    expect(warnings).toEqual([
      {
        title: 'Marta Torres no se puede borrar',
        message:
          'Participa en 3 ofertas y 1 módulo. Para borrarlo, primero quítalo de esos contenidos.',
      },
    ]);
    http.expectNone((r) => r.method === 'DELETE');
    // La tarjeta muestra las cifras actualizadas.
    expect(assigned.textContent).toContain('3 ofertas · 1 módulo');
  });

  it('revisa la cifra actual: si la lista estaba desactualizada, también avisa', async () => {
    const { http, host, button } = await setup(['admin.access', 'offers.read', 'offers.write']);
    const [, free] = [...host.querySelectorAll('.card')];
    button('Borrar', free)!.click();
    await answerUsage(http, teacher('t2', 'Elena Cruz', 1));
    expect(warnings[0].message).toContain('Participa en 1 oferta.');
    expect(warnings[0].message).toContain('ese contenido');
    http.expectNone((r) => r.method === 'DELETE');
  });

  it('borra a quien no participa en ninguna oferta', async () => {
    const { fixture, http, host, button } = await setup([
      'admin.access',
      'offers.read',
      'offers.write',
    ]);
    const [, free] = [...host.querySelectorAll('.card')];
    button('Borrar', free)!.click();
    await answerUsage(http, teacher('t2', 'Elena Cruz'));
    await fixture.whenStable();
    const req = http.expectOne(`${API}/admin/teachers/t2`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
    await tick();
    await fixture.whenStable();
    http
      .expectOne((r) => r.url === `${API}/admin/teachers` && !r.params.has('q'))
      .flush({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } });
    await fixture.whenStable();
    expect(warnings).toEqual([]);
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
