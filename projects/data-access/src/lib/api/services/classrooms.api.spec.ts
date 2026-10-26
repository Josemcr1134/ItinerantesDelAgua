import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideApi } from '../api-config';
import { ClassroomsApi } from './classrooms.api';

const API = 'https://api.test/api/v1/me/classrooms/o1';

describe('ClassroomsApi', () => {
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
    const api = TestBed.inject(ClassroomsApi);
    const http = TestBed.inject(HttpTestingController);
    api.classroom('o1').subscribe();
    api.materials('o1').subscribe();
    api.resourceAccess('o1', 'r1').subscribe();
    api.sessions('o1', { scope: 'PAST', pageSize: 20 }).subscribe();
    api.finalProjectDownload('o1').subscribe();
    http.expectOne(API);
    http.expectOne(`${API}/materials`);
    http.expectOne(`${API}/resources/r1/access`);
    http.expectOne(`${API}/sessions?scope=PAST&pageSize=20`);
    http.expectOne(`${API}/final-project/download`);
    http.verify();
  });

  it('entrega el proyecto final: URL firmada, PUT a storage y confirmación', () => {
    const api = TestBed.inject(ClassroomsApi);
    const http = TestBed.inject(HttpTestingController);
    const file = new File(['x'], 'proyecto.pdf', { type: 'application/pdf' });
    let confirmed: unknown;
    api.uploadFinalProject('o1', file).subscribe((project) => (confirmed = project));

    const target = http.expectOne(`${API}/final-project/upload-url`);
    expect(target.request.body).toEqual({
      fileName: 'proyecto.pdf',
      contentType: 'application/pdf',
      sizeBytes: 1,
    });
    target.flush({
      uploadUrl: 'https://storage.test/up',
      method: 'PUT',
      headers: { 'Content-Type': 'application/pdf' },
      key: 'k1',
      expiresAt: '2026-10-26T00:00:00Z',
    });
    const put = http.expectOne('https://storage.test/up');
    expect(put.request.headers.get('Content-Type')).toBe('application/pdf');
    put.flush(null);
    const confirm = http.expectOne(`${API}/final-project`);
    expect(confirm.request.method).toBe('PUT');
    expect(confirm.request.body).toEqual({ key: 'k1', fileName: 'proyecto.pdf' });
    confirm.flush({ submissionState: 'OPEN' });
    expect(confirmed).toEqual({ submissionState: 'OPEN' });
  });
});
