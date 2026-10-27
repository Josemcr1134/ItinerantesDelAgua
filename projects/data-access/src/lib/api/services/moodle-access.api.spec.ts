import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApi } from '../api-config';
import { MoodleAccessApi } from './moodle-access.api';

const API = 'https://api.test/api/v1';

describe('MoodleAccessApi', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
      ],
    }),
  );

  it('busca por correo y canjea el código', () => {
    const api = TestBed.inject(MoodleAccessApi);
    const http = TestBed.inject(HttpTestingController);
    api.link().subscribe();
    api.redeem({ code: 'K7QM-3XPA' }).subscribe();
    expect(http.expectOne(`${API}/me/moodle-access/link`).request.method).toBe('POST');
    const redeem = http.expectOne(`${API}/me/moodle-access/redeem`);
    expect(redeem.request.method).toBe('POST');
    expect(redeem.request.body).toEqual({ code: 'K7QM-3XPA' });
    http.verify();
  });
});
