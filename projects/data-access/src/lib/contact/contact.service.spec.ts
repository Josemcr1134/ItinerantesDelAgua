import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { CONTACT_ENDPOINT, ContactEndpointMissingError } from './contact-endpoint';
import { ContactService } from './contact.service';

describe('ContactService', () => {
  function setup(endpoint: string | null) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CONTACT_ENDPOINT, useValue: endpoint },
      ],
    });
    return { service: TestBed.inject(ContactService), http: TestBed.inject(HttpTestingController) };
  }

  it('falla con un error claro mientras el endpoint no esté configurado', async () => {
    const { service } = setup(null);
    await expect(
      firstValueFrom(service.send({ email: 'ana@example.test', message: 'Hola' })),
    ).rejects.toBeInstanceOf(ContactEndpointMissingError);
  });

  it('envía el mensaje por POST al endpoint configurado', async () => {
    const { service, http } = setup('https://api.example.test/contacto');
    const sent = firstValueFrom(service.send({ email: 'ana@example.test', message: 'Hola' }));
    const req = http.expectOne('https://api.example.test/contacto');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'ana@example.test', message: 'Hola' });
    req.flush(null);
    await sent;
    http.verify();
  });
});
