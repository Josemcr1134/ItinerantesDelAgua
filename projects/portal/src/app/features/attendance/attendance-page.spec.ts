import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAuth } from 'auth';
import { apiErrorInterceptor, provideApi } from 'data-access';
import AttendancePage from './attendance-page';

const API = 'https://api.test/api/v1/me/sessions';
const at = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();

const attendance = (extra: object = {}) => ({
  status: 'PENDING',
  windowState: 'OPEN',
  opensAt: at(-180),
  closesAt: at(60 * 21 + 1),
  windowHours: 24,
  canRegister: true,
  registeredAt: null,
  source: null,
  comment: null,
  ...extra,
});
const session = (id: string, extra: object = {}) => ({
  id,
  offer: {
    id: 'o1',
    slug: 'eco',
    name: 'Diplomado en Ecotecnologías',
    type: 'DIPLOMA',
    modality: 'ONLINE_LIVE',
  },
  module: { id: 'm3', number: 3, title: 'Humedales construidos' },
  teacherNames: ['Lucía Hernández'],
  startsAt: at(-300),
  endsAt: at(-180),
  timezone: 'America/Mexico_City',
  status: 'SCHEDULED',
  venue: null,
  join: { state: 'ENDED', opensAt: at(-310), url: null },
  recording: { state: 'PENDING', url: null },
  attendance: attendance(),
  ...extra,
});

describe('AttendancePage', () => {
  async function render(current: object, others: object[] = []) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ platformName: 'Portal' }),
      ],
    });
    const fixture = TestBed.createComponent(AttendancePage);
    fixture.componentRef.setInput('sessionId', 's1');
    TestBed.tick();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${API}/s1`).flush(current);
    http.expectOne(`${API}?scope=PAST&pageSize=50`).flush({
      data: others,
      meta: { page: 1, pageSize: 50, total: others.length, totalPages: 1 },
    });
    await fixture.whenStable();
    return { fixture, http, host: fixture.nativeElement as HTMLElement };
  }

  it('dentro de la ventana: pide «Asistí a la sesión» y registra con el comentario', async () => {
    const { fixture, http, host } = await render(session('s1'), [
      session('s1'),
      session('s2', { module: { id: 'm2', number: 2, title: 'Captación' } }),
      session('s3', { attendance: attendance({ canRegister: false, windowState: 'CLOSED' }) }),
    ]);
    expect(host.querySelector('.window')?.textContent).toContain('cierra en 21 h');
    // Otras sesiones con el registro abierto (sin la actual ni las cerradas).
    expect([...host.querySelectorAll('.other__title')].map((t) => t.textContent?.trim())).toEqual([
      'Módulo 2 · Captación',
    ]);

    const submit = () =>
      host.querySelector<HTMLFormElement>('.form')!.dispatchEvent(new Event('submit'));
    submit();
    await fixture.whenStable();
    expect(host.querySelector('.form__error')?.textContent?.trim()).toBe(
      'Marca «Asistí a la sesión» para registrar tu asistencia.',
    );
    http.expectNone(`${API}/s1/attendance`);

    host.querySelector<HTMLInputElement>('.attend input')!.click();
    const textarea = host.querySelector<HTMLTextAreaElement>('#attendance-comment')!;
    textarea.value = ' Me llevo cómo dimensionar un humedal. ';
    textarea.dispatchEvent(new Event('input'));
    submit();
    const request = http.expectOne(`${API}/s1/attendance`);
    expect(request.request.body).toEqual({
      attended: true,
      comment: 'Me llevo cómo dimensionar un humedal.',
    });
    request.flush({
      session: session('s1', {
        attendance: attendance({
          status: 'REGISTERED',
          canRegister: false,
          registeredAt: at(0),
          source: 'PARTICIPANT',
          comment: 'Me llevo cómo dimensionar un humedal.',
        }),
      }),
      progress: { attendedSessions: 4, scheduledSessions: 7, percent: 57 },
    });
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
    expect(host.querySelector('.state__title')?.textContent?.trim()).toBe('Asistencia registrada');
    expect(host.querySelector('.state__quote')?.textContent).toContain('dimensionar un humedal');
    expect(host.querySelector('.state__progress')?.textContent?.replace(/\s+/g, ' ')).toContain(
      '57% (4 de 7 sesiones)',
    );
  });

  it('fuera de la ventana: registro cerrado y pide corrección al equipo (HU-30)', async () => {
    const { host } = await render(
      session('s1', {
        attendance: attendance({
          status: 'NOT_REGISTERED',
          windowState: 'CLOSED',
          canRegister: false,
        }),
      }),
    );
    expect(host.querySelector('.form')).toBeNull();
    expect(host.querySelector('.state__title')?.textContent?.trim()).toBe(
      'El registro de asistencia está cerrado',
    );
    expect(host.querySelector('.state--closed')?.textContent).toContain(
      'pide la corrección al equipo',
    );
  });

  it('si el registro cerró mientras llenaba el formulario, muestra el estado real', async () => {
    const { fixture, http, host } = await render(session('s1'));
    host.querySelector<HTMLInputElement>('.attend input')!.click();
    host.querySelector<HTMLFormElement>('.form')!.dispatchEvent(new Event('submit'));
    http.expectOne(`${API}/s1/attendance`).flush(
      {
        statusCode: 422,
        code: 'ATTENDANCE_WINDOW_CLOSED',
        message: 'El registro de asistencia para esta sesión está cerrado.',
        meta: {},
      },
      { status: 422, statusText: 'Unprocessable Entity' },
    );
    await new Promise((r) => setTimeout(r));
    TestBed.tick();
    http.expectOne(`${API}/s1`).flush(
      session('s1', {
        attendance: attendance({
          status: 'NOT_REGISTERED',
          windowState: 'CLOSED',
          canRegister: false,
        }),
      }),
    );
    await fixture.whenStable();
    expect(host.querySelector('.notice')?.textContent?.trim()).toBe(
      'El registro de asistencia para esta sesión está cerrado.',
    );
    expect(host.querySelector('.state--closed')).not.toBeNull();
  });
});
