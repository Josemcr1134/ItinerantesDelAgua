import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SessionStore } from 'auth';
import {
  AdminCalendarEventDto,
  AdminCalendarItemDto,
  apiErrorInterceptor,
  Permission,
  provideApi,
  UserProfileDto,
} from 'data-access';
import { AlertService } from 'ui-kit';
import { AdminAccess } from '../../core/access/admin-access';
import CalendarPage from './calendar-page';
import { monthGrid, shiftMonth } from './calendar-labels';

const API = 'https://api.test/api/v1/admin';
const tick = () => new Promise((r) => setTimeout(r));

const session: AdminCalendarItemDto = {
  source: 'SESSION',
  id: 's1',
  kind: 'SESSION',
  title: 'Diplomado · Sesión 3',
  category: 'TRAINING',
  startsAt: '2026-10-21T00:00:00.000Z',
  endsAt: '2026-10-21T02:00:00.000Z',
  allDay: false,
  status: 'SCHEDULED',
  offer: { id: 'o1', name: 'Diplomado' },
  audience: null,
  edited: false,
  missingLink: true,
};

const event: AdminCalendarEventDto = {
  id: 'e1',
  kind: 'MANUAL',
  title: 'Webinar',
  description: null,
  category: 'EVENTS',
  audience: 'ALL_REGISTERED',
  offer: null,
  startsAt: '2026-10-21T23:00:00.000Z',
  endsAt: null,
  allDay: false,
  location: null,
  joinUrl: null,
  status: 'SCHEDULED',
  createdAt: '2026-10-01T15:00:00.000Z',
  updatedAt: '2026-10-01T15:00:00.000Z',
};

describe('monthGrid', () => {
  it('arma 6 semanas de lunes a domingo con el rango en hora CDMX', () => {
    const { days, from, to } = monthGrid('2026-10');
    expect(days.length).toBe(42);
    expect(days[0].key).toBe('2026-09-28'); // lunes
    expect(days.find((d) => d.key === '2026-10-01')?.inMonth).toBe(true);
    expect(from).toBe('2026-09-28T06:00:00.000Z');
    expect(to).toBe('2026-11-09T06:00:00.000Z');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
  });
});

describe('CalendarPage', () => {
  async function setup(permissions: Permission[], inputs: Record<string, string>) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        {
          provide: AlertService,
          useValue: { open: () => Promise.resolve(true), confirm: () => Promise.resolve(true) },
        },
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
    const fixture = TestBed.createComponent(CalendarPage);
    for (const [k, v] of Object.entries(inputs)) fixture.componentRef.setInput(k, v);
    await fixture.whenStable();
    const settle = async () => {
      await tick();
      await fixture.whenStable();
    };
    http
      .match((r) => r.url === `${API}/offers`)
      .forEach((r) =>
        r.flush({ data: [], meta: { page: 1, pageSize: 100, total: 0, totalPages: 0 } }),
      );
    const host = fixture.nativeElement as HTMLElement;
    return { fixture, http, host, settle };
  }

  it('pide el mes de la URL y lleva de una sesión a las sesiones de su oferta', async () => {
    const { http, host, settle } = await setup(['admin.access', 'offers.read'], { mes: '2026-10' });
    await settle();
    const view = http.expectOne((r) => r.url === `${API}/calendar`);
    expect(view.request.params.get('from')).toBe('2026-09-28T06:00:00.000Z');
    expect(view.request.params.get('to')).toBe('2026-11-09T06:00:00.000Z');
    view.flush({ data: [session] });
    await settle();

    expect(host.querySelector('.month-title')?.textContent).toContain('Octubre de 2026');
    expect(host.textContent).not.toContain('Nuevo evento');
    const chip = host.querySelector<HTMLButtonElement>('.chip')!;
    expect(chip.textContent).toContain('sin enlace');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    chip.click();
    expect(navigate).toHaveBeenCalledWith(['/ofertas', 'o1', 'sesiones']);
  });

  it('crea un evento: con audiencia de inscritos exige la oferta', async () => {
    const { http, host, settle } = await setup(['admin.access', 'offers.read', 'offers.write'], {
      mes: '2026-10',
    });
    await settle();
    http.expectOne((r) => r.url === `${API}/calendar`).flush({ data: [] });
    await settle();

    [...host.querySelectorAll<HTMLButtonElement>('button')]
      .find((b) => b.textContent?.includes('Nuevo evento'))!
      .click();
    await settle();
    const set = (selector: string, value: string) => {
      const el = document.querySelector<HTMLInputElement>(selector)!;
      el.value = value;
      el.dispatchEvent(new Event('input'));
    };
    set('#event-title', 'Encuentro de comunidad');
    set('#event-date', '2026-10-30');
    set('#event-start', '11:00');
    const enrolled = [...document.querySelectorAll<HTMLInputElement>('input[type=radio]')][1];
    enrolled.click();
    await settle();
    document.querySelector<HTMLFormElement>('#event-form')!.requestSubmit();
    await settle();
    expect(document.querySelector('dialog[open] [role=alert]')?.textContent).toContain(
      'Elige la oferta',
    );
    http.expectNone(`${API}/calendar-events`);

    [...document.querySelectorAll<HTMLInputElement>('input[type=radio]')][0].click();
    await settle();
    document.querySelector<HTMLFormElement>('#event-form')!.requestSubmit();
    await settle();
    const create = http.expectOne(`${API}/calendar-events`);
    expect(create.request.body).toMatchObject({
      title: 'Encuentro de comunidad',
      audience: 'ALL_REGISTERED',
      startsAt: '2026-10-30T17:00:00.000Z',
      allDay: false,
    });
  });

  it('eventos: cancela con confirmación y actualiza la fila', async () => {
    const { http, host, settle } = await setup(['admin.access', 'offers.read', 'offers.write'], {
      vista: 'eventos',
    });
    await settle();
    const list = http.expectOne((r) => r.url === `${API}/calendar-events`);
    expect(list.request.params.get('status')).toBe('SCHEDULED');
    list.flush({ data: [event], meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 } });
    await settle();

    [...host.querySelectorAll<HTMLButtonElement>('button')]
      .find((b) => b.textContent?.includes('Cancelar evento'))!
      .click();
    await settle();
    http.expectOne(`${API}/calendar-events/e1/cancel`).flush({ ...event, status: 'CANCELLED' });
    await settle();
    expect(host.querySelector('tbody tr.cancelled')).not.toBeNull();
    expect(host.querySelector('.adm-notice')?.textContent).toContain('Se canceló «Webinar»');
  });
});
