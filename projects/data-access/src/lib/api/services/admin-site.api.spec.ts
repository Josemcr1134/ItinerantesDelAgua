import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApi } from '../api-config';
import { AdminSiteApi } from './admin-site.api';

const API = 'https://api.test/api/v1/admin/site';

describe('AdminSiteApi', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
      ],
    }),
  );

  it('lista las cifras y edita una por su clave', () => {
    const api = TestBed.inject(AdminSiteApi);
    const http = TestBed.inject(HttpTestingController);

    api.metrics().subscribe();
    expect(http.expectOne(`${API}/metrics`).request.method).toBe('GET');

    api.updateMetric('PEOPLE_TRAINED', { value: 1950, visible: false }).subscribe();
    const patch = http.expectOne(`${API}/metrics/PEOPLE_TRAINED`);
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual({ value: 1950, visible: false });
    http.verify();
  });
});
