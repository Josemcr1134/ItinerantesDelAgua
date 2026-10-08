import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CONTACT_ENDPOINT } from 'data-access';
import { CLOSING_CTA_CONTENT } from '../../../content/closing-cta.content';
import { ContactForm } from './contact-form';

describe('ContactForm', () => {
  async function setup(endpoint: string | null) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: CONTACT_ENDPOINT, useValue: endpoint },
      ],
    });
    const fixture = TestBed.createComponent(ContactForm);
    fixture.componentRef.setInput('content', CLOSING_CTA_CONTENT.form);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const type = (selector: string, value: string) => {
      const field = host.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector)!;
      field.value = value;
      field.dispatchEvent(new Event('input'));
    };
    const submit = async () => {
      host.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
      await fixture.whenStable();
    };
    return { fixture, host, type, submit };
  }

  it('marca los campos vacíos, asocia el error y enfoca el primero', async () => {
    const { host, submit } = await setup(null);
    await submit();

    const email = host.querySelector('#contact-email')!;
    expect(email.getAttribute('aria-invalid')).toBe('true');
    expect(email.getAttribute('aria-describedby')).toBe('contact-email-error');
    expect(host.querySelector('#contact-email-error')?.textContent).toContain('Escribe tu correo');
    expect(host.querySelector('#contact-message-error')).not.toBeNull();
    expect(document.activeElement).toBe(email);
  });

  it('pide un correo válido', async () => {
    const { host, type, submit } = await setup(null);
    type('#contact-email', 'no-es-correo');
    type('#contact-message', 'Hola');
    await submit();
    expect(host.querySelector('#contact-email-error')?.textContent).toContain('correo válido');
  });

  it('anuncia el error mientras el endpoint no esté configurado', async () => {
    const { host, type, submit } = await setup(null);
    type('#contact-email', 'ana@example.test');
    type('#contact-message', 'Hola');
    await submit();
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('No pudimos enviar');
  });

  it('envía el mensaje y confirma el envío', async () => {
    const { fixture, host, type, submit } = await setup('https://api.example.test/contacto');
    type('#contact-email', 'ana@example.test');
    type('#contact-message', 'Hola');
    await submit();

    const req = TestBed.inject(HttpTestingController).expectOne(
      'https://api.example.test/contacto',
    );
    expect(req.request.body).toEqual({ email: 'ana@example.test', message: 'Hola' });
    req.flush(null);
    await fixture.whenStable();

    expect(host.querySelector('[role="status"]')?.textContent).toContain('Gracias');
    expect(host.querySelector<HTMLInputElement>('#contact-email')!.value).toBe('');
  });
});
