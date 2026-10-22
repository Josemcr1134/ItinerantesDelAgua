import { Component, computed, inject, signal } from '@angular/core';
import { AdminTeacherDto, AdminTeachersApi } from 'data-access';
import { Button } from 'ui-kit';
import { firstValueFrom } from 'rxjs';
import { AdminAccess } from '../../core/access/admin-access';
import { SearchField } from '../../shared/filters/search-field';
import { listController } from '../../shared/list/list-controller';
import { ListStates } from '../../shared/list/list-states';
import { Pagination } from '../../shared/list/pagination';
import { rowActions } from '../../shared/list/row-actions';
import { PageHeader } from '../../shared/page-header/page-header';
import { Person } from '../../shared/person/person';
import { TeacherFormDialog } from './teacher-form-dialog';

/**
 * Docentes (HU-27): catálogo que se asigna a las ofertas. Ver requiere
 * `offers.read`; registrar, editar y borrar, `offers.write`. Solo se borra
 * a quien no está en ninguna oferta ni módulo.
 */
@Component({
  selector: 'adm-teachers-page',
  imports: [Button, Person, SearchField, ListStates, Pagination, PageHeader, TeacherFormDialog],
  templateUrl: './teachers-page.html',
  styleUrl: './teachers-page.scss',
})
export default class TeachersPage {
  private readonly api = inject(AdminTeachersApi);
  private readonly access = inject(AdminAccess);
  protected readonly canWrite = computed(() => this.access.permissions().has('offers.write'));

  protected readonly list = listController({ fetch: (query) => this.api.list(query) });
  protected readonly rows = rowActions();
  protected readonly notice = signal('');
  protected readonly formOpen = signal(false);
  protected readonly editing = signal<AdminTeacherDto | null>(null);

  /** En uso: está en alguna oferta o módulo (la API no deja borrarlo). */
  protected inUse(teacher: AdminTeacherDto): boolean {
    return teacher.offerCount > 0 || teacher.moduleCount > 0;
  }

  protected usage(teacher: AdminTeacherDto): string {
    const parts = [];
    if (teacher.offerCount)
      parts.push(`${teacher.offerCount} ${teacher.offerCount === 1 ? 'oferta' : 'ofertas'}`);
    if (teacher.moduleCount)
      parts.push(`${teacher.moduleCount} ${teacher.moduleCount === 1 ? 'módulo' : 'módulos'}`);
    return parts.length ? parts.join(' · ') : 'Sin asignar';
  }

  protected openForm(teacher: AdminTeacherDto | null): void {
    this.editing.set(teacher);
    this.formOpen.set(true);
  }

  protected onSaved(teacher: AdminTeacherDto): void {
    if (this.editing()) {
      this.list.replace((t) => t.id === teacher.id, teacher);
      this.notice.set(`Se guardaron los cambios de ${teacher.fullName}.`);
    } else {
      this.notice.set(`Se registró a ${teacher.fullName}.`);
      this.list.reload();
    }
  }

  protected async remove(teacher: AdminTeacherDto): Promise<void> {
    const done = await this.rows.confirmRun(
      teacher.id,
      {
        title: `¿Borrar a ${teacher.fullName}?`,
        message: 'Se elimina del catálogo de docentes. Esta acción no se puede deshacer.',
        confirmLabel: 'Borrar',
        variant: 'error',
      },
      async () => {
        await firstValueFrom(this.api.remove(teacher.id), { defaultValue: undefined });
        return true;
      },
    );
    if (done) {
      this.notice.set(`Se borró a ${teacher.fullName}.`);
      this.list.reload();
    }
  }
}
