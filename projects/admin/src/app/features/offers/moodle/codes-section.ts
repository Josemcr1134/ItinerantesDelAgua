import { Component, inject, input, signal } from '@angular/core';
import { AccessCodeDto, AdminMoodleApi } from 'data-access';
import { FilterOption, FilterSelect } from '../../../shared/filters/filter-select';
import { formatDateTime } from '../../../shared/format/format';
import { listController } from '../../../shared/list/list-controller';
import { ListStates } from '../../../shared/list/list-states';
import { Pagination } from '../../../shared/list/pagination';
import { formatOfferDate } from '../shared/zoned-time';

type Flag = 'true' | 'false';

/** Códigos de acceso generados: pista, vencimiento y quién lo canjeó. */
@Component({
  selector: 'adm-codes-section',
  imports: [FilterSelect, ListStates, Pagination],
  templateUrl: './codes-section.html',
  styleUrl: './moodle-page.scss',
})
export class CodesSection {
  readonly offerId = input.required<string>();

  private readonly api = inject(AdminMoodleApi);
  protected readonly formatDateTime = formatDateTime;
  protected readonly formatDate = formatOfferDate;

  protected readonly used = signal<Flag | ''>('');
  protected readonly usedOptions: FilterOption<Flag>[] = [
    { value: 'false', label: 'Disponibles' },
    { value: 'true', label: 'Canjeados' },
  ];
  // La API de códigos no tiene búsqueda: no se envía `q`.
  protected readonly codes = listController({
    fetch: ({ q: _q, used, ...query }) =>
      this.api.codes(this.offerId(), {
        ...query,
        used: used === undefined ? undefined : used === 'true',
      }),
    filters: () => ({ used: this.used() }),
  });

  reload(): void {
    this.codes.reload();
  }

  /** Solo se guardan los últimos 4 caracteres: "••••-AB12". */
  protected codeLabel(code: AccessCodeDto): string {
    return `••••-${code.hint}`;
  }
}
