import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApi } from '../api-config';
import { AdminSessionsApi } from './admin-sessions.api';

const API = 'https://api.test/api/v1/admin';

describe('AdminSessionsApi', () => {
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
    const api = TestBed.inject(AdminSessionsApi);
    const http = TestBed.inject(HttpTestingController);
    const slot = { startsAt: '2026-11-09T00:00:00.000Z', endsAt: '2026-11-09T02:00:00.000Z' };
    const cases: [() => unknown, string, string][] = [
      [() => api.list('o1').subscribe(), 'GET', `${API}/offers/o1/sessions`],
      [() => api.create('o1', slot).subscribe(), 'POST', `${API}/offers/o1/sessions`],
      [() => api.preview('o1', {}).subscribe(), 'POST', `${API}/offers/o1/sessions/preview`],
      [() => api.generate('o1', {}).subscribe(), 'POST', `${API}/offers/o1/sessions/generate`],
      [() => api.get('s1').subscribe(), 'GET', `${API}/sessions/s1`],
      [() => api.update('s1', { joinUrl: null }).subscribe(), 'PATCH', `${API}/sessions/s1`],
      [() => api.remove('s1').subscribe(), 'DELETE', `${API}/sessions/s1`],
      [
        () => api.reschedule('s1', { ...slot, reason: 'Ponente enfermo' }).subscribe(),
        'POST',
        `${API}/sessions/s1/reschedule`,
      ],
      [
        () => api.cancel('s1', { reason: 'Día inhábil' }).subscribe(),
        'POST',
        `${API}/sessions/s1/cancel`,
      ],
    ];
    for (const [call, method, url] of cases) {
      call();
      expect(http.expectOne(url).request.method).toBe(method);
    }
    http.verify();
  });
});
