import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApi } from '../api-config';
import { AdminDashboardApi } from './admin-dashboard.api';

const API = 'https://api.test/api/v1/admin/dashboard';

describe('AdminDashboardApi', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
      ],
    }),
  );

  it('pide el resumen con el periodo (o sin él, para los últimos 30 días)', () => {
    const api = TestBed.inject(AdminDashboardApi);
    const http = TestBed.inject(HttpTestingController);

    api.overview().subscribe();
    expect(http.expectOne(API).request.method).toBe('GET');

    api.overview({ from: '2026-10-01T00:00:00.000Z', to: '2026-10-31T23:59:59.999Z' }).subscribe();
    http.expectOne(`${API}?from=2026-10-01T00:00:00.000Z&to=2026-10-31T23:59:59.999Z`);
    http.verify();
  });

  it('pide las series por mes', () => {
    const api = TestBed.inject(AdminDashboardApi);
    const http = TestBed.inject(HttpTestingController);

    api.trends().subscribe();
    http.expectOne(`${API}/trends`);

    api.trends(12).subscribe();
    http.expectOne(`${API}/trends?months=12`);
    http.verify();
  });
});
