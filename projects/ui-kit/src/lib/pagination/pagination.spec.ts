import { TestBed } from '@angular/core/testing';
import { Pagination, PaginationMeta } from './pagination';

describe('Pagination', () => {
  async function render(meta: PaginationMeta, numbered = false) {
    const fixture = TestBed.createComponent(Pagination);
    fixture.componentRef.setInput('meta', meta);
    fixture.componentRef.setInput('page', meta.page);
    fixture.componentRef.setInput('noun', ['oferta', 'ofertas']);
    fixture.componentRef.setInput('numbered', numbered);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const numbers = () =>
      [...host.querySelectorAll('.ui-pagination__pages li')].map((li) => li.textContent?.trim());
    return { fixture, host, numbers };
  }

  it('muestra el total, la página y Anterior / Siguiente', async () => {
    const { fixture, host } = await render({ page: 1, total: 30, totalPages: 4 });
    expect(
      host.querySelector('.ui-pagination__info')?.textContent?.replace(/\s+/g, ' ').trim(),
    ).toBe('30 ofertas · Página 1 de 4');
    const [previous, next] = host.querySelectorAll<HTMLButtonElement>('.ui-pagination__button');
    expect(previous.disabled).toBe(true);
    expect(host.querySelector('.ui-pagination__pages')).toBeNull();
    next.click();
    expect(fixture.componentInstance.page()).toBe(2);
  });

  it('numerada: primera, última y vecinas de la actual, con "…" en los huecos', async () => {
    expect((await render({ page: 1, total: 16, totalPages: 2 }, true)).numbers()).toEqual([
      '1',
      '2',
    ]);
    TestBed.resetTestingModule();
    expect((await render({ page: 5, total: 80, totalPages: 10 }, true)).numbers()).toEqual([
      '1',
      '…',
      '4',
      '5',
      '6',
      '…',
      '10',
    ]);
    TestBed.resetTestingModule();
    // Un solo número saltado se muestra en vez de "…".
    expect((await render({ page: 4, total: 48, totalPages: 6 }, true)).numbers()).toEqual([
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
    ]);
  });

  it('numerada: marca la actual y va a la página elegida', async () => {
    const { fixture, host } = await render({ page: 2, total: 24, totalPages: 3 }, true);
    const current = host.querySelector('[aria-current="page"]');
    expect(current?.textContent?.trim()).toBe('2');
    host.querySelector<HTMLButtonElement>('[aria-label="Página 3"]')!.click();
    expect(fixture.componentInstance.page()).toBe(3);
  });
});
