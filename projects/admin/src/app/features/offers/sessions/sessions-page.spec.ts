import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SessionStore } from 'auth';
import {
  AdminSessionDto,
  apiErrorInterceptor,
  Permission,
  provideApi,
  UserProfileDto,
} from 'data-access';
import { AlertService } from 'ui-kit';
import { AdminAccess } from '../../../core/access/admin-access';
import { offerFixture } from '../testing/offer-fixture';
import SessionsPage from './sessions-page';

const API = 'https://api.test/api/v1';
const tick = () => new Promise((r) => setTimeout(r));

/** Sesión de 18:00 a 20:00 CDMX (00:00–02:00 UTC del día siguiente). */
const session = (
  id: string,
  day: number,
  extra: Partial<AdminSessionDto> = {},
): AdminSessionDto => ({
  id,
  offerId: 'o1',
  startsAt: `2026-11-${String(day + 1).padStart(2, '0')}T00:00:00.000Z`,
  endsAt: `2026-11-${String(day + 1).padStart(2, '0')}T02:00:00.000Z`,
  status: 'SCHEDULED',
  state: 'SCHEDULED',
  category: 'TRAINING',
  module: null,
  joinUrl: 'https://zoom.us/j/1',
  hostUrl: null,
  recordingUrl: null,
  recordingPublishedAt: null,
  attendanceWindowHours: null,
  effectiveAttendanceWindowHours: 24,
  originalStartsAt: null,
  changeReason: null,
  cancelledAt: null,
  flags: { edited: false, cancelled: false, missingLink: false, recordingPending: false },
  attendance: { registered: 0, enrolled: 18 },
  ...extra,
});

const offer = offerFixture({
  name: 'Diplomado en Ecotecnologías del Agua',
  modality: 'ONLINE_LIVE',
  schedule: {
    ...offerFixture().schedule,
    startsAt: '2026-11-09T16:00:00.000Z',
    endsAt: '2027-01-29T06:00:00.000Z',
    scheduleRule: {
      weekdays: [1, 3],
      startTime: '18:00',
      endTime: '20:00',
      excludedDates: [],
      excludeMexicanHolidays: true,
    },
  },
});

describe('SessionsPage', () => {
  let warnings: string[];

  async function setup(permissions: Permission[], sessions: AdminSessionDto[]) {
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
            open: () => Promise.resolve(true),
            confirm: () => Promise.resolve(true),
            warning: (title: string) => (warnings.push(title), Promise.resolve(true)),
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

    const fixture = TestBed.createComponent(SessionsPage);
    fixture.componentRef.setInput('id', 'o1');
    await fixture.whenStable();
    http.expectOne(`${API}/admin/offers/o1/sessions`).flush({ data: sessions });
    http.expectOne(`${API}/admin/offers/o1`).flush(offer);
    http.expectOne(`${API}/admin/offers/o1/modules`).flush({
      offerId: 'o1',
      offerName: offer.name,
      modules: [],
      unassignedRecordings: [],
      activeEnrollees: 18,
    });
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const button = (text: string, root: ParentNode = document) =>
      [...root.querySelectorAll<HTMLButtonElement>('button')].find((b) =>
        b.textContent?.trim().startsWith(text),
      );
    const settle = async () => {
      await tick();
      await fixture.whenStable();
    };
    return { fixture, http, host, button, settle };
  }

  it('lista las sesiones con su resumen; sin `offers.write` no hay acciones', async () => {
    const { host, button } = await setup(
      ['admin.access', 'offers.read'],
      [
        session('s1', 9, {
          flags: { edited: false, cancelled: false, missingLink: true, recordingPending: false },
          joinUrl: null,
        }),
        session('s2', 11, { status: 'CANCELLED', state: 'CANCELLED', changeReason: 'Asueto' }),
      ],
    );
    expect(host.querySelectorAll('tbody tr').length).toBe(2);
    expect(host.textContent).toContain('1 sesión · 2 h');
    expect(host.textContent).toContain('1 sin enlace');
    expect(host.textContent).toContain('Motivo: Asueto');
    expect(button('Generar sesiones', host)).toBeUndefined();
    expect(button('Editar', host)).toBeUndefined();
  });

  it('genera: vista previa con la regla (días numéricos) y confirmación', async () => {
    const { http, host, button, settle } = await setup(
      ['admin.access', 'offers.read', 'offers.write'],
      [],
    );
    button('Generar sesiones', host)!.click();
    await settle();
    button('Ver vista previa')!.click();
    await settle();
    const preview = http.expectOne(`${API}/admin/offers/o1/sessions/preview`);
    expect(preview.request.body).toMatchObject({
      rule: { weekdays: [1, 3], startTime: '18:00', endTime: '20:00' },
      startDate: '2026-11-09',
      endDate: '2027-01-29',
    });
    preview.flush({
      items: [
        {
          date: '2026-11-09',
          startsAt: '2026-11-10T00:00:00.000Z',
          endsAt: '2026-11-10T02:00:00.000Z',
          status: 'NEW',
          exclusionReason: null,
          module: null,
        },
      ],
      summary: {
        sessionCount: 1,
        newHours: 2,
        existingHours: 0,
        totalHours: 2,
        excludedCount: 0,
        conflictCount: 0,
        label: '1 sesión nueva (2 h)',
      },
      violations: [],
      warnings: [],
      canConfirm: true,
      blockedReason: null,
      importantDates: [],
    });
    await settle();

    button('Crear 1 sesión')!.click();
    await settle();
    http
      .expectOne(`${API}/admin/offers/o1/sessions/generate`)
      .flush({ createdSessions: 1, importantDates: 0, message: 'Se creó 1 sesión.', sessions: [] });
    await settle();
    // Recarga la lista y la oferta (la regla queda guardada).
    http.expectOne(`${API}/admin/offers/o1/sessions`).flush({ data: [session('s9', 9)] });
    http.expectOne(`${API}/admin/offers/o1`).flush(offer);
    http.expectOne(`${API}/admin/offers/o1/modules`).flush({
      offerId: 'o1',
      offerName: offer.name,
      modules: [],
      unassignedRecordings: [],
      activeEnrollees: 18,
    });
    await settle();
    expect(host.querySelector('.adm-notice')?.textContent).toContain('Se creó 1 sesión.');
  });

  it('publica la grabación enviando solo ese cambio y el aviso', async () => {
    const { http, host, button, settle } = await setup(
      ['admin.access', 'offers.read', 'offers.write'],
      [session('s1', 2)],
    );
    button('Editar', host)!.click();
    await settle();
    const input = document.querySelector<HTMLInputElement>('#session-recording')!;
    input.value = 'https://vimeo.com/2';
    input.dispatchEvent(new Event('input'));
    await settle();
    document.querySelector<HTMLFormElement>('#session-form')!.requestSubmit();
    await settle();
    const patch = http.expectOne(`${API}/admin/sessions/s1`);
    expect(patch.request.body).toEqual({
      recordingUrl: 'https://vimeo.com/2',
      notifyRecording: true,
    });
    patch.flush({
      session: session('s1', 2, { recordingUrl: 'https://vimeo.com/2' }),
      notifiedCount: 18,
    });
    await settle();
    expect(host.querySelector('.adm-notice')?.textContent).toContain('Se avisó a 18 inscritos.');
  });

  it('reprograma con el horario en CDMX y el motivo', async () => {
    const { http, host, button, settle } = await setup(
      ['admin.access', 'offers.read', 'offers.write'],
      [session('s1', 9)],
    );
    button('Reprogramar', host)!.click();
    await settle();
    const set = (selector: string, value: string) => {
      const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
      el.value = value;
      el.dispatchEvent(new Event('input'));
    };
    set('#change-date', '2026-11-12');
    set('#change-reason', 'La ponente viaja');
    await settle();
    document.querySelector<HTMLFormElement>('#session-change-form')!.requestSubmit();
    await settle();
    const req = http.expectOne(`${API}/admin/sessions/s1/reschedule`);
    expect(req.request.body).toEqual({
      startsAt: '2026-11-13T00:00:00.000Z',
      endsAt: '2026-11-13T02:00:00.000Z',
      reason: 'La ponente viaja',
    });
  });

  it('no borra una sesión con asistencias: sugiere cancelarla', async () => {
    const { http, host, button, settle } = await setup(
      ['admin.access', 'offers.read', 'offers.write'],
      [session('s1', 2, { attendance: { registered: 3, enrolled: 18 } })],
    );
    button('Borrar', host)!.click();
    await settle();
    expect(warnings).toEqual(['Esta sesión no se puede borrar']);
    http.expectNone(`${API}/admin/sessions/s1`);
  });
});
