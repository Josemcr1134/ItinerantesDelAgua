import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApi } from '../api-config';
import { SKIP_GLOBAL_LOADER } from '../http-context';
import { AdminContactApi } from './admin-contact.api';

const API = 'https://api.test/api/v1/admin/contact-messages';

describe('AdminContactApi', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
      ],
    }),
  );

  it('lista con filtros (sin los vacíos) y el resumen sin el loader general', () => {
    const api = TestBed.inject(AdminContactApi);
    const http = TestBed.inject(HttpTestingController);

    api
      .list({ q: 'lucia', status: 'NEW', subject: undefined, sort: 'CREATED_ASC', page: 2 })
      .subscribe();
    http.expectOne(`${API}?q=lucia&status=NEW&sort=CREATED_ASC&page=2`);

    api.summary().subscribe();
    expect(http.expectOne(`${API}/summary`).request.context.get(SKIP_GLOBAL_LOADER)).toBe(true);
    http.verify();
  });

  it('abre un mensaje y cambia su estado o borra la nota', () => {
    const api = TestBed.inject(AdminContactApi);
    const http = TestBed.inject(HttpTestingController);

    api.get('m 1').subscribe();
    expect(http.expectOne(`${API}/m%201`).request.method).toBe('GET');

    api.update('m1', { status: 'ANSWERED', internalNote: null }).subscribe();
    const patch = http.expectOne(`${API}/m1`);
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual({ status: 'ANSWERED', internalNote: null });
    http.verify();
  });
});
