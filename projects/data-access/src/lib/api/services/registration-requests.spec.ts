import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApi } from '../api-config';
import { PUBLIC_REQUEST, SKIP_GLOBAL_LOADER } from '../http-context';
import { AuthApi } from './auth.api';
import { CatalogsApi } from './catalogs.api';

const API = 'https://api.test/api/v1';

describe('Peticiones de fondo del registro', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
      ],
    }),
  );

  it('la disponibilidad y los catálogos son públicos y no muestran el loader general', () => {
    const http = TestBed.inject(HttpTestingController);
    const catalogs = TestBed.inject(CatalogsApi);
    const cases: [() => unknown, string][] = [
      [
        () => TestBed.inject(AuthApi).availability({ username: 'ana' }).subscribe(),
        `${API}/auth/availability?username=ana`,
      ],
      [() => catalogs.countries().subscribe(), `${API}/locations/countries`],
      [() => catalogs.divisions('MX').subscribe(), `${API}/locations/countries/MX/divisions`],
      [
        () => catalogs.municipalities('d1').subscribe(),
        `${API}/locations/divisions/d1/municipalities`,
      ],
      [() => catalogs.timezones().subscribe(), `${API}/timezones`],
    ];
    for (const [call, url] of cases) {
      call();
      const request = http.expectOne(url).request;
      expect(request.context.get(PUBLIC_REQUEST)).toBe(true);
      expect(request.context.get(SKIP_GLOBAL_LOADER)).toBe(true);
    }
    http.verify();
  });
});
