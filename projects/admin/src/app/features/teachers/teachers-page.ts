import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { AdminTeacherDto, AdminTeachersApi, Paginated, requestState } from 'data-access';
import { AlertService, Button } from 'ui-kit';
import { debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { AdminAccess } from '../../core/access/admin-access';
import { ErrorPresenter } from '../../core/error-presenter';
import { TeacherFormDialog } from './teacher-form-dialog';

const PAGE_SIZE = 20;

/**
 * Docentes (HU-27): catálogo que se asigna a las ofertas. Ver requiere
 * `offers.read`; registrar, editar y borrar, `offers.write`. Solo se borra
 * a quien no está en ninguna oferta ni módulo.
 */
@Component({
  selector: 'adm-teachers-page',
  imports: [FormsModule, Button, TeacherFormDialog],
  templateUrl: './teachers-page.html',
  styleUrl: './teachers-page.scss',
})
export default class TeachersPage {
  private readonly api = inject(AdminTeachersApi);
  private readonly alerts = inject(AlertService);
  private readonly errors = inject(ErrorPresenter);
  private readonly access = inject(AdminAccess);
  protected readonly canWrite = computed(() => this.access.permissions().has('offers.write'));

  protected readonly searchText = signal('');
  private readonly search = toSignal(
    toObservable(this.searchText).pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' },
  );
  protected readonly page = signal(1);
  private readonly query = computed(() => ({
    q: this.search().trim() || undefined,
    page: this.page(),
    pageSize: PAGE_SIZE,
  }));

  protected readonly list = requestState<Paginated<AdminTeacherDto>>();
  protected readonly teachers = computed(() => this.list.data()?.data ?? []);
  protected readonly meta = computed(() => this.list.data()?.meta ?? null);
  protected readonly notice = signal('');
  protected readonly busyId = signal<string | null>(null);

  protected readonly formOpen = signal(false);
  protected readonly editing = signal<AdminTeacherDto | null>(null);

  constructor() {
    effect(() => {
      this.search();
      untracked(() => this.page.set(1));
    });
    effect(() => {
      const query = this.query();
      untracked(() => void this.list.run(this.api.list(query)));
    });
  }

  protected reload(): void {
    void this.list.run(this.api.list(this.query()));
  }

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

  protected openCreate(): void {
    this.editing.set(null);
    this.formOpen.set(true);
  }

  protected openEdit(teacher: AdminTeacherDto): void {
    this.editing.set(teacher);
    this.formOpen.set(true);
  }

  protected onSaved(teacher: AdminTeacherDto): void {
    if (this.editing()) {
      const current = this.list.data();
      if (current) {
        this.list.set({
          ...current,
          data: current.data.map((t) => (t.id === teacher.id ? teacher : t)),
        });
      }
      this.notice.set(`Se guardaron los cambios de ${teacher.fullName}.`);
    } else {
      this.notice.set(`Se registró a ${teacher.fullName}.`);
      this.reload();
    }
  }

  protected async remove(teacher: AdminTeacherDto): Promise<void> {
    const confirmed = await this.alerts.confirm(
      `¿Borrar a ${teacher.fullName}?`,
      'Se elimina del catálogo de docentes. Esta acción no se puede deshacer.',
      { confirmLabel: 'Borrar', variant: 'error' },
    );
    if (!confirmed) return;
    this.busyId.set(teacher.id);
    try {
      await firstValueFrom(this.api.remove(teacher.id), { defaultValue: undefined });
      this.notice.set(`Se borró a ${teacher.fullName}.`);
      this.reload();
    } catch (error) {
      void this.errors.present(error);
    } finally {
      this.busyId.set(null);
    }
  }
}
