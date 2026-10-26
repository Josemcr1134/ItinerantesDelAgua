import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideAuth } from 'auth';
import { apiErrorInterceptor, provideApi } from 'data-access';
import ScholarshipsPage from './scholarships-page';

const API = 'https://api.test/api/v1';
const OPPORTUNITIES = `${API}/me/applications/opportunities?kind=SCHOLARSHIP`;
const MINE = `${API}/me/applications?kind=SCHOLARSHIP&pageSize=50`;

const type = (id: string, name: string, min: number, max = min) => ({
  scholarshipTypeId: id,
  scholarshipType: {
    id,
    key: id,
    name,
    minPercent: min,
    maxPercent: max,
    requiresInterview: false,
  },
  estimatedBalance: null,
  availableRecipients: null,
  isFull: false,
});
const opportunity = {
  kind: 'SCHOLARSHIP',
  offer: {
    id: 'o1',
    name: 'Diplomado en Ecotecnologías del Agua',
    modality: 'ONLINE_LIVE',
    cohortLabel: '2027-1',
    startsAt: null,
    endsAt: null,
    venue: null,
  },
  window: { state: 'OPEN', opensAt: null, closesAt: null, reason: null },
  price: { amountCents: 58500, currency: 'USD' },
  scholarshipTypes: [type('t1', 'Agua Viva', 10), type('t5', 'Beca especial', 71, 80)],
  eligibility: null,
  myApplication: null,
  canApply: true,
  enrolled: false,
};
const card = (id: string, status: string, folio: string) => ({
  id,
  folio,
  kind: 'SCHOLARSHIP',
  status,
  offer: { id: `o-${id}`, name: `Diplomado ${id}`, cohortLabel: '2026-1' },
  submittedAt: '2026-12-02T15:00:00.000Z',
  updatedAt: '2026-12-02T15:00:00.000Z',
  requiresAction: false,
  action: { type: 'VIEW', enabled: true, reason: null, dueAt: null },
  timeline: [],
  interview: null,
  scholarshipResult: null,
  response: null,
});

describe('ScholarshipsPage', () => {
  async function render(pestana?: string) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ platformName: 'Portal' }),
      ],
    });
    const fixture = TestBed.createComponent(ScholarshipsPage);
    if (pestana) fixture.componentRef.setInput('pestana', pestana);
    TestBed.tick();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(MINE).flush({
      data: [
        card('a1', 'IN_REVIEW', 'BEC-2027-0142'),
        card('a2', 'NOT_SELECTED', 'BEC-2026-0077'),
        card('a3', 'EXPIRED', 'BEC-2026-0102'),
      ],
      meta: { page: 1, pageSize: 50, total: 3, totalPages: 1 },
    });
    if (!pestana) http.expectOne(OPPORTUNITIES).flush({ data: [opportunity] });
    await fixture.whenStable();
    return { fixture, http, host: fixture.nativeElement as HTMLElement };
  }

  it('muestra las becas disponibles con su rango y el total de mis postulaciones', async () => {
    const { host } = await render();
    const tabs = [...host.querySelectorAll('.tab')].map((t) => t.textContent?.trim());
    expect(tabs).toEqual(['Becas disponibles', 'Mis postulaciones (3)']);
    expect(host.querySelector('.pill--scholarship')?.textContent?.trim()).toBe('Beca 10%–80%');
    expect(host.querySelector('.card__action')?.textContent?.trim()).toBe('Postularme');
  });

  it('[Postularme] crea el borrador y abre el formulario', async () => {
    const { http, host } = await render();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    host.querySelector<HTMLButtonElement>('.card__action')!.click();
    const create = http.expectOne(`${API}/me/applications`);
    expect(create.request.body).toEqual({ offerId: 'o1' });
    create.flush({ id: 'a9' });
    await new Promise((r) => setTimeout(r));
    expect(navigate).toHaveBeenCalledWith(['/becas', 'a9']);
  });

  it('separa el seguimiento de las postulaciones cerradas y filtra por estado', async () => {
    const { fixture, host } = await render('postulaciones');
    expect(host.querySelectorAll('portal-scholarship-tracker')).toHaveLength(1);
    const rows = [...host.querySelectorAll('.history__table tbody tr')];
    expect(rows.map((r) => r.querySelector('[data-label="Folio"]')?.textContent?.trim())).toEqual([
      'BEC-2026-0077',
      'BEC-2026-0102',
    ]);
    expect(rows[1].querySelector('.badge')?.getAttribute('data-tone')).toBe('danger');
    const options = [...host.querySelectorAll('.filter option')].map((o) => o.textContent?.trim());
    expect(options).toEqual(['Todas', 'En revisión', 'No seleccionada', 'Vencida']);

    fixture.componentRef.setInput('estado', 'EXPIRED');
    await fixture.whenStable();
    expect(host.querySelectorAll('portal-scholarship-tracker')).toHaveLength(0);
    expect(host.querySelectorAll('.history__table tbody tr')).toHaveLength(1);
  });
});
