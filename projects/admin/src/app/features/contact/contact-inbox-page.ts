import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AdminContactApi,
  CONTACT_STATUS_VALUES,
  CONTACT_SUBJECT_VALUES,
  ContactMessageSort,
  ContactStatus,
  ContactSubject,
} from 'data-access';
import { Pagination } from 'ui-kit';
import { FilterBar } from '../../shared/filters/filter-bar';
import { FilterDate } from '../../shared/filters/filter-date';
import { FilterOption, FilterSelect, optionsFrom } from '../../shared/filters/filter-select';
import { SearchField } from '../../shared/filters/search-field';
import { dayEndIso, dayStartIso } from '../../shared/format/date-range';
import { formatDateTime } from '../../shared/format/format';
import { listController } from '../../shared/list/list-controller';
import { ListStates } from '../../shared/list/list-states';
import { PageHeader } from '../../shared/page-header/page-header';
import { Person } from '../../shared/person/person';
import {
  CONTACT_STATUS_LABELS,
  CONTACT_STATUS_TONES,
  CONTACT_SUBJECT_LABELS,
} from './contact-labels';
import { ContactInbox } from './contact-inbox';

/**
 * Mensajes (HU-38 / HU-01): bandeja del formulario de contacto de la landing,
 * con pestañas por estado (`?estado=`), búsqueda y filtros. Hoy todos llegan
 * con origen `LANDING`, por eso no se filtra por origen.
 */
@Component({
  selector: 'adm-contact-inbox-page',
  imports: [
    RouterLink,
    PageHeader,
    FilterBar,
    FilterSelect,
    FilterDate,
    SearchField,
    ListStates,
    Pagination,
    Person,
  ],
  templateUrl: './contact-inbox-page.html',
  styleUrl: './contact-inbox-page.scss',
})
export default class ContactInboxPage implements OnInit {
  /** `?estado=NEW|IN_PROGRESS|ANSWERED|ARCHIVED` (sin él, todos). */
  readonly estado = input<string>();

  private readonly api = inject(AdminContactApi);
  protected readonly inbox = inject(ContactInbox);

  protected readonly statusTones = CONTACT_STATUS_TONES;
  protected readonly formatDateTime = formatDateTime;

  protected readonly status = computed<ContactStatus | ''>(() => {
    const estado = this.estado();
    return CONTACT_STATUS_VALUES.find((s) => s === estado) ?? '';
  });

  /** Pestañas con el total de cada estado (nombre de la API si ya cargó). */
  protected readonly tabs = computed(() => {
    const byStatus = this.inbox.summary()?.byStatus ?? [];
    return [
      { status: '' as const, label: 'Todos', count: 0 },
      ...CONTACT_STATUS_VALUES.map((status) => ({
        status,
        label: byStatus.find((s) => s.status === status)?.label ?? CONTACT_STATUS_LABELS[status],
        count: this.inbox.count(status),
      })),
    ];
  });

  protected readonly subject = signal<ContactSubject | ''>('');
  protected readonly from = signal('');
  protected readonly to = signal('');
  protected readonly sort = signal<ContactMessageSort>('CREATED_DESC');

  protected readonly options = {
    subject: optionsFrom(CONTACT_SUBJECT_VALUES, CONTACT_SUBJECT_LABELS),
    sort: [
      { value: 'CREATED_DESC', label: 'Más recientes' },
      { value: 'CREATED_ASC', label: 'Más antiguos' },
    ] as FilterOption<ContactMessageSort>[],
  };

  protected readonly list = listController({
    fetch: ({ from, to, ...query }) =>
      this.api.list({
        ...query,
        from: from ? dayStartIso(from) : undefined,
        to: to ? dayEndIso(to) : undefined,
      }),
    filters: () => ({
      status: this.status(),
      subject: this.subject(),
      from: this.from(),
      to: this.to(),
      sort: this.sort(),
    }),
    // La pestaña no cuenta como filtro: "Limpiar" no la cambia.
    notFilters: ['status', 'sort'],
  });

  ngOnInit(): void {
    this.inbox.refresh();
  }

  protected clearFilters(): void {
    this.list.clearSearch();
    this.subject.set('');
    this.from.set('');
    this.to.set('');
  }
}
