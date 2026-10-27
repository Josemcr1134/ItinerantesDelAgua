import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApi } from '../api-config';
import { OffersApi } from './offers.api';

describe('OffersApi', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
      ],
    }),
  );

  it('el catálogo manda tipos y estados separados por coma', () => {
    const api = TestBed.inject(OffersApi);
    const http = TestBed.inject(HttpTestingController);
    api
      .list({ type: ['DIPLOMA', 'COURSE'], status: ['ENROLLMENT_OPEN', 'UPCOMING'], q: 'agua' })
      .subscribe();
    http.expectOne(
      'https://api.test/api/v1/offers?type=DIPLOMA,COURSE&status=ENROLLMENT_OPEN,UPCOMING&q=agua',
    );
    http.verify();
  });
});
