import { Component, computed, inject, input, output, signal } from '@angular/core';
import { AdminMoodleApi, RosterEntryDto } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { AdminAccess } from '../../../core/access/admin-access';
import { FilterBar } from '../../../shared/filters/filter-bar';
import { FilterOption, FilterSelect } from '../../../shared/filters/filter-select';
import { SearchField } from '../../../shared/filters/search-field';
import { formatDateTime } from '../../../shared/format/format';
import { listController } from '../../../shared/list/list-controller';
import { ListStates } from '../../../shared/list/list-states';
import { rowActions } from '../../../shared/list/row-actions';
import { formatOfferDate } from '../shared/zoned-time';
import { Pagination } from 'ui-kit';

type Flag = 'true' | 'false';

/** Lista de correos del curso en Moodle: vinculados o pendientes; quitar los pendientes. */
@Component({
  selector: 'adm-roster-section',
  imports: [FilterBar, FilterSelect, SearchField, ListStates, Pagination],
  templateUrl: './roster-section.html',
  styleUrl: './moodle-page.scss',
})
export class RosterSection {
  readonly offerId = input.required<string>();
  readonly notice = output<string>();

  private readonly api = inject(AdminMoodleApi);
  private readonly access = inject(AdminAccess);
  protected readonly canWrite = computed(() => this.access.can('offers.write'));
  protected readonly formatDateTime = formatDateTime;
  protected readonly formatDate = formatOfferDate;

  protected readonly linked = signal<Flag | ''>('');
  protected readonly linkedOptions: FilterOption<Flag>[] = [
    { value: 'true', label: 'Vinculados' },
    { value: 'false', label: 'Pendientes' },
  ];
  protected readonly roster = listController({
    fetch: ({ linked, ...query }) =>
      this.api.roster(this.offerId(), {
        ...query,
        linked: linked === undefined ? undefined : linked === 'true',
      }),
    filters: () => ({ linked: this.linked() }),
  });
  protected readonly rows = rowActions();

  reload(): void {
    this.roster.reload();
  }

  protected clearFilters(): void {
    this.roster.clearSearch();
    this.linked.set('');
  }

  protected async remove(entry: RosterEntryDto): Promise<void> {
    const done = await this.rows.confirmRun(
      entry.id,
      {
        title: '¿Quitar este correo?',
        message: `${entry.email} deja de estar en la lista; si se registra, ya no quedará inscrito.`,
        confirmLabel: 'Quitar',
        variant: 'error',
      },
      async () => {
        await firstValueFrom(this.api.removeEntry(this.offerId(), entry.id), {
          defaultValue: undefined,
        });
        return true;
      },
    );
    if (done) {
      this.notice.emit(`Se quitó ${entry.email} de la lista.`);
      this.roster.reload();
    }
  }
}
