import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApi } from '../api-config';
import { AdminScholarshipTypesApi, ScholarshipTypesApi } from './scholarship-types.api';

const API = 'https://api.test/api/v1';

describe('Tipos de beca', () => {
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
    const admin = TestBed.inject(AdminScholarshipTypesApi);
    const http = TestBed.inject(HttpTestingController);
    const body = { key: 'BECA_15', name: 'Beca 15%', minPercent: 15, maxPercent: 15 };
    const cases: [() => unknown, string, string][] = [
      [
        () => TestBed.inject(ScholarshipTypesApi).list().subscribe(),
        'GET',
        `${API}/scholarship-types`,
      ],
      [() => admin.list().subscribe(), 'GET', `${API}/admin/scholarship-types`],
      [() => admin.create(body).subscribe(), 'POST', `${API}/admin/scholarship-types`],
      [
        () => admin.update('t1', { maxRecipients: null, active: false }).subscribe(),
        'PATCH',
        `${API}/admin/scholarship-types/t1`,
      ],
      [() => admin.remove('t1').subscribe(), 'DELETE', `${API}/admin/scholarship-types/t1`],
    ];
    for (const [call, method, url] of cases) {
      call();
      expect(http.expectOne(url).request.method).toBe(method);
    }
    http.verify();
  });
});
