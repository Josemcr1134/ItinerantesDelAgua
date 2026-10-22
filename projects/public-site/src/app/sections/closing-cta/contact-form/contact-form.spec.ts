import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { apiErrorInterceptor, provideApi } from 'data-access';
import { AlertOptions, AlertService } from 'ui-kit';
import { CLOSING_CTA_CONTENT } from '../../../content/closing-cta.content';
import { ContactForm } from './contact-form';

const API = 'https://api.test/api/v1';
const tick = () => new Promise((resolve) => setTimeout(resolve));

/** Alertas abiertas (tipo + opciones), en orden. */
type OpenedAlert = AlertOptions & { readonly kind: string };

describe('ContactForm', () => {
  async function setup() {
    const alerts: OpenedAlert[] = [];
    const record =
      (kind: string) =>
      (title: string, message: string, extra: Partial<AlertOptions> = {}) => (
        alerts.push({ ...extra, kind, title, message }),
        Promise.resolve(true)
      );
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        {
          provide: AlertService,
          useValue: {
            open: (o: AlertOptions) => (alerts.push({ ...o, kind: 'open' }), Promise.resolve(true)),
            success: record('success'),
            warning: record('warning'),
            error: record('error'),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(ContactForm);
    fixture.componentRef.setInput('content', CLOSING_CTA_CONTENT.form);
    let backed = false;
    fixture.componentInstance.back.subscribe(() => (backed = true));
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
    return {
      fixture,
      host,
      http,
      type,
      choose,
      check,
      submit,
      fillRequired,
      stable,
      alerts,
      backed: () => backed,
    };
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

  it('envía a la API con origen LANDING, confirma con una alerta y vuelve', async () => {
    const { host, http, submit, fillRequired, stable, alerts, backed } = await setup();
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

    expect(alerts).toEqual([
      expect.objectContaining({
        kind: 'success',
        title: '¡Mensaje enviado!',
        message: CLOSING_CTA_CONTENT.form.successMessage,
      }),
    ]);
    expect(host.querySelector<HTMLInputElement>('#contact-name')!.value).toBe('');
    expect(backed()).toBe(true);
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

  it('validación de la API: alerta para revisar y error en su campo', async () => {
    const { host, http, submit, fillRequired, stable, alerts, backed } = await setup();
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
    expect(alerts).toEqual([
      expect.objectContaining({ kind: 'warning', title: 'Revisa tus datos' }),
    ]);
    expect(document.activeElement).toBe(host.querySelector('#contact-email'));
    expect(backed()).toBe(false);
  });

  it('límite de envíos: alerta con el mensaje de la API', async () => {
    const { http, submit, fillRequired, stable, alerts } = await setup();
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
    expect(alerts).toEqual([
      expect.objectContaining({
        kind: 'warning',
        title: 'Demasiados envíos',
        message: 'Demasiadas solicitudes. Intenta de nuevo en unos momentos.',
      }),
    ]);
  });

  it('sin conexión: alerta con la ilustración de red', async () => {
    const { http, submit, fillRequired, stable, alerts } = await setup();
    await fillRequired();
    await submit();
    http.expectOne(`${API}/contact-messages`).error(new ProgressEvent('error'));
    await stable();
    expect(alerts).toEqual([
      expect.objectContaining({ kind: 'open', variant: 'network', title: 'Sin conexión' }),
    ]);
  });

  it('error del servidor: alerta de error con el código de referencia', async () => {
    const { http, submit, fillRequired, stable, alerts } = await setup();
    await fillRequired();
    await submit();
    http.expectOne(`${API}/contact-messages`).flush(
      {
        statusCode: 500,
        code: 'INTERNAL_ERROR',
        message: 'Ocurrió un error inesperado.',
        requestId: 'req-500',
      },
      { status: 500, statusText: 'Server Error' },
    );
    await stable();
    expect(alerts).toEqual([
      expect.objectContaining({ kind: 'error', title: 'No se pudo enviar', reference: 'req-500' }),
    ]);
  });
});
