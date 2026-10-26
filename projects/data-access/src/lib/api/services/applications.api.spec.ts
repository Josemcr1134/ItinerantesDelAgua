import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApi } from '../api-config';
import { SKIP_GLOBAL_LOADER } from '../http-context';
import { ApplicationsApi } from './applications.api';

const API = 'https://api.test/api/v1';

describe('ApplicationsApi', () => {
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
    const api = TestBed.inject(ApplicationsApi);
    const http = TestBed.inject(HttpTestingController);
    const cases: [() => unknown, string, string][] = [
      [
        () => api.opportunities({ kind: 'OPEN_CALL' }).subscribe(),
        'GET',
        `${API}/me/applications/opportunities?kind=OPEN_CALL`,
      ],
      [
        () => api.list({ kind: 'OPEN_CALL', status: ['DRAFT', 'SUBMITTED'] }).subscribe(),
        'GET',
        `${API}/me/applications?kind=OPEN_CALL&status=DRAFT,SUBMITTED`,
      ],
      [() => api.create({ offerId: 'o1' }).subscribe(), 'POST', `${API}/me/applications`],
      [() => api.get('a1').subscribe(), 'GET', `${API}/me/applications/a1`],
      [
        () => api.update('a1', { motivation: 'x' }).subscribe(),
        'PATCH',
        `${API}/me/applications/a1`,
      ],
      [() => api.remove('a1').subscribe(), 'DELETE', `${API}/me/applications/a1`],
      [() => api.submit('a1').subscribe(), 'POST', `${API}/me/applications/a1/submit`],
      [() => api.confirm('a1').subscribe(), 'POST', `${API}/me/applications/a1/confirm`],
      [
        () => api.deleteDocument('a1', 'd1').subscribe(),
        'DELETE',
        `${API}/me/applications/a1/documents/d1`,
      ],
      [
        () => api.downloadDocument('a1', 'd1').subscribe(),
        'GET',
        `${API}/me/applications/a1/documents/d1/download`,
      ],
    ];
    for (const [call, method, url] of cases) {
      call();
      const request = http.expectOne(url);
      expect(request.request.method).toBe(method);
      request.flush({});
    }
    http.verify();
  });

  it('sube una evidencia: URL firmada, PUT a storage y confirmación', () => {
    const api = TestBed.inject(ApplicationsApi);
    const http = TestBed.inject(HttpTestingController);
    const file = new File(['x'], 'foto.png', { type: 'image/png' });
    let confirmed: unknown;
    api.uploadDocument('a1', file).subscribe((doc) => (confirmed = doc));

    const target = http.expectOne(`${API}/me/applications/a1/documents/upload-url`);
    expect(target.request.body).toEqual({
      fileName: 'foto.png',
      contentType: 'image/png',
      sizeBytes: 1,
    });
    target.flush({
      uploadUrl: 'https://storage.test/up',
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
      key: 'k1',
      expiresAt: '2026-10-26T00:00:00Z',
    });
    const put = http.expectOne('https://storage.test/up');
    expect(put.request.method).toBe('PUT');
    expect(put.request.headers.get('Content-Type')).toBe('image/png');
    put.flush(null);
    const confirm = http.expectOne(`${API}/me/applications/a1/documents`);
    expect(confirm.request.body).toEqual({ key: 'k1', fileName: 'foto.png' });
    confirm.flush({ id: 'd1' });
    expect(confirmed).toEqual({ id: 'd1' });
  });

  it('el autoguardado no muestra el loader general', () => {
    const api = TestBed.inject(ApplicationsApi);
    const http = TestBed.inject(HttpTestingController);
    api.update('a1', { age: 30 }, { silent: true }).subscribe();
    api.update('a1', { age: 31 }).subscribe();
    const [silent, normal] = http.match(`${API}/me/applications/a1`);
    expect(silent.request.context.get(SKIP_GLOBAL_LOADER)).toBe(true);
    expect(normal.request.context.get(SKIP_GLOBAL_LOADER)).toBe(false);
  });
});
