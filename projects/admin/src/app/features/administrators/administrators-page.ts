import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AdminUserDto,
  AdminUserSort,
  AdminUsersApi,
  Role,
  USER_STATUS_VALUES,
  UserStatus,
} from 'data-access';
import { AlertService, Button, Dialog, DialogActions } from 'ui-kit';
import { firstValueFrom, Observable } from 'rxjs';
import { AdminAccess } from '../../core/access/admin-access';
import { FilterSelect, optionsFrom } from '../../shared/filters/filter-select';
import { SearchField } from '../../shared/filters/search-field';
import { FormActions } from '../../shared/form-actions/form-actions';
import { listController } from '../../shared/list/list-controller';
import { ListStates } from '../../shared/list/list-states';
import { Pagination } from '../../shared/list/pagination';
import { rowActions } from '../../shared/list/row-actions';
import { PageHeader } from '../../shared/page-header/page-header';
import { AddAdministratorDialog } from './add-administrator/add-administrator-dialog';
import { RolePicker } from './role-picker/role-picker';
import { formatDateTime, staffRolesOf, STATUS_LABELS, teamRoles } from './team-roles';

/**
 * Administradores (solo con `users.manage`): el equipo con sus roles y
 * estado. Agregar = asignar roles a una cuenta registrada; editar roles;
 * quitar del equipo (conserva su cuenta de participante); deshabilitar o
 * habilitar la cuenta.
 */
@Component({
  selector: 'adm-administrators-page',
  imports: [
    Button,
    Dialog,
    DialogActions,
    FormActions,
    RolePicker,
    AddAdministratorDialog,
    PageHeader,
    SearchField,
    FilterSelect,
    ListStates,
    Pagination,
  ],
  templateUrl: './administrators-page.html',
  styleUrl: './administrators-page.scss',
})
export default class AdministratorsPage {
  private readonly api = inject(AdminUsersApi);
  private readonly alerts = inject(AlertService);
  private readonly router = inject(Router);
  protected readonly access = inject(AdminAccess);

  protected readonly statusLabels = STATUS_LABELS;
  protected readonly formatDateTime = formatDateTime;
  protected readonly teamRoles = computed(() => teamRoles(this.access.catalog()));

  // --- Filtros ---
  protected readonly role = signal<Role | ''>('');
  protected readonly status = signal<UserStatus | ''>('');
  protected readonly sort = signal<AdminUserSort>('NAME_ASC');
  protected readonly options = {
    role: computed(() => this.teamRoles().map((def) => ({ value: def.role, label: def.label }))),
    status: optionsFrom(USER_STATUS_VALUES, STATUS_LABELS),
    sort: [
      { value: 'NAME_ASC', label: 'Nombre (A-Z)' },
      { value: 'LAST_LOGIN_DESC', label: 'Último acceso' },
      { value: 'CREATED_DESC', label: 'Más recientes' },
    ] as const,
  };

  protected readonly list = listController({
    fetch: (query) => this.api.list(query),
    filters: () => ({
      staffOnly: true,
      role: this.role(),
      status: this.status(),
      sort: this.sort(),
    }),
    notFilters: ['staffOnly', 'sort'],
  });
  protected readonly rows = rowActions();

  /** Aviso del resultado de la última acción (se anuncia a lectores de pantalla). */
  protected readonly notice = signal('');

  // --- Editar roles ---
  protected readonly editing = signal<AdminUserDto | null>(null);
  protected readonly editOpen = signal(false);
  protected readonly editRoles = signal<readonly Role[]>([]);
  protected readonly saving = signal(false);
  protected readonly addOpen = signal(false);

  protected isMe(user: AdminUserDto): boolean {
    return this.access.me()?.user.id === user.id;
  }

  protected staffRoles(user: AdminUserDto): Role[] {
    return staffRolesOf(user.roles);
  }

  protected clearFilters(): void {
    this.list.clearSearch();
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
    const updated = await this.rows.run(user.id, () =>
      firstValueFrom(this.api.updateRoles(user.id, { roles: [...roles] })),
    );
    this.saving.set(false);
    if (!updated) return;
    this.editOpen.set(false);
    this.list.replace((u) => u.id === updated.id, updated);
    this.notice.set(`Se actualizaron los roles de ${updated.fullName}.`);
    if (this.isMe(updated)) await this.afterSelfChange();
  }

  // --- Quitar del equipo ---
  protected async removeFromTeam(user: AdminUserDto): Promise<void> {
    const confirmed = await this.alerts.confirm(
      `¿Quitar a ${user.fullName} del equipo?`,
      'Perderá el acceso al panel de inmediato. Su cuenta de participante se conserva y puedes volver a asignarle roles cuando quieras.',
      { confirmLabel: 'Quitar del equipo', variant: 'error' },
    );
    if (!confirmed) return;
    if (await this.runOn(user, this.api.updateRoles(user.id, { roles: [] }))) {
      this.notice.set(`${user.fullName} ya no forma parte del equipo.`);
      this.list.reload();
    }
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
    const updated = await this.runOn(
      user,
      disabling ? this.api.disable(user.id) : this.api.enable(user.id),
    );
    if (updated) {
      this.list.replace((u) => u.id === updated.id, updated);
      this.notice.set(
        disabling
          ? `Se deshabilitó la cuenta de ${updated.fullName}.`
          : `Se habilitó la cuenta de ${updated.fullName}.`,
      );
    }
  }

  // --- Agregar ---
  protected onAdded(user: AdminUserDto): void {
    this.notice.set(`${user.fullName} ahora forma parte del equipo.`);
    this.list.reload();
  }

  private runOn(
    user: AdminUserDto,
    request: Observable<AdminUserDto>,
  ): Promise<AdminUserDto | null> {
    return this.rows.run(user.id, () => firstValueFrom(request));
  }

  /** Si cambié mis propios roles, recargo mi acceso (puedo perder esta sección). */
  private async afterSelfChange(): Promise<void> {
    await this.access.refresh();
    if (!this.access.can('users.manage')) {
      await this.router.navigateByUrl('/');
    }
  }
}
