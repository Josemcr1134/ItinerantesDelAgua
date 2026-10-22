import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FilterSelect, optionsFrom } from './filter-select';

type Color = 'RED' | 'BLUE';

@Component({
  imports: [FilterSelect],
  template: `<adm-filter-select
    inputId="color"
    label="Color"
    allLabel="Todos"
    [options]="options"
    [(value)]="color"
  />`,
})
class Host {
  readonly options = optionsFrom<Color>(['RED', 'BLUE'], { RED: 'Rojo', BLUE: 'Azul' });
  readonly color = signal<Color | ''>('');
}

describe('FilterSelect', () => {
  it('muestra "todos" y actualiza la signal tipada en ambos sentidos', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const select = (fixture.nativeElement as HTMLElement).querySelector<HTMLSelectElement>(
      '#color',
    )!;
    expect([...select.options].map((o) => o.textContent?.trim())).toEqual([
      'Todos',
      'Rojo',
      'Azul',
    ]);

    select.value = 'BLUE';
    select.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.color()).toBe('BLUE');

    fixture.componentInstance.color.set('RED');
    await fixture.whenStable();
    expect(select.value).toBe('RED');
  });
});
