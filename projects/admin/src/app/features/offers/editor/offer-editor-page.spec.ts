import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SessionStore } from 'auth';
import { apiErrorInterceptor, Permission, provideApi, UserProfileDto } from 'data-access';
import { AlertService } from 'ui-kit';
import { AdminAccess } from '../../../core/access/admin-access';
import { offerFixture } from '../testing/offer-fixture';
import OfferEditorPage from './offer-editor-page';

const API = 'https://api.test/api/v1';

describe('OfferEditorPage', () => {
  async function setup(permissions: Permission[], issues = {}) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        {
          provide: AlertService,
          useValue: { confirm: () => Promise.resolve(true), open: () => Promise.resolve(true) },
        },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(SessionStore).setUser({ id: 'me', roles: [] } as unknown as UserProfileDto);
    const loaded = TestBed.inject(AdminAccess).load();
    http
      .expectOne(`${API}/admin/me`)
      .flush({ user: { id: 'me', email: '', fullName: 'Ana' }, roles: [], permissions });
    await loaded;
    http.expectOne(`${API}/admin/roles`).flush({ data: [] });

    const fixture = TestBed.createComponent(OfferEditorPage);
    fixture.componentRef.setInput('id', 'o1');
    await fixture.whenStable();
    const offer = offerFixture({}, issues);
    http.expectOne(`${API}/admin/offers/o1`).flush(offer);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const button = (text: string) =>
      [...host.querySelectorAll<HTMLButtonElement>('button')].find((b) =>
        b.textContent?.trim().startsWith(text),
      );
    return { fixture, http, host, button, offer };
  }

  it('muestra los 7 pasos y, con pendientes, bloquea "Siguiente" y "Publicar"', async () => {
    const { host, button } = await setup(
      ['admin.access', 'offers.read', 'offers.write', 'offers.publish'],
      {
        general: [{ field: 'summary', code: 'REQUIRED', message: 'Escribe el resumen.' }],
      },
    );
    expect(host.querySelectorAll('.stepper__item').length).toBe(7);
    expect(button('Siguiente')!.disabled).toBe(true);
    expect(button('Publicar')!.disabled).toBe(true);
    expect(host.querySelector('#publish-blockers')?.textContent).toContain('Escribe el resumen.');
  });

  it('al cambiar de paso guarda primero lo pendiente (autoguardado)', async () => {
    const { fixture, http, host, offer } = await setup([
      'admin.access',
      'offers.read',
      'offers.write',
    ]);
    const summary = host.querySelector<HTMLTextAreaElement>('#g-summary')!;
    summary.value = 'Nuevo resumen';
    summary.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    host.querySelectorAll<HTMLButtonElement>('.stepper__item')[1].click();
    await fixture.whenStable();
    const req = http.expectOne(`${API}/admin/offers/o1/steps/general`);
    expect(req.request.body.summary).toBe('Nuevo resumen');
    req.flush(offer);
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
    expect(host.querySelector('#offer-step-title')?.textContent).toContain('Contenido');
  });

  it('sin offers.write queda en solo lectura (sin guardar ni publicar)', async () => {
    const { host, button } = await setup(['admin.access', 'offers.read']);
    expect(host.textContent).toContain('Solo lectura');
    expect(host.querySelector<HTMLInputElement>('#g-name')!.disabled).toBe(true);
    expect(button('Publicar')).toBeUndefined();
    expect(button('Siguiente')!.disabled).toBe(false);
  });
});
