import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminSiteMetricDto, apiErrorInterceptor, provideApi } from 'data-access';
import { AlertService } from 'ui-kit';
import SitePage from './site-page';

const API = 'https://api.test/api/v1/admin/site/metrics';
const metric = (
  key: string,
  label: string,
  value: number,
  sortOrder: number,
  visible = true,
): AdminSiteMetricDto => ({
  key,
  label,
  value,
  prefix: '',
  suffix: '+',
  display: `${value.toLocaleString('es-MX')}+`,
  sortOrder,
  visible,
  updatedAt: '2026-10-22T12:00:00.000Z',
});

const tick = () => new Promise((r) => setTimeout(r));

describe('SitePage', () => {
  async function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        { provide: AlertService, useValue: { open: () => Promise.resolve(true) } },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(SitePage);
    await fixture.whenStable();
    http
      .expectOne(API)
      .flush([
        metric('YOUTH_TRAINED', 'Jóvenes formados', 300, 2, false),
        metric('PEOPLE_TRAINED', 'Personas formadas', 1950, 1),
      ]);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const rows = () => [...host.querySelectorAll<HTMLTableRowElement>('tbody tr')];
    const button = (text: string, root: ParentNode = host) =>
      [...root.querySelectorAll<HTMLButtonElement>('button')].find((b) =>
        b.textContent?.trim().startsWith(text),
      );
    return { fixture, http, host, rows, button };
  }

  it('lista las cifras en el orden de la landing, incluidas las ocultas', async () => {
    const { rows } = await setup();
    expect(rows().map((r) => r.querySelector('.metrics__value')?.textContent?.trim())).toEqual([
      '1,950+',
      '300+',
    ]);
    expect(rows()[1].querySelector('.adm-badge')?.textContent?.trim()).toBe('Oculta');
  });

  it('oculta o muestra una cifra con un PATCH de su visibilidad', async () => {
    const { fixture, http, host, rows, button } = await setup();
    button('Ocultar', rows()[0])!.click();
    await tick();
    const patch = http.expectOne(`${API}/PEOPLE_TRAINED`);
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual({ visible: false });
    patch.flush(metric('PEOPLE_TRAINED', 'Personas formadas', 1950, 1, false));
    await tick();
    await fixture.whenStable();

    expect(rows()[0].querySelector('.adm-badge')?.textContent?.trim()).toBe('Oculta');
    expect(button('Mostrar', rows()[0])).toBeDefined();
    expect(host.querySelector('.adm-notice')?.textContent).toContain(
      '«Personas formadas» ya no se muestra',
    );
  });

  it('al editar envía solo lo que cambió y reordena la lista', async () => {
    const { fixture, http, host, rows, button } = await setup();
    button('Editar', rows()[0])!.click();
    await fixture.whenStable();

    const value = host.querySelector<HTMLInputElement>('#metric-value')!;
    const order = host.querySelector<HTMLInputElement>('#metric-order')!;
    value.value = '2100';
    value.dispatchEvent(new Event('input'));
    order.value = '3';
    order.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(host.querySelector('.preview__value')?.textContent?.trim()).toBe('2,100+');

    host.querySelector<HTMLFormElement>('#metric-form')!.dispatchEvent(new Event('submit'));
    await tick();
    const patch = http.expectOne(`${API}/PEOPLE_TRAINED`);
    expect(patch.request.body).toEqual({ value: 2100, sortOrder: 3 });
    patch.flush(metric('PEOPLE_TRAINED', 'Personas formadas', 2100, 3));
    await tick();
    await fixture.whenStable();

    expect(rows().map((r) => r.querySelector('.metrics__value')?.textContent?.trim())).toEqual([
      '300+',
      '2,100+',
    ]);
    http.verify();
  });
});
