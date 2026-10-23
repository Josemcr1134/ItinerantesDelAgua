import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SessionStore } from 'auth';
import { apiErrorInterceptor, Permission, provideApi, UserProfileDto } from 'data-access';
import { AlertService } from 'ui-kit';
import { AdminAccess } from '../../../core/access/admin-access';
import { offerFixture } from '../testing/offer-fixture';
import MoodlePage from './moodle-page';

const API = 'https://api.test/api/v1/admin';
const MOODLE = `${API}/offers/o1/moodle`;
const tick = () => new Promise((r) => setTimeout(r));
const empty = { data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } };

describe('MoodlePage', () => {
  async function setup(permissions: Permission[], origin: 'MOODLE' | 'NAS', seccion?: string) {
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
    const fixture = TestBed.createComponent(MoodlePage);
    fixture.componentRef.setInput('id', 'o1');
    if (seccion) fixture.componentRef.setInput('seccion', seccion);
    await fixture.whenStable();
    const offer = offerFixture({ name: 'Curso en Moodle' });
    http
      .expectOne(`${API}/offers/o1`)
      .flush({ ...offer, origin, originPricing: { ...offer.originPricing, origin } });
    const settle = async () => {
      await tick();
      await fixture.whenStable();
    };
    await settle();
    const host = fixture.nativeElement as HTMLElement;
    const button = (text: string, root: ParentNode = document) =>
      [...root.querySelectorAll<HTMLButtonElement>('button')].find((b) =>
        b.textContent?.trim().startsWith(text),
      );
    return { fixture, http, host, settle, button };
  }

  it('en una oferta que no es de Moodle no consulta la lista ni los códigos', async () => {
    const { http, host } = await setup(['admin.access', 'offers.read', 'offers.write'], 'NAS');
    expect(host.textContent).toContain('solo aplican');
    http.expectNone((r) => r.url.includes('/moodle'));
  });

  it('carga correos pegados y muestra el resultado', async () => {
    const { http, host, settle, button } = await setup(
      ['admin.access', 'offers.read', 'offers.write'],
      'MOODLE',
    );
    http
      .expectOne((r) => r.url === `${MOODLE}/roster`)
      .flush({
        data: [
          {
            id: 'r1',
            email: 'luis@correo.mx',
            linked: false,
            linkedUser: null,
            linkedAt: null,
            createdAt: '2026-10-15T16:00:00.000Z',
          },
        ],
        meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      });
    await settle();
    expect(host.querySelector('tbody')?.textContent).toContain('Pendiente');

    button('Cargar correos', host)!.click();
    await settle();
    const text = document.querySelector<HTMLTextAreaElement>('#roster-text')!;
    text.value = 'ana@correo.mx\nno-es-correo';
    text.dispatchEvent(new Event('input'));
    await settle();
    document.querySelector<HTMLFormElement>('dialog[open] form')!.requestSubmit();
    await settle();
    const post = http.expectOne((r) => r.url === `${MOODLE}/roster` && r.method === 'POST');
    expect(post.request.body).toEqual({ csv: 'ana@correo.mx\nno-es-correo' });
    post.flush({ added: 1, duplicates: 0, invalid: ['no-es-correo'], linkedUsers: 0 });
    await settle();
    http.expectOne((r) => r.url === `${MOODLE}/roster` && r.method === 'GET').flush(empty);
    expect(document.querySelector('dialog[open]')?.textContent).toContain('no-es-correo');
    expect(host.querySelector('.adm-notice')?.textContent).toContain('Se cargaron 1 correo.');
  });

  it('genera códigos: se ven una sola vez y la X no cierra hasta guardarlos', async () => {
    const { http, host, settle, button } = await setup(
      ['admin.access', 'offers.read', 'offers.write'],
      'MOODLE',
      'codigos',
    );
    http.expectOne((r) => r.url === `${MOODLE}/codes`).flush(empty);
    http.expectNone((r) => r.url === `${MOODLE}/roster`);
    await settle();

    button('Generar códigos', host)!.click();
    await settle();
    const count = document.querySelector<HTMLInputElement>('#codes-count')!;
    count.value = '2';
    count.dispatchEvent(new Event('input'));
    await settle();
    document.querySelector<HTMLFormElement>('dialog[open] form')!.requestSubmit();
    await settle();
    const post = http.expectOne((r) => r.url === `${MOODLE}/codes` && r.method === 'POST');
    expect(post.request.body).toEqual({ count: 2 });
    post.flush({ codes: ['AB12-CD34', 'EF56-GH78'], expiresAt: null });
    await settle();
    http.expectOne((r) => r.url === `${MOODLE}/codes` && r.method === 'GET').flush(empty);

    const dialog = document.querySelector('dialog[open]')!;
    expect(dialog.querySelectorAll('.codes li').length).toBe(2);
    expect(dialog.querySelector<HTMLButtonElement>('.dialog__close')!.disabled).toBe(true);
  });

  it('quita un correo pendiente con confirmación', async () => {
    const { http, host, settle, button } = await setup(
      ['admin.access', 'offers.read', 'offers.write'],
      'MOODLE',
    );
    http
      .expectOne((r) => r.url === `${MOODLE}/roster`)
      .flush({
        data: [
          {
            id: 'r1',
            email: 'luis@correo.mx',
            linked: false,
            linkedUser: null,
            linkedAt: null,
            createdAt: '2026-10-15T16:00:00.000Z',
          },
        ],
        meta: { page: 1, pageSize: 20, total: 1, totalPages: 1 },
      });
    await settle();
    button('Quitar', host)!.click();
    await settle();
    http.expectOne(`${MOODLE}/roster/r1`).flush(null, { status: 204, statusText: 'No Content' });
    await settle();
    http.expectOne((r) => r.url === `${MOODLE}/roster`).flush(empty);
    expect(host.querySelector('.adm-notice')?.textContent).toContain('Se quitó luis@correo.mx');
  });
});
