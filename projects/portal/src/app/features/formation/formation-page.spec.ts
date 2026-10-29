import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAuth } from 'auth';
import { apiErrorInterceptor, provideApi } from 'data-access';
import { PageHeading } from '../../core/page-heading/page-heading';
import { formationPath } from './formation-options';
import FormationPage from './formation-page';

const API = 'https://api.test/api/v1';
const card = (id: string, name: string, extra: object = {}) => ({
  enrollmentId: id,
  status: 'ACTIVE',
  phase: 'ACTIVE',
  origin: 'NAS',
  canContinue: true,
  offer: { id: 'o-' + id, slug: id, name, type: 'DIPLOMA', coverImageUrl: null },
  progress: { percent: 50 },
  ...extra,
});

describe('FormationPage', () => {
  async function render(inputs: { tipo: string; estado?: string }) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ platformName: 'Portal' }),
      ],
    });
    const fixture = TestBed.createComponent(FormationPage);
    for (const [key, value] of Object.entries(inputs)) fixture.componentRef.setInput(key, value);
    TestBed.tick();
    const http = TestBed.inject(HttpTestingController);
    return { fixture, http, host: fixture.nativeElement as HTMLElement };
  }

  it('pide el tipo y la pestaña del menú y pone el encabezado', async () => {
    const { fixture, http, host } = await render({ tipo: 'cursos', estado: 'completados' });
    const request = http.expectOne((r) => r.url === `${API}/me/enrollments`);
    expect(request.request.params.getAll('type')).toEqual(['COURSE']);
    expect(request.request.params.get('phase')).toBe('COMPLETED');
    request.flush({ data: [], meta: { page: 1, pageSize: 12, total: 0, totalPages: 0 } });
    await fixture.whenStable();

    expect(TestBed.inject(PageHeading).current()).toEqual({
      title: 'Formación',
      subtitle: 'Cursos en los que estoy inscrito',
    });
    expect(host.querySelector('.tab--active')?.textContent?.trim()).toBe('Completados');
    expect(host.querySelector('.empty')?.textContent).toContain('No tienes cursos completados.');
  });

  it('muestra las tarjetas; sin acceso, [Continuar] queda deshabilitado', async () => {
    const { fixture, http, host } = await render({ tipo: 'diplomados' });
    const request = http.expectOne((r) => r.url === `${API}/me/enrollments`);
    expect(request.request.params.get('phase')).toBe('ACTIVE');
    request.flush({
      data: [
        card('e1', 'Diplomado en Ecotecnologías'),
        card('e2', 'Diplomado suspendido', { status: 'SUSPENDED', canContinue: false }),
      ],
      meta: { page: 1, pageSize: 12, total: 2, totalPages: 1 },
    });
    await fixture.whenStable();

    const titles = [...host.querySelectorAll('.card__title')].map((t) => t.textContent?.trim());
    expect(titles).toEqual(['Diplomado en Ecotecnologías', 'Diplomado suspendido']);
    expect(host.querySelector<HTMLAnchorElement>('a.card__action')?.getAttribute('href')).toBe(
      '/formacion/aula/o-e1',
    );
    expect(host.querySelector<HTMLButtonElement>('button.card__action')?.disabled).toBe(true);
    expect(host.textContent).toContain('Acceso suspendido');
    expect(
      [...host.querySelectorAll('.progress__value')].map((v) => v.textContent?.trim()),
    ).toEqual(['50%', '50%']);
  });

  it('Eventos: pide solo los eventos inscritos y es la pestaña de vuelta de un evento', async () => {
    const { fixture, http, host } = await render({ tipo: 'eventos' });
    const request = http.expectOne((r) => r.url === `${API}/me/enrollments`);
    expect(request.request.params.getAll('type')).toEqual(['EVENT']);
    request.flush({
      data: [
        card('e1', 'Foro del Agua', {
          offer: {
            id: 'o-e1',
            slug: 'foro',
            name: 'Foro del Agua',
            type: 'EVENT',
            coverImageUrl: null,
          },
        }),
      ],
      meta: { page: 1, pageSize: 12, total: 1, totalPages: 1 },
    });
    await fixture.whenStable();

    expect(TestBed.inject(PageHeading).current().subtitle).toBe(
      'Eventos en los que estoy inscrito',
    );
    expect(host.textContent).toContain('Foro del Agua');
    expect(formationPath('EVENT')).toBe('/formacion/eventos');
  });

  it('al salir de la página el encabezado vuelve al de la Escuela', async () => {
    const { fixture } = await render({ tipo: 'talleres' });
    fixture.destroy();
    expect(TestBed.inject(PageHeading).current().title).toBe('Escuela Itinerante del Agua');
  });
});
