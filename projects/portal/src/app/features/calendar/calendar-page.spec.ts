import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAuth, SessionStore } from 'auth';
import { apiErrorInterceptor, provideApi, UserProfileDto } from 'data-access';
import CalendarPage from './calendar-page';

const API = 'https://api.test/api/v1';
const item = (id: string, startsAt: string, category: string, extra: object = {}) => ({
  id,
  title: `Actividad ${id}`,
  kind: 'SESSION',
  category,
  startsAt,
  endsAt: null,
  allDay: false,
  status: 'SCHEDULED',
  offer: null,
  module: null,
  venue: null,
  location: null,
  description: null,
  join: null,
  link: { kind: 'NONE', offerId: null, slug: null, applicationId: null },
  ...extra,
});

describe('CalendarPage', () => {
  async function render(inputs: { vista?: string; fecha?: string }) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ platformName: 'Portal' }),
      ],
    });
    const later = new Date(Date.now() + 3_600_000).toISOString();
    TestBed.inject(SessionStore).start(
      {
        accessToken: 'a',
        accessTokenExpiresAt: later,
        refreshToken: 'r',
        refreshTokenExpiresAt: later,
      },
      {
        id: 'u1',
        fullName: 'Ana',
        timezone: 'America/Mexico_City',
        roles: [],
      } as unknown as UserProfileDto,
    );
    const fixture = TestBed.createComponent(CalendarPage);
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    TestBed.tick();
    return {
      fixture,
      http: TestBed.inject(HttpTestingController),
      host: fixture.nativeElement as HTMLElement,
    };
  }

  it('el mes pide la cuadrícula completa en hora de la persona y pinta las actividades', async () => {
    const { fixture, http, host } = await render({ fecha: '2026-10-09' });
    const request = http.expectOne((r) => r.url === `${API}/me/calendar`);
    expect(request.request.params.get('from')).toBe('2026-09-27T06:00:00.000Z');
    expect(request.request.params.get('to')).toBe('2026-11-08T06:00:00.000Z');
    request.flush({
      data: [
        item('a', '2026-10-08T19:00:00.000Z', 'TERRITORY'),
        item('b', '2026-10-11T19:00:00.000Z', 'COMMUNITY'),
      ],
    });
    await fixture.whenStable();

    expect(host.querySelector('.period__title')?.textContent?.trim()).toBe('Octubre 2026');
    expect([...host.querySelectorAll('.pill')].map((p) => p.textContent?.trim())).toEqual([
      '13:00 · Actividad a',
      '13:00 · Actividad b',
    ]);
  });

  it('los chips filtran en el navegador, sin volver a pedir', async () => {
    const { fixture, http, host } = await render({ fecha: '2026-10-09' });
    http
      .expectOne((r) => r.url === `${API}/me/calendar`)
      .flush({
        data: [
          item('a', '2026-10-08T19:00:00.000Z', 'TERRITORY'),
          item('b', '2026-10-11T19:00:00.000Z', 'COMMUNITY'),
        ],
      });
    await fixture.whenStable();
    const chip = [...host.querySelectorAll<HTMLButtonElement>('.chip')].find((c) =>
      c.textContent?.includes('Comunidad'),
    )!;
    chip.click();
    await fixture.whenStable();
    expect(chip.getAttribute('aria-pressed')).toBe('true');
    expect(host.querySelectorAll('.pill')).toHaveLength(1);
    http.expectNone((r) => r.url === `${API}/me/calendar`);
  });

  it('el día lista las actividades y abre el detalle con el acceso a la sesión', async () => {
    const { fixture, http, host } = await render({ vista: 'dia', fecha: '2026-10-26' });
    const request = http.expectOne((r) => r.url === `${API}/me/calendar`);
    expect(request.request.params.get('from')).toBe('2026-10-26T06:00:00.000Z');
    expect(request.request.params.get('to')).toBe('2026-10-27T06:00:00.000Z');
    request.flush({
      data: [
        item('s', '2026-10-27T00:00:00.000Z', 'TRAINING', {
          endsAt: '2026-10-27T01:00:00.000Z',
          join: { state: 'OPEN', opensAt: '2026-10-26T23:50:00.000Z', url: 'https://zoom.us/j/1' },
        }),
      ],
    });
    await fixture.whenStable();
    expect(host.querySelector('.row__time')?.textContent?.trim()).toBe('18:00 – 19:00 (1 h)');

    host.querySelector<HTMLButtonElement>('.row')!.click();
    await fixture.whenStable();
    expect(
      host.querySelector<HTMLAnchorElement>('portal-event-detail a[href^="https://zoom"]')?.href,
    ).toBe('https://zoom.us/j/1');
  });
});
