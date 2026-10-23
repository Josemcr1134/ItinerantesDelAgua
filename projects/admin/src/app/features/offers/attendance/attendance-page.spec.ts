import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SessionStore } from 'auth';
import {
  apiErrorInterceptor,
  AttendanceSessionChipDto,
  Permission,
  provideApi,
  SessionAttendanceRowDto,
  UserProfileDto,
} from 'data-access';
import { AlertService } from 'ui-kit';
import { AdminAccess } from '../../../core/access/admin-access';
import AttendancePage from './attendance-page';

const API = 'https://api.test/api/v1';
const tick = () => new Promise((r) => setTimeout(r));

const chip = (id: string, state: AttendanceSessionChipDto['state'], day: number) => ({
  sessionId: id,
  startsAt: `2026-10-${day}T00:00:00.000Z`,
  endsAt: `2026-10-${day}T02:00:00.000Z`,
  state,
  opensAt: `2026-10-${day}T02:00:00.000Z`,
  closesAt: `2026-10-${day + 1}T02:00:00.000Z`,
  registered: 1,
  total: 2,
  percent: 50,
});

const row = (id: string, status: SessionAttendanceRowDto['status']): SessionAttendanceRowDto => ({
  userId: id,
  fullName: `Persona ${id}`,
  email: `${id}@example.com`,
  countryCode: 'MX',
  origin: 'NAS',
  enrollmentStatus: 'ACTIVE',
  status,
  registeredAt: status === 'REGISTERED' ? '2026-10-22T03:00:00.000Z' : null,
  source: status === 'REGISTERED' ? 'PARTICIPANT' : null,
  comment: null,
  recordedBy: null,
  manualReason: null,
});

describe('AttendancePage', () => {
  async function setup(permissions: Permission[], vista?: string) {
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

    const fixture = TestBed.createComponent(AttendancePage);
    fixture.componentRef.setInput('id', 'o1');
    if (vista) fixture.componentRef.setInput('vista', vista);
    await fixture.whenStable();
    http.expectOne(`${API}/locations/countries`).flush({ data: [{ code: 'MX', name: 'México' }] });
    http.expectOne(`${API}/admin/offers/o1/attendance/sessions`).flush({
      data: [
        chip('s1', 'CLOSED', 13),
        chip('s2', 'REGISTRATION_OPEN', 15),
        chip('s3', 'SCHEDULED', 20),
      ],
    });
    http.expectOne(`${API}/admin/offers/o1`).flush({ id: 'o1', name: 'Diplomado' });
    const host = fixture.nativeElement as HTMLElement;
    const settle = async () => {
      await tick();
      await fixture.whenStable();
    };
    const button = (text: string, root: ParentNode = document) =>
      [...root.querySelectorAll<HTMLButtonElement>('button')].find((b) =>
        b.textContent?.trim().startsWith(text),
      );
    return { fixture, http, host, settle, button };
  }

  async function answerSession(
    http: HttpTestingController,
    settle: () => Promise<void>,
    sessionId: string,
    rows: SessionAttendanceRowDto[],
  ) {
    await settle();
    const req = http.expectOne((r) => r.url === `${API}/admin/sessions/${sessionId}/attendance`);
    req.flush({
      session: chip(sessionId, 'REGISTRATION_OPEN', 15),
      summary: {
        registered: 1,
        total: 3,
        percent: 33,
        label: '1 de 3 registraron asistencia (33%)',
      },
      rows,
    });
    await settle();
    return req;
  }

  it('abre la sesión con registro abierto y la deja en la URL', async () => {
    const { http, host, settle } = await setup(['admin.access', 'attendance.read']);
    await answerSession(http, settle, 's2', [row('u1', 'REGISTERED'), row('u2', 'PENDING')]);
    expect(TestBed.inject(Router).url).toContain('sesion=s2');
    expect(host.querySelector('.chip--active')?.textContent).toContain('Registro abierto');
    expect(host.textContent).toContain('1 de 3 registraron asistencia (33%)');
    // Sin `attendance.write`: ni selección ni acciones.
    expect(host.querySelector('tbody input[type=checkbox]')).toBeNull();
    expect(host.textContent).not.toContain('Recordar a pendientes');
  });

  it('pasa lista: marca a las seleccionadas con el motivo', async () => {
    const { http, host, settle, button } = await setup([
      'admin.access',
      'attendance.read',
      'attendance.write',
    ]);
    await answerSession(http, settle, 's2', [
      row('u1', 'REGISTERED'),
      row('u2', 'PENDING'),
      row('u3', 'PENDING'),
    ]);
    // Solo las pendientes se pueden seleccionar.
    expect(host.querySelectorAll('tbody input[type=checkbox]').length).toBe(2);
    button('Seleccionar a todas las personas sin registro', host)!.click();
    await settle();
    button('Marcar asistencia', host.querySelector('.bulk')!)!.click();
    await settle();
    const reason = document.querySelector<HTMLTextAreaElement>('#attendance-reason')!;
    reason.value = 'Pasó lista en sitio';
    reason.dispatchEvent(new Event('input'));
    await settle();
    document.querySelector<HTMLFormElement>('#attendance-reason-form')!.requestSubmit();
    await settle();

    const mark = http.expectOne(`${API}/admin/sessions/s2/attendance/mark`);
    expect(mark.request.body).toEqual({ userIds: ['u2', 'u3'], reason: 'Pasó lista en sitio' });
    mark.flush({ marked: 2, alreadyRegistered: 0 });
    await settle();
    // Recarga la sesión y los conteos de los chips.
    http
      .expectOne((r) => r.url === `${API}/admin/sessions/s2/attendance`)
      .flush({
        session: chip('s2', 'REGISTRATION_OPEN', 15),
        summary: { registered: 3, total: 3, percent: 100, label: '3 de 3' },
        rows: [],
      });
    http
      .expectOne(`${API}/admin/offers/o1/attendance/sessions`)
      .flush({ data: [chip('s2', 'REGISTRATION_OPEN', 15)] });
    await settle();
    expect(host.querySelector('.adm-notice')?.textContent).toContain(
      'Se marcó la asistencia de 2 personas.',
    );
  });

  it('por participante: filtra a quienes están bajo el umbral', async () => {
    const { fixture, http, host, settle } = await setup(
      ['admin.access', 'attendance.read'],
      'participantes',
    );
    await settle();
    const first = http.expectOne((r) => r.url === `${API}/admin/offers/o1/attendance/participants`);
    expect(first.request.params.has('belowThreshold')).toBe(false);
    first.flush({
      heldSessions: 4,
      thresholdPercent: 80,
      rows: [
        {
          userId: 'u1',
          fullName: 'Lucía',
          email: 'l@example.com',
          countryCode: 'MX',
          origin: 'MOODLE',
          enrollmentStatus: 'ACTIVE',
          attended: 2,
          heldSessions: 4,
          percent: 50,
          belowThreshold: true,
        },
      ],
    });
    await settle();
    expect(host.textContent).toContain('Bajo 80%');
    expect(host.textContent).toContain('Vía Moodle');

    const below = host.querySelector<HTMLSelectElement>('#participants-below')!;
    below.value = 'true';
    below.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    await settle();
    const filtered = http.expectOne(
      (r) => r.url === `${API}/admin/offers/o1/attendance/participants`,
    );
    expect(filtered.request.params.get('belowThreshold')).toBe('true');
  });
});
