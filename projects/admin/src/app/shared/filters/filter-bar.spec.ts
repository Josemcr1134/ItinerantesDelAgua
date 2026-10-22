import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FilterBar } from './filter-bar';
import { FilterSelect } from './filter-select';
import { SearchField } from './search-field';

@Component({
  imports: [FilterBar, FilterSelect, SearchField],
  template: `
    <adm-filter-bar label="Filtrar" [activeCount]="count()" (clear)="cleared = cleared + 1">
      <adm-search-field admFilterSearch inputId="q" [(value)]="q" />
      @if (withSelect) {
        <adm-filter-select
          inputId="color"
          label="Color"
          allLabel="Todos"
          [options]="options"
          [(value)]="color"
        />
      }
    </adm-filter-bar>
  `,
})
class Host {
  withSelect = true;
  readonly q = signal('');
  readonly color = signal<'RED' | ''>('');
  readonly count = signal(0);
  readonly options = [{ value: 'RED' as const, label: 'Rojo' }];
  cleared = 0;
}

describe('FilterBar', () => {
  async function setup(withSelect = true) {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.withSelect = withSelect;
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    return { fixture, host, toggle: () => host.querySelector<HTMLButtonElement>('.bar__toggle') };
  }

  it('pliega los filtros tras "Filtros" y deja la búsqueda a la vista', async () => {
    const { fixture, host, toggle } = await setup();
    expect(host.querySelector('#q')).not.toBeNull();
    const panel = host.querySelector('.bar__filters')!;
    expect(toggle()!.getAttribute('aria-controls')).toBe(panel.id);
    expect(toggle()!.getAttribute('aria-expanded')).toBe('false');
    expect(panel.classList).not.toContain('bar__filters--open');

    toggle()!.click();
    await fixture.whenStable();
    expect(toggle()!.getAttribute('aria-expanded')).toBe('true');
    expect(panel.classList).toContain('bar__filters--open');
  });

  it('muestra cuántos filtros hay aplicados y permite limpiarlos', async () => {
    const { fixture, host, toggle } = await setup();
    expect(host.querySelector('.bar__clear')).toBeNull();
    fixture.componentInstance.count.set(2);
    await fixture.whenStable();
    expect(toggle()!.textContent?.replace(/\s+/g, ' ').trim()).toBe('Filtros 2 aplicados');
    host.querySelector<HTMLButtonElement>('.bar__clear')!.click();
    expect(fixture.componentInstance.cleared).toBe(1);
  });

  it('sin filtros además de la búsqueda, no muestra el botón', async () => {
    const { host, toggle } = await setup(false);
    expect(toggle()).toBeNull();
    expect(host.querySelector('.bar__filters')).toBeNull();
    expect(host.querySelector('#q')).not.toBeNull();
  });
});
