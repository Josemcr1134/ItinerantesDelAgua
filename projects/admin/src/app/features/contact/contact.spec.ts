import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SessionStore } from 'auth';
import {
  AdminContactMessageDto,
  apiErrorInterceptor,
  Permission,
  provideApi,
  UserProfileDto,
} from 'data-access';
import { AlertService } from 'ui-kit';
import { AdminAccess } from '../../core/access/admin-access';
import ContactInboxPage from './contact-inbox-page';
import ContactMessagePage from './message/contact-message-page';

const API = 'https://api.test/api/v1/admin';
const tick = () => new Promise((r) => setTimeout(r));

const summary = {
  unread: 3,
  byStatus: [
    { status: 'NEW', label: 'Nuevo', count: 3 },
    { status: 'IN_PROGRESS', label: 'En proceso', count: 1 },
    { status: 'ANSWERED', label: 'Respondido', count: 0 },
    { status: 'ARCHIVED', label: 'Archivado', count: 0 },
  ],
};

function message(extra: Partial<AdminContactMessageDto> = {}): AdminContactMessageDto {
  return {
    id: 'm1',
    name: 'Lucía Torres',
    email: 'lucia@example.com',
    organization: 'Cooperativa del Agua',
    phone: { countryCode: '52', number: '5512345678' },
    subject: 'DESIGN_CONSULTING',
    subjectLabel: 'Diseño y consultoría',
    origin: 'LANDING',
    originLabel: 'Landing',
    projectType: 'COLLECTIVE',
    projectLocation: 'Xalapa, Veracruz',
    service: 'RAINWATER_HARVESTING_DESIGN',
    message: 'Queremos captar agua de lluvia.\nSomos 40 familias.',
    status: 'NEW',
    statusLabel: 'Nuevo',
    internalNote: null,
    handledBy: null,
    handledAt: null,
    createdAt: '2026-10-28T16:00:00.000Z',
    ...extra,
  };
}

describe('Mensajes de Contacto', () => {
  async function setup<T>(
    component: Type<T>,
    permissions: Permission[],
    inputs: Record<string, unknown> = {},
  ) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        {
          provide: AlertService,
          useValue: { open: () => Promise.resolve(true), confirm: () => Promise.resolve(true) },
        },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(SessionStore).setUser({ id: 'me', roles: [] } as unknown as UserProfileDto);
    const loaded = TestBed.inject(AdminAccess).load();
    http
      .expectOne(`${API}/me`)
      .flush({ user: { id: 'me', email: '', fullName: 'Ana' }, roles: [], permissions });
    await loaded;
    http.expectOne(`${API}/roles`).flush({ data: [] });
    const fixture = TestBed.createComponent(component);
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const settle = async () => {
      await tick();
      await fixture.whenStable();
    };
    return { fixture, http, host, settle };
  }

  it('la bandeja abre en "Nuevo" y muestra los contadores', async () => {
    const { http, host, settle } = await setup(ContactInboxPage, ['contact.read']);
    http.expectOne(`${API}/contact-messages/summary`).flush(summary);
    const list = http.expectOne((r) => r.url === `${API}/contact-messages`);
    expect(list.request.params.get('status')).toBe('NEW');
    expect(list.request.params.get('sort')).toBe('CREATED_DESC');
    list.flush({
      data: [message()],
      meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
    });
    await settle();

    const active = host.querySelector('.tabs__tab--active');
    expect(active?.textContent).toContain('Nuevo');
    expect(active?.textContent).toContain('3');
    const row = host.querySelector('tbody tr')!;
    expect(row.classList).toContain('row--new');
    expect(row.textContent).toContain('Diseño y consultoría');
    expect(row.querySelector('a')?.getAttribute('href')).toBe('/mensajes/m1');
  });

  it('el detalle muestra el proyecto de Diseño y consultoría y responde por correo', async () => {
    const { http, host, settle } = await setup(ContactMessagePage, ['contact.read'], {
      id: 'm1',
    });
    http.expectOne(`${API}/contact-messages/m1`).flush(message());
    await settle();

    expect(host.textContent).toContain('Colectivo o comunitario');
    expect(host.textContent).toContain('Xalapa, Veracruz');
    expect(host.textContent).toContain('Diseño de captación de agua de lluvia');
    expect(host.textContent).toContain('+52 5512345678');
    const reply = host.querySelector<HTMLAnchorElement>('.actions a')!;
    expect(reply.getAttribute('href')).toMatch(/^mailto:lucia@example\.com\?subject=Re%3A/);
    // Sin `contact.manage` no se puede cambiar el estado.
    expect(host.querySelector('#contact-status')).toBeNull();
  });

  it('con contact.manage cambia el estado y guarda la nota aparte del formulario', async () => {
    const { http, host, settle } = await setup(
      ContactMessagePage,
      ['contact.read', 'contact.manage'],
      { id: 'm1' },
    );
    http.expectOne(`${API}/contact-messages/m1`).flush(message());
    await settle();
    const submit = (form: string) =>
      host.querySelector<HTMLButtonElement>(`${form} button[type="submit"]`)!;
    const me = { id: 'me', fullName: 'Ana López', email: 'ana@x.org' };

    // Estado: se envía solo el estado.
    const status = host.querySelector<HTMLSelectElement>('#contact-status')!;
    status.value = 'ANSWERED';
    status.dispatchEvent(new Event('change'));
    await settle();
    submit('.status-form').click();
    await settle();
    const patchStatus = http.expectOne(`${API}/contact-messages/m1`);
    expect(patchStatus.request.body).toEqual({ status: 'ANSWERED' });
    patchStatus.flush(
      message({
        status: 'ANSWERED',
        statusLabel: 'Respondido',
        handledBy: me,
        handledAt: '2026-10-29T10:00:00.000Z',
      }),
    );
    await settle();
    http.expectOne(`${API}/contact-messages/summary`).flush({ ...summary, unread: 2 });
    await settle();
    expect(host.querySelector('.answered')?.textContent).toContain('Respondió Ana López');
    expect(host.querySelector('.note')).toBeNull();

    // Nota: se envía sola, se muestra aparte y el formulario queda vacío.
    const note = host.querySelector<HTMLTextAreaElement>('#contact-note')!;
    note.value = '  Les enviamos la propuesta.  ';
    note.dispatchEvent(new Event('input'));
    await settle();
    submit('.note-form').click();
    await settle();
    const patchNote = http.expectOne(`${API}/contact-messages/m1`);
    expect(patchNote.request.body).toEqual({ internalNote: 'Les enviamos la propuesta.' });
    patchNote.flush(
      message({
        status: 'ANSWERED',
        statusLabel: 'Respondido',
        internalNote: 'Les enviamos la propuesta.',
        handledBy: me,
        handledAt: '2026-10-29T10:05:00.000Z',
      }),
    );
    await settle();
    http.expectOne(`${API}/contact-messages/summary`).flush(summary);
    await settle();
    expect(host.querySelector('.note')?.textContent).toContain('Les enviamos la propuesta.');
    expect(host.querySelector<HTMLTextAreaElement>('#contact-note')!.value).toBe('');
    expect(host.querySelector('label[for="contact-note"]')?.textContent).toContain(
      'Reemplazar la nota',
    );
    expect(host.textContent).toContain('Último cambio: Ana López');

    // "Borrar nota" envía `internalNote: null`.
    host.querySelector<HTMLButtonElement>('.note__clear')!.click();
    await settle();
    expect(http.expectOne(`${API}/contact-messages/m1`).request.body).toEqual({
      internalNote: null,
    });
  });

  it('"Todos" no filtra por estado y queda al final', async () => {
    const { http, host, settle } = await setup(ContactInboxPage, ['contact.read'], {
      estado: 'todos',
    });
    http.expectOne(`${API}/contact-messages/summary`).flush(summary);
    const list = http.expectOne((r) => r.url === `${API}/contact-messages`);
    expect(list.request.params.has('status')).toBe(false);
    list.flush({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } });
    await settle();
    const tabs = [...host.querySelectorAll<HTMLAnchorElement>('.tabs__tab')];
    expect(tabs.at(-1)?.textContent).toContain('Todos');
    expect(tabs.at(-1)?.classList).toContain('tabs__tab--active');
    // "Nuevo" es la entrada: su enlace no lleva `?estado=`.
    expect(tabs[0].textContent).toContain('Nuevo');
    expect(tabs[0].getAttribute('href')).toBe('/');
  });

  it('la lista muestra quién respondió', async () => {
    const { http, host, settle } = await setup(ContactInboxPage, ['contact.read']);
    http.expectOne(`${API}/contact-messages/summary`).flush(summary);
    http
      .expectOne((r) => r.url === `${API}/contact-messages`)
      .flush({
        data: [
          message({
            status: 'ANSWERED',
            statusLabel: 'Respondido',
            handledBy: { id: 'me', fullName: 'Ana López', email: 'ana@x.org' },
            handledAt: '2026-10-29T10:00:00.000Z',
          }),
        ],
        meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      });
    await settle();
    expect(host.querySelector('tbody tr')?.textContent).toContain('Respondió Ana López');
  });
});
