import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ROLE_LABELS } from 'auth';
import {
  AdminUserDto,
  AdminUserSort,
  AdminUsersApi,
  Role,
  USER_STATUS_VALUES,
  UserStatus,
} from 'data-access';
import { firstValueFrom } from 'rxjs';
import { Pagination } from 'ui-kit';
import { AdminAccess } from '../../core/access/admin-access';
import { FilterBar } from '../../shared/filters/filter-bar';
import { FilterSelect, optionsFrom } from '../../shared/filters/filter-select';
import { SearchField } from '../../shared/filters/search-field';
import { listController } from '../../shared/list/list-controller';
import { ListStates } from '../../shared/list/list-states';
import { Notice } from '../../shared/notice/notice';
import { PageHeader } from '../../shared/page-header/page-header';
import { Person } from '../../shared/person/person';
import { RowMenu } from '../../shared/row-menu/row-menu';
import { accountActions } from '../administrators/account-actions';
import { EditRolesDialog } from '../administrators/edit-roles-dialog';
import {
  formatDateTime,
  staffRolesOf,
  STATUS_LABELS,
  teamRoles,
} from '../administrators/team-roles';

const countryNames = new Intl.DisplayNames('es', { type: 'region' });

/**
 * Usuarios (solo con `users.manage`): todas las cuentas registradas,
 * participantes y equipo, con su país, roles, estado, verificación del
 * correo, último acceso y registro. Permite editar los roles (asignar uno del
 * equipo lo suma a Administradores), deshabilitar o habilitar la cuenta y
 * marcar el correo como verificado.
 */
@Component({
  selector: 'adm-users-page',
  imports: [
    PageHeader,
    Notice,
    FilterBar,
    SearchField,
    FilterSelect,
    ListStates,
    Pagination,
    Person,
    RowMenu,
    EditRolesDialog,
  ],
  templateUrl: './users-page.html',
  styleUrl: './users-page.scss',
})
export default class UsersPage {
  private readonly api = inject(AdminUsersApi);
  private readonly router = inject(Router);
  protected readonly access = inject(AdminAccess);

  protected readonly statusLabels = STATUS_LABELS;
  protected readonly formatDateTime = formatDateTime;
  protected readonly teamRoles = computed(() => teamRoles(this.access.catalog()));

  // --- Filtros ---
  protected readonly role = signal<Role | ''>('');
  protected readonly status = signal<UserStatus | ''>('');
  protected readonly sort = signal<AdminUserSort>('CREATED_DESC');
  protected readonly options = {
    /** Todos los roles, también Participante (nombre del catálogo de la API). */
    role: computed(() => {
      const catalog = this.access.catalog();
      return (Object.keys(ROLE_LABELS) as Role[]).map((role) => ({
        value: role,
        label: catalog.find((def) => def.role === role)?.label ?? ROLE_LABELS[role],
      }));
    }),
    status: optionsFrom(USER_STATUS_VALUES, STATUS_LABELS),
    sort: [
      { value: 'CREATED_DESC', label: 'Más recientes' },
      { value: 'NAME_ASC', label: 'Nombre (A-Z)' },
      { value: 'LAST_LOGIN_DESC', label: 'Último acceso' },
    ] as const,
  };

  protected readonly list = listController({
    fetch: (query) => this.api.list(query),
    filters: () => ({ role: this.role(), status: this.status(), sort: this.sort() }),
    notFilters: ['sort'],
  });

  /** Aviso del resultado de la última acción (se anuncia a lectores de pantalla). */
  protected readonly notice = signal('');

  protected readonly accounts = accountActions((updated, message) => {
    this.list.replace((u) => u.id === updated.id, updated);
    this.notice.set(message);
  });
  protected readonly rows = this.accounts.rows;

  // --- Editar roles ---
  protected readonly editing = signal<AdminUserDto | null>(null);
  protected readonly editOpen = signal(false);

  protected isMe(user: AdminUserDto): boolean {
    return this.access.me()?.user.id === user.id;
  }

  protected staffRoles(user: AdminUserDto): Role[] {
    return staffRolesOf(user.roles);
  }

  protected country(code: string): string {
    try {
      return countryNames.of(code) ?? code;
    } catch {
      return code;
    }
  }

  protected clearFilters(): void {
    this.list.clearSearch();
    this.role.set('');
    this.status.set('');
  }

  protected openEdit(user: AdminUserDto): void {
    this.editing.set(user);
    this.editOpen.set(true);
  }

  /** Mi SUPER_ADMIN no se puede quitar (regla de la API). */
  protected lockedRoles(user: AdminUserDto | null): Role[] {
    return user && this.isMe(user) && user.roles.includes('SUPER_ADMIN') ? ['SUPER_ADMIN'] : [];
  }

  protected async onRolesSaved(updated: AdminUserDto): Promise<void> {
    this.list.replace((u) => u.id === updated.id, updated);
    this.notice.set(`Se actualizaron los roles de ${updated.fullName}.`);
    if (this.isMe(updated)) await this.afterSelfChange();
  }

  /**
   * Guardar sin roles del equipo: si los tenía, sale del equipo (con
   * confirmación); si era solo participante, no cambia nada.
   */
  protected async removeFromTeam(user: AdminUserDto): Promise<void> {
    if (!this.staffRoles(user).length) return;
    const updated = await this.rows.confirmRun(
      user.id,
      {
        title: `¿Quitar a ${user.fullName} del equipo?`,
        message:
          'Perderá el acceso al panel de inmediato. Su cuenta de participante se conserva y puedes volver a asignarle roles cuando quieras.',
        confirmLabel: 'Quitar del equipo',
        variant: 'error',
      },
      () => firstValueFrom(this.api.updateRoles(user.id, { roles: [] })),
    );
    if (updated) {
      this.list.replace((u) => u.id === updated.id, updated);
      this.notice.set(`${user.fullName} ya no forma parte del equipo.`);
    }
  }

  /** Si cambié mis propios roles, recargo mi acceso (puedo perder esta sección). */
  private async afterSelfChange(): Promise<void> {
    await this.access.refresh();
    if (!this.access.can('users.manage')) {
      await this.router.navigateByUrl('/');
    }
  }
}
