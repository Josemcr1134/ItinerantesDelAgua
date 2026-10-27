import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideAuth } from 'auth';
import { apiErrorInterceptor, provideApi } from 'data-access';
import NotificationsPage from './notifications-page';

const API = 'https://api.test/api/v1';
const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();
const notification = (id: string, extra: object = {}) => ({
  id,
  type: 'GENERAL',
  category: 'GENERAL',
  priority: 'NORMAL',
  pinned: false,
  title: `Aviso ${id}`,
  body: 'Texto del aviso',
  action: null,
  data: null,
  read: false,
  readAt: null,
  createdAt: ago(5),
  ...extra,
});

describe('NotificationsPage', () => {
  // A mediodía (hora local): "hace 5 min" siempre cae en "Hoy", aunque las
  // pruebas corran justo después de medianoche. Solo se congela la fecha.
  beforeEach(() => {
    const noon = new Date();
    noon.setHours(12, 0, 0, 0);
    vi.useFakeTimers({ toFake: ['Date'], now: noon });
  });
  afterEach(() => vi.useRealTimers());

  async function render(inputs: Record<string, string> = {}) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ platformName: 'Portal' }),
      ],
    });
    const fixture = TestBed.createComponent(NotificationsPage);
    for (const [name, value] of Object.entries(inputs)) fixture.componentRef.setInput(name, value);
    TestBed.tick();
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(`${API}/me/notifications/unread-count`).flush({ unread: 2, pinned: 1 });
    return { fixture, http, host: fixture.nativeElement as HTMLElement };
  }

  it('resume las no leídas y agrupa: importantes primero y luego por día', async () => {
    const { fixture, http, host } = await render();
    http.expectOne(`${API}/me/notifications?page=1&pageSize=20`).flush({
      data: [
        notification('p', {
          category: 'PAYMENTS',
          pinned: true,
          priority: 'HIGH',
          title: 'No pudimos cobrar tu cuota',
          createdAt: ago(60 * 24 * 10),
        }),
        notification('a', {
          category: 'APPLICATIONS',
          title: 'Tu beca fue aprobada',
          action: { label: 'Ver mi postulación', path: '/portal/postulaciones/a1' },
        }),
        notification('b', { read: true, readAt: ago(1) }),
      ],
      meta: { page: 1, pageSize: 20, total: 3, totalPages: 1 },
    });
    await fixture.whenStable();

    expect(host.querySelector('.hero__title')?.textContent?.trim()).toBe(
      'Tienes 2 avisos sin leer',
    );
    const groups = [...host.querySelectorAll('.group__title')].map((g) => g.textContent?.trim());
    expect(groups).toEqual(['Importantes', 'Hoy']);
    expect(host.querySelector('.item--pinned .item__flag')?.textContent?.trim()).toBe('Importante');
    expect(host.querySelectorAll('.item__dot')).toHaveLength(2);
    expect(host.querySelector('.more')).toBeNull();

    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    host.querySelector<HTMLButtonElement>('.item__action')!.click();
    http.expectOne(`${API}/me/notifications/a/read`).flush(notification('a', { read: true }));
    await new Promise((r) => setTimeout(r));
    expect(navigate).toHaveBeenCalledWith('/postulaciones/a1');
    await fixture.whenStable();
    expect(host.querySelectorAll('.item__dot')).toHaveLength(1);
  });

  it('filtra por grupo y sin leer, con su estado vacío ilustrado', async () => {
    const { fixture, http, host } = await render({ categoria: 'pagos', estado: 'no-leidas' });
    http
      .expectOne(`${API}/me/notifications?page=1&pageSize=20&category=PAYMENTS&unread=true`)
      .flush({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 0 } });
    await fixture.whenStable();
    expect(host.querySelector('.chip--on')?.textContent?.trim()).toBe('Pagos');
    expect(host.querySelector('.switch')?.getAttribute('aria-checked')).toBe('true');
    expect(host.querySelector('.empty__title')?.textContent?.trim()).toBe(
      'No tienes avisos sin leer',
    );
    expect(host.querySelector('.empty__art')).not.toBeNull();
  });

  it('[Cargar más] suma la página siguiente a la lista', async () => {
    const { fixture, http, host } = await render();
    http.expectOne(`${API}/me/notifications?page=1&pageSize=20`).flush({
      data: [notification('a')],
      meta: { page: 1, pageSize: 20, total: 2, totalPages: 2 },
    });
    await fixture.whenStable();
    host.querySelector<HTMLButtonElement>('.more')!.click();
    TestBed.tick();
    http.expectOne(`${API}/me/notifications?page=2&pageSize=20`).flush({
      data: [notification('b', { createdAt: ago(10) })],
      meta: { page: 2, pageSize: 20, total: 2, totalPages: 2 },
    });
    await fixture.whenStable();
    const titles = [...host.querySelectorAll('.item__title')].map((t) =>
      t.textContent?.replace(/\s+/g, ' ').trim(),
    );
    expect(titles).toEqual(['Sin leer: Aviso a', 'Sin leer: Aviso b']);
    expect(host.querySelector('.more')).toBeNull();
  });
});
