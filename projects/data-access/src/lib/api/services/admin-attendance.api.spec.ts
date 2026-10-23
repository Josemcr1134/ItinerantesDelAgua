import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { provideApi } from '../api-config';
import { AdminAttendanceApi } from './admin-attendance.api';

const API = 'https://api.test/api/v1/admin';

describe('AdminAttendanceApi', () => {
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
    const api = TestBed.inject(AdminAttendanceApi);
    const http = TestBed.inject(HttpTestingController);
    const body = { userIds: ['u1'], reason: 'Pasó lista en sitio' };
    const cases: [() => unknown, string, string][] = [
      [() => api.chips('o1').subscribe(), 'GET', `${API}/offers/o1/attendance/sessions`],
      [() => api.sessionAttendance('s1').subscribe(), 'GET', `${API}/sessions/s1/attendance`],
      [() => api.mark('s1', body).subscribe(), 'POST', `${API}/sessions/s1/attendance/mark`],
      [() => api.unmark('s1', body).subscribe(), 'POST', `${API}/sessions/s1/attendance/unmark`],
      [() => api.remind('s1').subscribe(), 'POST', `${API}/sessions/s1/attendance/remind`],
    ];
    for (const [call, method, url] of cases) {
      call();
      expect(http.expectOne(url).request.method).toBe(method);
    }
    http.verify();
  });

  it('envía los filtros de "Por participante" y exporta con los mismos', async () => {
    const api = TestBed.inject(AdminAttendanceApi);
    const http = TestBed.inject(HttpTestingController);
    api.participants('o1', { belowThreshold: true, q: 'maría' }).subscribe();
    const list = http.expectOne((r) => r.url === `${API}/offers/o1/attendance/participants`);
    expect(list.request.params.get('belowThreshold')).toBe('true');
    expect(list.request.params.get('q')).toBe('maría');

    const file = firstValueFrom(api.exportSession('s1', { status: 'PENDING' }));
    const csv = http.expectOne((r) => r.url === `${API}/sessions/s1/attendance/export`);
    expect(csv.request.params.get('status')).toBe('PENDING');
    expect(csv.request.responseType).toBe('blob');
    csv.flush(new Blob(['a']));
    expect((await file).fileName).toBe('asistencia-sesion.csv');
  });
});
