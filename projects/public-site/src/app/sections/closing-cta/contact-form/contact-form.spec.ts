import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { apiErrorInterceptor, provideApi } from 'data-access';
import { CLOSING_CTA_CONTENT } from '../../../content/closing-cta.content';
import { ContactForm } from './contact-form';

const API = 'https://api.test/api/v1';
const tick = () => new Promise((resolve) => setTimeout(resolve));

describe('ContactForm', () => {
  async function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
      ],
    });
    const fixture = TestBed.createComponent(ContactForm);
    fixture.componentRef.setInput('content', CLOSING_CTA_CONTENT.form);
    await fixture.whenStable();
    const http = TestBed.inject(HttpTestingController);
    const host = fixture.nativeElement as HTMLElement;
    const stable = async () => {
      await fixture.whenStable();
      await tick();
      await fixture.whenStable();
    };
    const type = async (selector: string, value: string) => {
      const field = host.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
      field.value = value;
      field.dispatchEvent(new Event('input'));
      await stable();
    };
    const choose = async (selector: string, value: string) => {
      const select = host.querySelector<HTMLSelectElement>(selector)!;
      select.value = value;
      select.dispatchEvent(new Event('change'));
      await stable();
    };
    const check = async (selector: string) => {
      host.querySelector<HTMLInputElement>(selector)!.click();
      await stable();
    };
    const submit = async () => {
      host.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
      await stable();
    };
    const fillRequired = async () => {
      await type('#contact-name', '  Lucía Hernández ');
      await type('#contact-email', 'lucia@example.com');
      await choose('#contact-subject', 'SCHOOL');
      await type('#contact-message', 'Quisiera información sobre el diplomado.');
      await check('#contact-privacyAccepted');
    };
    return { fixture, host, http, type, choose, check, submit, fillRequired, stable };
  }

  it('marca los obligatorios, asocia cada error y enfoca el primero', async () => {
    const { host, submit } = await setup();
    await submit();

    const name = host.querySelector('#contact-name')!;
    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(name.getAttribute('aria-describedby')).toBe('contact-name-error');
    for (const field of ['email', 'subject', 'message', 'privacyAccepted']) {
      expect(host.querySelector(`#contact-${field}-error`)).not.toBeNull();
    }
    expect(host.querySelector('#contact-privacyAccepted-error')?.textContent).toContain(
      'política de datos',
    );
    expect(document.activeElement).toBe(name);
  });

  it('valida el correo y la longitud del mensaje', async () => {
    const { host, type, submit } = await setup();
    await type('#contact-email', 'no-es-correo');
    await type('#contact-message', 'Hola');
    await submit();
    expect(host.querySelector('#contact-email-error')?.textContent).toContain('correo válido');
    expect(host.querySelector('#contact-message-error')?.textContent).toContain('entre 10');
  });

  it('con "Diseño y consultoría" pide los datos del proyecto', async () => {
    const { host, choose, submit } = await setup();
    expect(host.querySelector('#contact-projectType')).toBeNull();
    await choose('#contact-subject', 'DESIGN_CONSULTING');
    await submit();
    for (const field of ['projectType', 'projectLocation', 'service']) {
      expect(host.querySelector(`#contact-${field}-error`)).not.toBeNull();
    }
    await choose('#contact-subject', 'OTHER');
    expect(host.querySelector('#contact-projectType')).toBeNull();
  });

  it('envía a la API con origen LANDING y confirma', async () => {
    const { host, http, type, submit, fillRequired, stable } = await setup();
    expect(host.querySelector('#contact-organization, [id^="contact-phone"]')).toBeNull();
    await fillRequired();
    await submit();

    const req = http.expectOne(`${API}/contact-messages`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      name: 'Lucía Hernández',
      email: 'lucia@example.com',
      subject: 'SCHOOL',
      message: 'Quisiera información sobre el diplomado.',
      privacyAccepted: true,
      origin: 'LANDING',
    });
    req.flush(
      { id: 'c1', status: 'NEW', createdAt: '2026-11-07T16:00:00.000Z' },
      { status: 201, statusText: 'Created' },
    );
    await stable();

    expect(host.querySelector('[role="status"]')?.textContent).toContain('Gracias');
    expect(host.querySelector<HTMLInputElement>('#contact-name')!.value).toBe('');
  });

  it('incluye los datos del proyecto con "Diseño y consultoría"', async () => {
    const { http, type, choose, submit, fillRequired } = await setup();
    await fillRequired();
    await choose('#contact-subject', 'DESIGN_CONSULTING');
    await choose('#contact-projectType', 'COLLECTIVE');
    await type('#contact-projectLocation', 'San Cristóbal, Chiapas');
    await choose('#contact-service', 'NOT_SURE');
    await submit();

    const body = http.expectOne(`${API}/contact-messages`).request.body;
    expect(body).toMatchObject({
      subject: 'DESIGN_CONSULTING',
      projectType: 'COLLECTIVE',
      projectLocation: 'San Cristóbal, Chiapas',
      service: 'NOT_SURE',
    });
  });

  it('muestra en su campo los errores de validación de la API', async () => {
    const { host, http, submit, fillRequired, stable } = await setup();
    await fillRequired();
    await submit();
    http.expectOne(`${API}/contact-messages`).flush(
      {
        statusCode: 400,
        code: 'VALIDATION_ERROR',
        message: 'Los datos enviados no son válidos.',
        details: [{ field: 'email', code: 'IS_EMAIL', message: 'Debe ser un correo válido.' }],
        requestId: 'r1',
      },
      { status: 400, statusText: 'Bad Request' },
    );
    await stable();

    expect(host.querySelector('#contact-email-error')?.textContent).toContain(
      'Debe ser un correo válido.',
    );
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Revisa los campos');
    expect(document.activeElement).toBe(host.querySelector('#contact-email'));
  });

  it('anuncia el límite de envíos con el mensaje de la API', async () => {
    const { host, http, submit, fillRequired, stable } = await setup();
    await fillRequired();
    await submit();
    http.expectOne(`${API}/contact-messages`).flush(
      {
        statusCode: 429,
        code: 'RATE_LIMITED',
        message: 'Demasiadas solicitudes. Intenta de nuevo en unos momentos.',
        requestId: 'r2',
      },
      { status: 429, statusText: 'Too Many Requests' },
    );
    await stable();
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('Demasiadas solicitudes');
  });
});
