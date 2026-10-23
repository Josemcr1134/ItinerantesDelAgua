import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApi } from '../api-config';
import { AdminCalendarApi } from './admin-calendar.api';

const API = 'https://api.test/api/v1/admin';

describe('AdminCalendarApi', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
      ],
    }),
  );

  it('usa la ruta de cada operación', () => {
    const api = TestBed.inject(AdminCalendarApi);
    const http = TestBed.inject(HttpTestingController);
    const event = {
      title: 'Webinar',
      audience: 'ALL_REGISTERED' as const,
      startsAt: '2026-11-05T00:00:00.000Z',
    };
    const cases: [() => unknown, string, string][] = [
      [() => api.createEvent(event).subscribe(), 'POST', `${API}/calendar-events`],
      [
        () => api.updateEvent('e1', { location: null }).subscribe(),
        'PATCH',
        `${API}/calendar-events/e1`,
      ],
      [() => api.removeEvent('e1').subscribe(), 'DELETE', `${API}/calendar-events/e1`],
      [() => api.cancelEvent('e1').subscribe(), 'POST', `${API}/calendar-events/e1/cancel`],
    ];
    for (const [call, method, url] of cases) {
      call();
      expect(http.expectOne(url).request.method).toBe(method);
    }
    http.verify();
  });

  it('pide el rango del calendario y la lista de eventos con sus filtros', () => {
    const api = TestBed.inject(AdminCalendarApi);
    const http = TestBed.inject(HttpTestingController);
    api
      .view({
        from: '2026-10-26T06:00:00.000Z',
        to: '2026-12-07T06:00:00.000Z',
        category: 'EVENTS',
      })
      .subscribe();
    const view = http.expectOne((r) => r.url === `${API}/calendar`);
    expect(view.request.params.get('from')).toBe('2026-10-26T06:00:00.000Z');
    expect(view.request.params.get('category')).toBe('EVENTS');
    api.events({ kind: 'MANUAL', status: 'SCHEDULED' }).subscribe();
    const list = http.expectOne((r) => r.url === `${API}/calendar-events`);
    expect(list.request.params.get('kind')).toBe('MANUAL');
  });
});
