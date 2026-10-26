import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideAuth } from 'auth';
import { apiErrorInterceptor, provideApi } from 'data-access';
import { PageHeading } from '../../core/page-heading/page-heading';
import LibraryPage from './library-page';

const API = 'https://api.test/api/v1';
const resource = (id: string, title: string, type: string) => ({
  id,
  title,
  type,
  author: null,
  thumbnailUrl: null,
  audience: 'ALL_REGISTERED',
  offer: null,
});

describe('LibraryPage', () => {
  async function render(tipo?: string) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ platformName: 'Portal' }),
      ],
    });
    const fixture = TestBed.createComponent(LibraryPage);
    if (tipo) fixture.componentRef.setInput('tipo', tipo);
    TestBed.tick();
    return {
      fixture,
      http: TestBed.inject(HttpTestingController),
      host: fixture.nativeElement as HTMLElement,
    };
  }

  it('lista los recursos con su tipo y pone el título "Biblioteca Digital"', async () => {
    const { fixture, http, host } = await render();
    const request = http.expectOne((r) => r.url === `${API}/library`);
    expect(request.request.params.has('type')).toBe(false);
    request.flush({
      data: [resource('r1', 'Manual de captación', 'PDF'), resource('r2', 'Agua libre', 'BOOK')],
      meta: { page: 1, pageSize: 18, total: 2, totalPages: 1 },
    });
    await fixture.whenStable();

    expect(TestBed.inject(PageHeading).current().title).toBe('Biblioteca Digital');
    expect(host.querySelector('.chip--active')?.textContent?.trim()).toBe('Todos');
    const labels = [...host.querySelectorAll('.card')].map((c) => c.getAttribute('aria-label'));
    expect(labels).toEqual(['Abrir Manual de captación (PDF)', 'Abrir Agua libre (Libro)']);
    const notes = [...host.querySelectorAll('.card__note')].map((n) => n.textContent?.trim());
    expect(notes).toEqual(['Sin autor', 'Sin autor']);
  });

  it('filtra por tipo y, sin resultados, ofrece limpiar el filtro', async () => {
    const { fixture, http, host } = await render('audio');
    const request = http.expectOne((r) => r.url === `${API}/library`);
    expect(request.request.params.getAll('type')).toEqual(['AUDIO']);
    request.flush({ data: [], meta: { page: 1, pageSize: 18, total: 0, totalPages: 0 } });
    await fixture.whenStable();

    expect(host.querySelector('.chip--active')?.textContent?.trim()).toBe('Audio');
    expect(host.textContent).toContain('No hay recursos de este tipo por ahora.');
    expect(host.querySelector('a.notice__action')?.textContent?.trim()).toBe('Limpiar filtros');
  });

  it('al tocar una tarjeta abre el recurso con su URL temporal', async () => {
    const { fixture, http, host } = await render();
    http
      .expectOne((r) => r.url === `${API}/library`)
      .flush({
        data: [resource('r1', 'Manual', 'PDF')],
        meta: { page: 1, pageSize: 18, total: 1, totalPages: 1 },
      });
    await fixture.whenStable();
    const tab = { opener: {}, location: { href: '' }, close: vi.fn() };
    vi.spyOn(window, 'open').mockReturnValue(tab as unknown as Window);

    host.querySelector<HTMLButtonElement>('.card')!.click();
    http
      .expectOne(`${API}/library/r1/access`)
      .flush({ kind: 'FILE', url: 'https://files.test/r1.pdf', expiresAt: null, fileName: null });
    await fixture.whenStable();
    expect(tab.location.href).toBe('https://files.test/r1.pdf');
    expect(tab.opener).toBeNull();
  });

  it('busca con ?q= al dejar de escribir y la API recibe el texto', async () => {
    const { fixture, http, host } = await render();
    http
      .expectOne((r) => r.url === `${API}/library`)
      .flush({ data: [], meta: { page: 1, pageSize: 18, total: 0, totalPages: 0 } });
    await fixture.whenStable();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const input = host.querySelector<HTMLInputElement>('#library-search')!;

    // Solo la escritura con reloj simulado (whenStable necesita el real).
    vi.useFakeTimers();
    try {
      for (const value of ['hu', 'hum', ' humedal ']) {
        input.value = value;
        input.dispatchEvent(new Event('input'));
        vi.advanceTimersByTime(100);
      }
      expect(navigate).not.toHaveBeenCalled();
      vi.advanceTimersByTime(400);
    } finally {
      vi.useRealTimers();
    }
    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate.mock.calls[0][1]).toMatchObject({
      queryParams: { q: 'humedal' },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });

    fixture.componentRef.setInput('q', 'humedal');
    TestBed.tick();
    const request = http.expectOne((r) => r.url === `${API}/library`);
    expect(request.request.params.get('q')).toBe('humedal');
    request.flush({ data: [], meta: { page: 1, pageSize: 18, total: 0, totalPages: 0 } });
    await fixture.whenStable();
    expect(host.textContent).toContain('No encontramos recursos para «humedal».');
  });
});
