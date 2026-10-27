import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideAuth } from 'auth';
import { apiErrorInterceptor, provideApi } from 'data-access';
import OfferActionPage from './offer-action-page';

const API = 'https://api.test/api/v1';
const action = (type: string, extra: object = {}) => ({
  type,
  enabled: true,
  primary: false,
  requiresLogin: false,
  reason: null,
  availableFrom: null,
  applicationId: null,
  applicationStatus: null,
  ...extra,
});
const offer = (actions: object[]) => ({
  id: 'o1',
  slug: 'eco',
  name: 'Diplomado en Ecotecnologías',
  actions,
});

describe('OfferActionPage', () => {
  async function render(accion: string, actions: object[]) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ platformName: 'Portal' }),
      ],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(OfferActionPage);
    fixture.componentRef.setInput('slug', 'eco');
    fixture.componentRef.setInput('accion', accion);
    TestBed.tick();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne((r) => r.url === `${API}/offers/eco`).flush(offer(actions));
    await new Promise((r) => setTimeout(r));
    TestBed.tick();
    return { fixture, http, navigate, host: fixture.nativeElement as HTMLElement };
  }

  it('postular a beca: crea el borrador y entra al formulario de la beca', async () => {
    const { http, navigate } = await render('APPLY_SCHOLARSHIP', [action('APPLY_SCHOLARSHIP')]);
    const create = http.expectOne(`${API}/me/applications`);
    expect(create.request.body).toEqual({ offerId: 'o1' });
    create.flush({ id: 'b9' });
    await new Promise((r) => setTimeout(r));
    expect(navigate).toHaveBeenCalledWith(['/becas', 'b9'], { replaceUrl: true });
  });

  it('si ya tenía postulación, abre la existente', async () => {
    const { http, navigate } = await render('APPLY_SCHOLARSHIP', [action('APPLY_SCHOLARSHIP')]);
    http.expectOne(`${API}/me/applications`).flush(
      {
        statusCode: 409,
        code: 'APPLICATION_ALREADY_EXISTS',
        message: 'Ya existe',
        meta: { applicationId: 'b1' },
      },
      { status: 409, statusText: 'Conflict' },
    );
    await new Promise((r) => setTimeout(r));
    expect(navigate).toHaveBeenCalledWith(['/becas', 'b1'], { replaceUrl: true });
  });

  it('postular a una convocatoria: abre su formulario en Convocatorias', async () => {
    const { http, navigate } = await render('APPLY_OPEN_CALL', [action('APPLY_OPEN_CALL')]);
    http.expectOne(`${API}/me/applications`).flush({ id: 'c3' });
    await new Promise((r) => setTimeout(r));
    expect(navigate).toHaveBeenCalledWith(['/convocatorias'], {
      queryParams: { pestana: 'postulaciones', postulacion: 'c3' },
      replaceUrl: true,
    });
  });

  it('inscripción gratuita: inscribe y lleva al aula', async () => {
    const { http, navigate } = await render('ENROLL_FREE', [action('ENROLL_FREE')]);
    http.expectOne(`${API}/me/enrollments`).flush({ enrollmentId: 'e1' });
    await new Promise((r) => setTimeout(r));
    expect(navigate).toHaveBeenCalledWith(['/formacion/aula', 'o1'], { replaceUrl: true });
  });

  it('pagar en cuotas: va a la pantalla de pago con las cuotas preseleccionadas', async () => {
    const { navigate } = await render('PAY_IN_INSTALLMENTS', [action('PAY_IN_INSTALLMENTS')]);
    expect(navigate).toHaveBeenCalledWith(['/pago'], {
      replaceUrl: true,
      queryParams: { oferta: 'o1', cuotas: '1' },
    });
  });

  it('Moodle: con el correo en la lista, vincula y entra al aula', async () => {
    const { http, navigate } = await render('ACTIVATE_MOODLE_ACCESS', [
      action('ACTIVATE_MOODLE_ACCESS'),
    ]);
    const link = http.expectOne(`${API}/me/moodle-access/link`);
    expect(link.request.method).toBe('POST');
    link.flush({ found: true, linked: [{ enrollmentId: 'e1', offer: { id: 'o1' } }] });
    await new Promise((r) => setTimeout(r));
    expect(navigate).toHaveBeenCalledWith(['/formacion/aula', 'o1'], { replaceUrl: true });
  });

  it('Moodle: sin el correo en la lista, pide el código y con él entra al aula', async () => {
    const { fixture, http, navigate, host } = await render('ACTIVATE_MOODLE_ACCESS', [
      action('ACTIVATE_MOODLE_ACCESS'),
    ]);
    http.expectOne(`${API}/me/moodle-access/link`).flush({ found: false, linked: [] });
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
    expect(host.textContent).toContain('No encontramos una inscripción asociada a tu correo');
    expect(navigate).not.toHaveBeenCalled();

    const input = host.querySelector<HTMLInputElement>('#moodle-code')!;
    input.value = 'k7qm 3xpa';
    input.dispatchEvent(new Event('input'));
    host.querySelector<HTMLFormElement>('form.code')!.dispatchEvent(new Event('submit'));
    const redeem = http.expectOne(`${API}/me/moodle-access/redeem`);
    expect(redeem.request.body).toEqual({ code: 'K7QM-3XPA' });
    redeem.flush({ found: true, linked: [{ enrollmentId: 'e1', offer: { id: 'o1' } }] });
    await new Promise((r) => setTimeout(r));
    expect(navigate).toHaveBeenCalledWith(['/formacion/aula', 'o1'], { replaceUrl: true });
  });

  it('acción deshabilitada: explica el motivo', async () => {
    const { fixture, host } = await render('ENROLL_AND_PAY', [
      action('ENROLL_AND_PAY', { enabled: false, reason: 'SOLD_OUT' }),
    ]);
    await fixture.whenStable();
    expect(host.querySelector('.card__title')?.textContent?.trim()).toBe(
      'Esta acción no está disponible',
    );
    expect(host.querySelector('.card__text')?.textContent?.trim()).toBe('El cupo está agotado.');
  });
});
