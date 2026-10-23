import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApi } from '../api-config';
import { AdminMoodleApi } from './admin-moodle.api';

const API = 'https://api.test/api/v1/admin/offers/o1/moodle';

describe('AdminMoodleApi', () => {
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
    const api = TestBed.inject(AdminMoodleApi);
    const http = TestBed.inject(HttpTestingController);
    const cases: [() => unknown, string, string][] = [
      [() => api.importRoster('o1', { csv: 'email\na@x.mx' }).subscribe(), 'POST', `${API}/roster`],
      [() => api.removeEntry('o1', 'r1').subscribe(), 'DELETE', `${API}/roster/r1`],
      [() => api.generateCodes('o1', { count: 10 }).subscribe(), 'POST', `${API}/codes`],
    ];
    for (const [call, method, url] of cases) {
      call();
      expect(http.expectOne(url).request.method).toBe(method);
    }
    http.verify();
  });

  it('filtra la lista por vinculación y los códigos por uso', () => {
    const api = TestBed.inject(AdminMoodleApi);
    const http = TestBed.inject(HttpTestingController);
    api.roster('o1', { linked: false, q: 'gmail' }).subscribe();
    const roster = http.expectOne((r) => r.url === `${API}/roster`);
    expect(roster.request.params.get('linked')).toBe('false');
    expect(roster.request.params.get('q')).toBe('gmail');
    api.codes('o1', { used: true }).subscribe();
    expect(http.expectOne((r) => r.url === `${API}/codes`).request.params.get('used')).toBe('true');
  });
});
