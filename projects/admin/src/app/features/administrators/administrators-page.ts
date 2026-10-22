import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AdminUserDto,
  AdminUserSort,
  AdminUsersApi,
  Paginated,
  requestState,
  Role,
  UserStatus,
} from 'data-access';
import { AlertService, Button, Dialog, DialogActions } from 'ui-kit';
import { debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { AdminAccess } from '../../core/access/admin-access';
import { ErrorPresenter } from '../../core/error-presenter';
import { AddAdministratorDialog } from './add-administrator/add-administrator-dialog';
import { RolePicker } from './role-picker/role-picker';
import { formatDateTime, staffRolesOf, STATUS_LABELS, teamRoles } from './team-roles';

const PAGE_SIZE = 20;

/**
 * Administradores (solo con `users.manage`): el equipo con sus roles y
 * estado. Agregar = asignar roles a una cuenta registrada; editar roles;
 * quitar del equipo (conserva su cuenta de participante); deshabilitar o
 * habilitar la cuenta.
 */
@Component({
  selector: 'adm-administrators-page',
  imports: [FormsModule, Button, Dialog, DialogActions, RolePicker, AddAdministratorDialog],
  templateUrl: './administrators-page.html',
  styleUrl: './administrators-page.scss',
})
export default class AdministratorsPage {
  private readonly api = inject(AdminUsersApi);
  private readonly alerts = inject(AlertService);
  private readonly errors = inject(ErrorPresenter);
  private readonly router = inject(Router);
  protected readonly access = inject(AdminAccess);

  protected readonly statusLabels = STATUS_LABELS;
  protected readonly formatDateTime = formatDateTime;
  protected readonly teamRoles = computed(() => teamRoles(this.access.catalog()));

  // --- Filtros ---
  protected readonly searchText = signal('');
  private readonly search = toSignal(
    toObservable(this.searchText).pipe(debounceTime(300), distinctUntilChanged()),
    { initialValue: '' },
  );
  protected readonly role = signal<Role | ''>('');
  protected readonly status = signal<UserStatus | ''>('');
  protected readonly sort = signal<AdminUserSort>('NAME_ASC');
  protected readonly page = signal(1);

  private readonly query = computed(() => ({
    staffOnly: true,
    q: this.search().trim() || undefined,
    role: this.role() || undefined,
    status: this.status() || undefined,
    sort: this.sort(),
    page: this.page(),
    pageSize: PAGE_SIZE,
  }));

  protected readonly list = requestState<Paginated<AdminUserDto>>();
  protected readonly users = computed(() => this.list.data()?.data ?? []);
  protected readonly meta = computed(() => this.list.data()?.meta ?? null);
  protected readonly hasFilters = computed(() => !!(this.search() || this.role() || this.status()));

  /** Aviso del resultado de la última acción (se anuncia a lectores de pantalla). */
  protected readonly notice = signal('');
  protected readonly busyId = signal<string | null>(null);

  // --- Editar roles ---
  protected readonly editing = signal<AdminUserDto | null>(null);
  protected readonly editOpen = signal(false);
  protected readonly editRoles = signal<readonly Role[]>([]);
  protected readonly saving = signal(false);
  protected readonly addOpen = signal(false);

  constructor() {
    // Volver a la primera página al cambiar un filtro.
    effect(() => {
      this.search();
      this.role();
      this.status();
      this.sort();
      untracked(() => this.page.set(1));
    });
    effect(() => {
      const query = this.query();
      untracked(() => void this.list.run(this.api.list(query)));
    });
  }

  protected isMe(user: AdminUserDto): boolean {
    return this.access.me()?.user.id === user.id;
  }

  protected staffRoles(user: AdminUserDto): Role[] {
    return staffRolesOf(user.roles);
  }

  protected reload(): void {
    void this.list.run(this.api.list(this.query()));
  }

  protected clearFilters(): void {
    this.searchText.set('');
    this.role.set('');
    this.status.set('');
  }

  // --- Editar roles ---
  protected openEdit(user: AdminUserDto): void {
    this.editing.set(user);
    this.editRoles.set(staffRolesOf(user.roles));
    this.editOpen.set(true);
  }

  /** Mi SUPER_ADMIN no se puede quitar (regla de la API). */
  protected lockedRoles(user: AdminUserDto | null): Role[] {
    return user && this.isMe(user) && user.roles.includes('SUPER_ADMIN') ? ['SUPER_ADMIN'] : [];
  }

  protected async saveRoles(): Promise<void> {
    const user = this.editing();
    if (!user) return;
    const roles = this.editRoles();
    if (!roles.length) {
      // Quitar todos los roles es "quitar del equipo": se confirma aparte.
      this.editOpen.set(false);
      await this.removeFromTeam(user);
      return;
    }
    this.saving.set(true);
    try {
      const updated = await firstValueFrom(this.api.updateRoles(user.id, { roles: [...roles] }));
      this.editOpen.set(false);
      this.replace(updated);
      this.notice.set(`Se actualizaron los roles de ${updated.fullName}.`);
      if (this.isMe(updated)) await this.afterSelfChange();
    } catch (error) {
      void this.errors.present(error);
    } finally {
      this.saving.set(false);
    }
  }

  // --- Quitar del equipo ---
  protected async removeFromTeam(user: AdminUserDto): Promise<void> {
    const confirmed = await this.alerts.confirm(
      `¿Quitar a ${user.fullName} del equipo?`,
      'Perderá el acceso al panel de inmediato. Su cuenta de participante se conserva y puedes volver a asignarle roles cuando quieras.',
      { confirmLabel: 'Quitar del equipo', variant: 'error' },
    );
    if (!confirmed) return;
    await this.runAction(user, this.api.updateRoles(user.id, { roles: [] }), () => {
      this.notice.set(`${user.fullName} ya no forma parte del equipo.`);
      this.reload();
    });
  }

  // --- Deshabilitar / habilitar ---
  protected async toggleStatus(user: AdminUserDto): Promise<void> {
    const disabling = user.status !== 'DISABLED';
    const confirmed = await this.alerts.confirm(
      disabling
        ? `¿Deshabilitar la cuenta de ${user.fullName}?`
        : `¿Habilitar la cuenta de ${user.fullName}?`,
      disabling
        ? 'No podrá iniciar sesión y se cerrarán todas sus sesiones. Puedes volver a habilitarla después.'
        : 'Podrá volver a iniciar sesión con sus roles actuales.',
      {
        confirmLabel: disabling ? 'Deshabilitar' : 'Habilitar',
        variant: disabling ? 'error' : 'info',
      },
    );
    if (!confirmed) return;
    const request = disabling ? this.api.disable(user.id) : this.api.enable(user.id);
    await this.runAction(user, request, (updated) => {
      this.replace(updated);
      this.notice.set(
        disabling
          ? `Se deshabilitó la cuenta de ${updated.fullName}.`
          : `Se habilitó la cuenta de ${updated.fullName}.`,
      );
    });
  }

  // --- Agregar ---
  protected onAdded(user: AdminUserDto): void {
    this.notice.set(`${user.fullName} ahora forma parte del equipo.`);
    this.reload();
  }

  private async runAction(
    user: AdminUserDto,
    request: ReturnType<AdminUsersApi['updateRoles']>,
    done: (updated: AdminUserDto) => void,
  ): Promise<void> {
    this.busyId.set(user.id);
    try {
      done(await firstValueFrom(request));
    } catch (error) {
      void this.errors.present(error);
    } finally {
      this.busyId.set(null);
    }
  }

  /** Reemplaza una cuenta en la lista sin volver a pedirla. */
  private replace(updated: AdminUserDto): void {
    const current = this.list.data();
    if (!current) return;
    this.list.set({
      ...current,
      data: current.data.map((user) => (user.id === updated.id ? updated : user)),
    });
  }

  /** Si cambié mis propios roles, recargo mi acceso (puedo perder esta sección). */
  private async afterSelfChange(): Promise<void> {
    await this.access.refresh();
    if (!this.access.can('users.manage')) {
      await this.router.navigateByUrl('/');
    }
  }
}
