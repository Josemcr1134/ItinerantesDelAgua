import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApi } from '../api-config';
import { AdminUsersApi } from './admin-users.api';

const API = 'https://api.test/api/v1/admin/users';

describe('AdminUsersApi', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
      ],
    }),
  );

  it('marca el correo como verificado, con o sin motivo', () => {
    const api = TestBed.inject(AdminUsersApi);
    const http = TestBed.inject(HttpTestingController);

    api.verifyEmail('u 1').subscribe();
    const plain = http.expectOne(`${API}/u%201/verify-email`);
    expect(plain.request.method).toBe('POST');
    expect(plain.request.body).toEqual({});

    api.verifyEmail('u2', { reason: 'No le llega el código' }).subscribe();
    expect(http.expectOne(`${API}/u2/verify-email`).request.body).toEqual({
      reason: 'No le llega el código',
    });
    http.verify();
  });
});
