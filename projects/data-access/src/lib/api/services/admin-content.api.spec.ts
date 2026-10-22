import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { provideApi } from '../api-config';
import { AdminContentApi } from './admin-content.api';

const API = 'https://api.test/api/v1/admin';

describe('AdminContentApi', () => {
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
    const api = TestBed.inject(AdminContentApi);
    const http = TestBed.inject(HttpTestingController);
    const cases: [() => unknown, string, string][] = [
      [() => api.list('o1').subscribe(), 'GET', `${API}/offers/o1/modules`],
      [
        () => api.createModule('o1', { title: 'Humedales' }).subscribe(),
        'POST',
        `${API}/offers/o1/modules`,
      ],
      [
        () => api.reorderModules('o1', { moduleIds: ['m2', 'm1'] }).subscribe(),
        'PUT',
        `${API}/offers/o1/modules/order`,
      ],
      [
        () => api.updateModule('m1', { visibility: 'PUBLISHED' }).subscribe(),
        'PATCH',
        `${API}/modules/m1`,
      ],
      [() => api.deleteModule('m1').subscribe(), 'DELETE', `${API}/modules/m1`],
      [
        () => api.createResource('m1', { type: 'ACTIVITY', title: 'Bitácora' }).subscribe(),
        'POST',
        `${API}/modules/m1/resources`,
      ],
      [
        () => api.reorderResources('m1', { resourceIds: ['r2', 'r1'] }).subscribe(),
        'PUT',
        `${API}/modules/m1/resources/order`,
      ],
      [
        () => api.updateResource('r1', { visibility: 'HIDDEN' }).subscribe(),
        'PATCH',
        `${API}/resources/r1`,
      ],
      [() => api.deleteResource('r1').subscribe(), 'DELETE', `${API}/resources/r1`],
    ];
    for (const [call, method, url] of cases) {
      call();
      expect(http.expectOne(url).request.method).toBe(method);
    }
  });

  it('sube el archivo de un recurso a su URL firmada y devuelve la key', async () => {
    const http = TestBed.inject(HttpTestingController);
    const file = new File(['%PDF'], 'guia.pdf', { type: 'application/pdf' });
    const key = firstValueFrom(
      TestBed.inject(AdminContentApi).uploadResourceFile('m1', 'PRE_READING', file),
    );
    const signed = http.expectOne(`${API}/modules/m1/resources/upload-url`);
    expect(signed.request.body).toEqual({
      type: 'PRE_READING',
      fileName: 'guia.pdf',
      contentType: 'application/pdf',
      sizeBytes: 4,
    });
    signed.flush({
      uploadUrl: 'https://storage.test/put',
      method: 'PUT',
      headers: { 'Content-Type': 'application/pdf' },
      key: 'mod/guia.pdf',
      expiresAt: '',
      maxBytes: 52428800,
    });
    const put = http.expectOne('https://storage.test/put');
    expect(put.request.body).toBe(file);
    put.flush(null);
    expect(await key).toBe('mod/guia.pdf');
  });
});
