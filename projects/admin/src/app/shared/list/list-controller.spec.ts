import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Paginated } from 'data-access';
import { Subject } from 'rxjs';
import { CleanFilters, listController, ListQuery } from './list-controller';
import { moveItem, removeAt } from './reorder';

interface Item {
  readonly id: string;
  readonly name: string;
}
type Filters = { role: string; sort: string };

const page = (data: Item[], pageNumber = 1): Paginated<Item> => ({
  data,
  meta: { page: pageNumber, pageSize: 20, total: data.length, totalPages: 3 },
});

@Component({ template: '' })
class Host {
  readonly calls: (CleanFilters<Filters> & ListQuery)[] = [];
  readonly responses: Subject<Paginated<Item>>[] = [];
  readonly role = signal('');
  readonly list = listController<Item, Filters>({
    fetch: (query) => {
      this.calls.push(query);
      const response = new Subject<Paginated<Item>>();
      this.responses.push(response);
      return response;
    },
    filters: () => ({ role: this.role(), sort: 'NAME_ASC' }),
    notFilters: ['sort'],
    debounceMs: 0,
  });
}

describe('listController', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = fixture.componentInstance;
    const settle = async () => {
      await new Promise((r) => setTimeout(r, 5));
      await fixture.whenStable();
    };
    return { host, settle };
  }

  it('pide la primera página sin enviar filtros vacíos', async () => {
    const { host } = await setup();
    expect(host.calls).toEqual([{ sort: 'NAME_ASC', page: 1, pageSize: 20, q: undefined }]);
    expect(host.list.hasFilters()).toBe(false);
    expect(host.list.loaded()).toBe(false);

    host.responses[0].next(page([{ id: '1', name: 'Ana' }]));
    host.responses[0].complete();
    expect(host.list.items()).toEqual([{ id: '1', name: 'Ana' }]);
    expect(host.list.loaded()).toBe(true);
  });

  it('al filtrar vuelve a la página 1 con una sola petición', async () => {
    const { host, settle } = await setup();
    host.list.page.set(3);
    await settle();
    expect(host.calls.at(-1)?.page).toBe(3);

    const before = host.calls.length;
    host.role.set('FINANCE');
    await settle();
    expect(host.calls.length).toBe(before + 1);
    expect(host.calls.at(-1)).toMatchObject({ role: 'FINANCE', page: 1 });
    expect(host.list.page()).toBe(1);
    expect(host.list.hasFilters()).toBe(true);
  });

  it('la búsqueda cuenta como filtro y se envía recortada', async () => {
    const { host, settle } = await setup();
    host.list.searchText.set('  laura ');
    await settle();
    expect(host.calls.at(-1)).toMatchObject({ q: 'laura', page: 1 });
    expect(host.list.hasFilters()).toBe(true);
    host.list.clearSearch();
    await settle();
    expect(host.list.hasFilters()).toBe(false);
  });

  it('reemplaza un elemento sin volver a pedir la lista', async () => {
    const { host } = await setup();
    host.responses[0].next(
      page([
        { id: '1', name: 'Ana' },
        { id: '2', name: 'Luis' },
      ]),
    );
    host.responses[0].complete();
    const calls = host.calls.length;
    host.list.replace((i) => i.id === '2', { id: '2', name: 'Luis R.' });
    expect(host.list.items().map((i) => i.name)).toEqual(['Ana', 'Luis R.']);
    expect(host.calls.length).toBe(calls);
  });
});

describe('reorder', () => {
  it('mueve dentro de los límites y quita por posición', () => {
    expect(moveItem(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
    expect(moveItem(['a', 'b', 'c'], 2, 1)).toEqual(['a', 'b', 'c']);
    expect(removeAt(['a', 'b', 'c'], 1)).toEqual(['a', 'c']);
  });
});
