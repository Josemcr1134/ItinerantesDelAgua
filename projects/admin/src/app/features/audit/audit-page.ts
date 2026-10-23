import { Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { AdminAuditApi, AdminUsersApi } from 'data-access';
import { catchError, map, of } from 'rxjs';
import { AdminAccess } from '../../core/access/admin-access';
import { FilterBar } from '../../shared/filters/filter-bar';
import { FilterDate } from '../../shared/filters/filter-date';
import { FilterSelect } from '../../shared/filters/filter-select';
import { SearchField } from '../../shared/filters/search-field';
import { dayEndIso, dayStartIso } from '../../shared/format/date-range';
import { formatDateTime } from '../../shared/format/format';
import { listController } from '../../shared/list/list-controller';
import { ListStates } from '../../shared/list/list-states';
import { Pagination } from '../../shared/list/pagination';
import { PageHeader } from '../../shared/page-header/page-header';
import { Person } from '../../shared/person/person';
import { AuditChanges } from './audit-changes';

/**
 * Auditoría: toda acción de escritura del panel, más reciente primero, con
 * quién, qué entidad y el antes/después. Filtra por acción (exacta o prefijo,
 * p. ej. `offer.`), integrante y fechas; con `?entidad=&entidadId=` muestra
 * el historial de una entidad. Requiere `audit.read`.
 */
@Component({
  selector: 'adm-audit-page',
  imports: [
    RouterLink,
    FilterBar,
    FilterDate,
    FilterSelect,
    SearchField,
    ListStates,
    Pagination,
    PageHeader,
    Person,
    AuditChanges,
  ],
  templateUrl: './audit-page.html',
  styleUrl: './audit-page.scss',
})
export default class AuditPage {
  /** `?entidad=Offer&entidadId=<id>`: historial de una entidad. */
  readonly entidad = input<string>();
  readonly entidadId = input<string>();

  private readonly api = inject(AdminAuditApi);
  private readonly router = inject(Router);
  private readonly access = inject(AdminAccess);
  protected readonly formatDateTime = formatDateTime;

  protected readonly actorId = signal('');
  protected readonly from = signal('');
  protected readonly to = signal('');

  /** Integrantes del equipo para filtrar (solo con `users.manage`). */
  protected readonly actors = toSignal(
    this.access.can('users.manage')
      ? inject(AdminUsersApi)
          .list({ staffOnly: true, pageSize: 100 })
          .pipe(
            map((page) => page.data.map((u) => ({ value: u.id, label: u.fullName || u.email }))),
            catchError(() => of([])),
          )
      : of([]),
    { initialValue: [] },
  );

  // La búsqueda filtra por acción (exacta o prefijo).
  protected readonly list = listController({
    fetch: ({ q, from, to, ...query }) =>
      this.api.list({
        ...query,
        action: q,
        from: from ? dayStartIso(from) : undefined,
        to: to ? dayEndIso(to) : undefined,
      }),
    filters: () => ({
      entityType: this.entidad() ?? '',
      entityId: this.entidadId() ?? '',
      actorId: this.actorId(),
      from: this.from(),
      to: this.to(),
    }),
    notFilters: ['entityType', 'entityId'],
  });

  protected readonly entityFilter = computed(() =>
    this.entidad() ? { type: this.entidad()!, id: this.entidadId() ?? null } : null,
  );

  protected clearFilters(): void {
    this.list.clearSearch();
    this.actorId.set('');
    this.from.set('');
    this.to.set('');
  }

  protected clearEntity(): void {
    void this.router.navigate([], { queryParams: {} });
  }

  /** Muestra el historial de la entidad de una entrada. */
  protected entityLink(type: string, id: string | null) {
    return id ? { entidad: type, entidadId: id } : { entidad: type };
  }
}
