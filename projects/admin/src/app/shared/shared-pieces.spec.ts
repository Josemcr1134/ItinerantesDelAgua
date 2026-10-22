import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ApiError, Paginated } from 'data-access';
import { AlertService } from 'ui-kit';
import { Subject } from 'rxjs';
import { remoteSearch } from './list/remote-search';
import { rowActions } from './list/row-actions';
import { Person } from './person/person';
import { RequestState } from './request-state/request-state';

const settle = () => new Promise((r) => setTimeout(r, 5));

@Component({ template: '' })
class SearchHost {
  readonly queries: string[] = [];
  readonly response = new Subject<Paginated<{ id: string }>>();
  readonly search = remoteSearch({
    fetch: (q) => (this.queries.push(q), this.response),
    minLength: 3,
    debounceMs: 0,
  });
}

@Component({ template: '' })
class RowsHost {
  readonly rows = rowActions();
}

@Component({
  imports: [Person, RequestState],
  template: `
    <adm-person name="Laura Pérez" detail="laura@x.org"><span class="tag">Tú</span></adm-person>
    <adm-request-state
      [error]="error()"
      [loaded]="loaded()"
      loadingText="Cargando la oferta…"
      (retry)="retries = retries + 1"
    >
      <p class="content">Contenido</p>
    </adm-request-state>
  `,
})
class ViewHost {
  readonly error = signal<ApiError | null>(null);
  readonly loaded = signal(false);
  retries = 0;
}

describe('piezas compartidas del panel', () => {
  let confirmAnswer = true;
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AlertService,
          useValue: {
            confirm: () => Promise.resolve(confirmAnswer),
            open: () => Promise.resolve(true),
          },
        },
      ],
    }),
  );

  it('remoteSearch: busca desde el mínimo de caracteres y se reinicia', async () => {
    const fixture = TestBed.createComponent(SearchHost);
    const { search, queries, response } = fixture.componentInstance;
    search.searchText.set('la');
    await settle();
    expect(search.active()).toBe(false);
    expect(queries).toEqual([]);

    search.searchText.set('  lau ');
    await settle();
    expect(queries).toEqual(['lau']);
    expect(search.loaded()).toBe(false);
    response.next({ data: [{ id: '1' }], meta: { page: 1, pageSize: 8, total: 1, totalPages: 1 } });
    expect(search.results()).toEqual([{ id: '1' }]);

    search.reset();
    await settle();
    expect(search.searchText()).toBe('');
    expect(search.results()).toEqual([]);
  });

  it('rowActions.confirmRun: no ejecuta si se cancela y marca la fila mientras corre', async () => {
    const { rows } = TestBed.createComponent(RowsHost).componentInstance;
    const confirm = { title: '¿Borrar?', message: '…', confirmLabel: 'Borrar' };
    let ran = false;
    confirmAnswer = false;
    expect(await rows.confirmRun('r1', confirm, async () => (ran = true))).toBeNull();
    expect(ran).toBe(false);

    confirmAnswer = true;
    let busyDuring = false;
    const result = await rows.confirmRun('r1', confirm, async () => {
      busyDuring = rows.isBusy('r1');
      return 'ok';
    });
    expect(result).toBe('ok');
    expect(busyDuring).toBe(true);
    expect(rows.isBusy('r1')).toBe(false);
  });

  it('adm-person y adm-request-state', async () => {
    const fixture = TestBed.createComponent(ViewHost);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('adm-person')?.textContent).toContain('Laura PérezTú');
    expect(host.querySelector('adm-person')?.textContent).toContain('laura@x.org');
    expect(host.querySelector('adm-avatar')?.textContent?.trim()).toBe('L');

    expect(host.textContent).toContain('Cargando la oferta…');
    expect(host.querySelector('.content')).toBeNull();

    fixture.componentInstance.error.set(
      new ApiError('network', 0, 'NETWORK_ERROR', 'Sin conexión.'),
    );
    await fixture.whenStable();
    host.querySelector<HTMLButtonElement>('[role="alert"] button')!.click();
    expect(fixture.componentInstance.retries).toBe(1);

    fixture.componentInstance.loaded.set(true);
    await fixture.whenStable();
    expect(host.querySelector('.content')).not.toBeNull();
    expect(host.querySelector('[role="alert"]')).toBeNull();
  });
});
