import { Component, computed, inject, signal } from '@angular/core';
import { AdminTeacherDto, AdminTeachersApi } from 'data-access';
import { AlertService, Button } from 'ui-kit';
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
import { Notice } from '../../shared/notice/notice';
import { FilterBar } from '../../shared/filters/filter-bar';

/**
 * Docentes (HU-27): catálogo que se asigna a las ofertas. Ver requiere
 * `offers.read`; registrar, editar y borrar, `offers.write`. Solo se borra
 * a quien no está en ninguna oferta ni módulo.
 */
@Component({
  selector: 'adm-teachers-page',
  imports: [
    FilterBar,
    Notice,
    Button,
    Person,
    SearchField,
    ListStates,
    Pagination,
    PageHeader,
    TeacherFormDialog,
  ],
  templateUrl: './teachers-page.html',
  styleUrl: './teachers-page.scss',
})
export default class TeachersPage {
  private readonly api = inject(AdminTeachersApi);
  private readonly access = inject(AdminAccess);
  private readonly alerts = inject(AlertService);
  protected readonly canWrite = computed(() => this.access.permissions().has('offers.write'));

  protected readonly list = listController({ fetch: (query) => this.api.list(query) });
  protected readonly rows = rowActions();
  protected readonly notice = signal('');
  protected readonly formOpen = signal(false);
  protected readonly editing = signal<AdminTeacherDto | null>(null);

  /** En uso: está en alguna oferta o módulo (la API no deja borrarlo). */
  /** En uso: está en alguna oferta o módulo (la API no deja borrarlo). */
  protected inUse(teacher: AdminTeacherDto): boolean {
    return teacher.offerCount > 0 || teacher.moduleCount > 0;
  }

  /** "3 ofertas · 5 módulos" (o "Sin asignar"). */
  protected usage(teacher: AdminTeacherDto): string {
    return usageParts(teacher).join(' · ') || 'Sin asignar';
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

  /**
   * Borrar: primero revisa en la API en cuántas ofertas y módulos participa
   * (la cifra de la lista puede estar desactualizada). Si participa en alguno,
   * lo informa y no intenta borrarlo; si no, pide confirmación y lo borra.
   */
  protected async remove(teacher: AdminTeacherDto): Promise<void> {
    const current = await this.rows.run(teacher.id, () => this.freshTeacher(teacher));
    if (!current) return;
    if (current.id === teacher.id) this.list.replace((t) => t.id === current.id, current);

    if (this.inUse(current)) {
      await this.alerts.warning(
        `${current.fullName} no se puede borrar`,
        `Participa en ${usageParts(current).join(' y ')}. Para borrarlo, primero quítalo de ` +
          `${current.offerCount + current.moduleCount === 1 ? 'ese contenido' : 'esos contenidos'}.`,
      );
      return;
    }

    const done = await this.rows.confirmRun(
      current.id,
      {
        title: `¿Borrar a ${current.fullName}?`,
        message:
          'No participa en ninguna oferta ni módulo. Se elimina del catálogo de docentes y no se puede deshacer.',
        confirmLabel: 'Borrar',
        variant: 'error',
      },
      async () => {
        await firstValueFrom(this.api.remove(current.id), { defaultValue: undefined });
        return true;
      },
    );
    if (done) {
      this.notice.set(`Se borró a ${current.fullName}.`);
      this.list.reload();
    }
  }

  /**
   * Datos actuales del docente. La API no tiene detalle por id: se busca por
   * su nombre y se identifica por id (si no aparece, se usan los de la lista).
   */
  private async freshTeacher(teacher: AdminTeacherDto): Promise<AdminTeacherDto> {
    const page = await firstValueFrom(this.api.list({ q: teacher.fullName, pageSize: 100 }));
    return page.data.find((t) => t.id === teacher.id) ?? teacher;
  }
}

/** Partes de uso con su plural: ["3 ofertas", "1 módulo"]. */
function usageParts(teacher: AdminTeacherDto): string[] {
  const parts: string[] = [];
  if (teacher.offerCount) {
    parts.push(`${teacher.offerCount} ${teacher.offerCount === 1 ? 'oferta' : 'ofertas'}`);
  }
  if (teacher.moduleCount) {
    parts.push(`${teacher.moduleCount} ${teacher.moduleCount === 1 ? 'módulo' : 'módulos'}`);
  }
  return parts;
}
