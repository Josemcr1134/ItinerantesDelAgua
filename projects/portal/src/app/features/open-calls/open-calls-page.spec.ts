import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideAuth } from 'auth';
import { apiErrorInterceptor, provideApi } from 'data-access';
import OpenCallsPage from './open-calls-page';

const API = 'https://api.test/api/v1';
const opportunity = (id: string, name: string, extra: object = {}) => ({
  kind: 'OPEN_CALL',
  offer: {
    id,
    name,
    modality: 'IN_PERSON',
    startsAt: null,
    endsAt: null,
    venue: null,
    cohortLabel: null,
  },
  window: { state: 'OPEN', opensAt: null, closesAt: '2027-02-01T05:59:00.000Z', reason: null },
  price: null,
  eligibility: { text: 'Mujeres lideresas', requiresTravel: true },
  myApplication: null,
  canApply: true,
  enrolled: false,
  ...extra,
});

describe('OpenCallsPage', () => {
  async function render() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ platformName: 'Portal' }),
      ],
    });
    const fixture = TestBed.createComponent(OpenCallsPage);
    TestBed.tick();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${API}/me/applications/opportunities?kind=OPEN_CALL`).flush({
      data: [
        opportunity('o1', 'Aprendices del Agua'),
        opportunity('o2', 'Siembra de Agua', {
          canApply: false,
          myApplication: { id: 'a2', status: 'SUBMITTED', folio: 'CONV-1' },
        }),
      ],
    });
    await fixture.whenStable();
    return { fixture, http, host: fixture.nativeElement as HTMLElement };
  }

  it('lista las convocatorias abiertas con su acción', async () => {
    const { host } = await render();
    expect(host.querySelector('.tab--on')?.textContent?.trim()).toBe('Convocatorias abiertas (2)');
    const actions = [...host.querySelectorAll('.card__action')].map((a) => a.textContent?.trim());
    expect(actions).toEqual(['Ver y postular', 'Ver mi postulación']);
    expect(host.textContent).toContain('Mi postulación: Enviada');
  });

  it('[Ver y postular] crea el borrador y lo abre debajo', async () => {
    const { fixture, http, host } = await render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    host.querySelector<HTMLButtonElement>('.card__action')!.click();
    const create = http.expectOne(`${API}/me/applications`);
    expect(create.request.body).toEqual({ offerId: 'o1' });
    create.flush({ id: 'a1' });
    await new Promise((r) => setTimeout(r));
    TestBed.tick();
    // La lista se vuelve a pedir (la convocatoria ya tiene borrador).
    http.expectOne(`${API}/me/applications/opportunities?kind=OPEN_CALL`).flush({ data: [] });
    await fixture.whenStable();
    expect(navigate.mock.calls[0][1]).toMatchObject({ queryParams: { postulacion: 'a1' } });
  });
});
