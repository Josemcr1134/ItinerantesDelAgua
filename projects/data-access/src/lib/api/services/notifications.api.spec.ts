import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApi } from '../api-config';
import { SKIP_GLOBAL_LOADER } from '../http-context';
import { NotificationsApi } from './notifications.api';

const API = 'https://api.test/api/v1';

describe('NotificationsApi', () => {
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
    const api = TestBed.inject(NotificationsApi);
    const http = TestBed.inject(HttpTestingController);
    api.list({ category: 'PAYMENTS', unread: true }).subscribe();
    api.unreadCount().subscribe();
    api.markAllRead().subscribe();
    api.markRead('n1').subscribe();
    http.expectOne(`${API}/me/notifications?category=PAYMENTS&unread=true`);
    expect(
      http
        .expectOne(`${API}/me/notifications/unread-count`)
        .request.context.get(SKIP_GLOBAL_LOADER),
    ).toBe(true);
    expect(http.expectOne(`${API}/me/notifications/read-all`).request.method).toBe('POST');
    expect(http.expectOne(`${API}/me/notifications/n1/read`).request.method).toBe('POST');
    http.verify();
  });

  it('el panel de la campana pide la lista sin el loader general', () => {
    const api = TestBed.inject(NotificationsApi);
    const http = TestBed.inject(HttpTestingController);
    api.list({ pageSize: 5 }, { silent: true }).subscribe();
    api.list({ pageSize: 20 }).subscribe();
    const [silent, normal] = http.match((r) => r.url.endsWith('/me/notifications'));
    expect(silent.request.context.get(SKIP_GLOBAL_LOADER)).toBe(true);
    expect(normal.request.context.get(SKIP_GLOBAL_LOADER)).toBe(false);
  });
});
