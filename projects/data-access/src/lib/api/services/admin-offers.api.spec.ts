import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { provideApi } from '../api-config';
import { AdminOffersApi, AdminTeachersApi, AdminUploadsApi } from './admin-offers.api';

describe('AdminOffersApi / AdminUploadsApi', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
      ],
    }),
  );

  it('guarda cada paso en su segmento', () => {
    TestBed.inject(AdminOffersApi).updateStep('o1', 'origin-pricing', { isFree: true }).subscribe();
    const req = TestBed.inject(HttpTestingController).expectOne(
      'https://api.test/api/v1/admin/offers/o1/steps/origin-pricing',
    );
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ isFree: true });
  });

  it('crea, edita y borra docentes en sus rutas', () => {
    const http = TestBed.inject(HttpTestingController);
    const teachers = TestBed.inject(AdminTeachersApi);
    teachers.create({ fullName: 'Marta Torres' }).subscribe();
    expect(http.expectOne('https://api.test/api/v1/admin/teachers').request.method).toBe('POST');
    teachers.update('t1', { bio: null }).subscribe();
    const patch = http.expectOne('https://api.test/api/v1/admin/teachers/t1');
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual({ bio: null });
    teachers.remove('t1').subscribe();
    expect(http.expectOne('https://api.test/api/v1/admin/teachers/t1').request.method).toBe(
      'DELETE',
    );
  });

  it('sube una imagen: pide la URL firmada, hace el PUT y devuelve la key', async () => {
    const http = TestBed.inject(HttpTestingController);
    const file = new File(['x'], 'portada.png', { type: 'image/png' });
    const key = firstValueFrom(
      TestBed.inject(AdminUploadsApi).uploadImage(file, 'OFFER_COVER', 'o1'),
    );

    const signed = http.expectOne('https://api.test/api/v1/admin/uploads/images');
    expect(signed.request.body).toEqual({
      purpose: 'OFFER_COVER',
      offerId: 'o1',
      fileName: 'portada.png',
      contentType: 'image/png',
      sizeBytes: 1,
    });
    signed.flush({
      uploadUrl: 'https://storage.test/put',
      method: 'PUT',
      headers: { 'Content-Type': 'image/png' },
      key: 'public/offers/o1/portada.png',
      expiresAt: '',
    });

    const put = http.expectOne('https://storage.test/put');
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toBe(file);
    expect(put.request.headers.get('Content-Type')).toBe('image/png');
    put.flush(null);
    expect(await key).toBe('public/offers/o1/portada.png');
  });
});
