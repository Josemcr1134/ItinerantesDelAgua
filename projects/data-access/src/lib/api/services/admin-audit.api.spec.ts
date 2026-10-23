import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApi } from '../api-config';
import { AdminAuditApi } from './admin-audit.api';

describe('AdminAuditApi', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
      ],
    }),
  );

  it('envía los filtros del registro', () => {
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(AdminAuditApi)
      .list({ entityType: 'Offer', entityId: 'o1', action: 'offer.', page: 2 })
      .subscribe();
    const req = http.expectOne((r) => r.url === 'https://api.test/api/v1/admin/audit-logs');
    expect(req.request.params.get('entityType')).toBe('Offer');
    expect(req.request.params.get('entityId')).toBe('o1');
    expect(req.request.params.get('action')).toBe('offer.');
    expect(req.request.params.get('page')).toBe('2');
  });
});
