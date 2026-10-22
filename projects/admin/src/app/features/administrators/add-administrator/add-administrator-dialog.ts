import { Component, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { AdminUserDto, AdminUsersApi, Role, RoleDefinitionDto } from 'data-access';
import { Dialog, DialogActions } from 'ui-kit';
import { firstValueFrom } from 'rxjs';
import { ErrorPresenter } from '../../../core/error-presenter';
import { FormActions } from '../../../shared/form-actions/form-actions';
import { remoteSearch } from '../../../shared/list/remote-search';
import { Person } from '../../../shared/person/person';
import { RolePicker } from '../role-picker/role-picker';
import { staffRolesOf, STATUS_LABELS } from '../team-roles';

/** Caracteres mínimos para buscar cuentas. */
const MIN_SEARCH = 3;

/**
 * Agregar al equipo: 1) buscar una cuenta registrada (la persona se registra
 * antes en el portal) y 2) elegir sus roles.
 */
@Component({
  selector: 'adm-add-administrator-dialog',
  imports: [Dialog, DialogActions, FormActions, Person, RolePicker],
  templateUrl: './add-administrator-dialog.html',
  styleUrl: './add-administrator-dialog.scss',
})
export class AddAdministratorDialog {
  readonly open = model(false);
  readonly roles = input.required<readonly RoleDefinitionDto[]>();
  readonly added = output<AdminUserDto>();

  private readonly api = inject(AdminUsersApi);
  private readonly errors = inject(ErrorPresenter);

  protected readonly statusLabels = STATUS_LABELS;
  /** Cuentas registradas (cualquier persona, no solo el equipo). */
  protected readonly accounts = remoteSearch({
    fetch: (q) => this.api.list({ q, pageSize: 8, sort: 'NAME_ASC' }),
    minLength: MIN_SEARCH,
  });
  protected readonly selected = signal<AdminUserDto | null>(null);
  protected readonly chosenRoles = signal<readonly Role[]>([]);
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);

  constructor() {
    // Al abrir, empieza de cero.
    effect(() => {
      if (this.open()) {
        untracked(() => this.restart());
      }
    });
  }

  protected isStaff(user: AdminUserDto): boolean {
    return staffRolesOf(user.roles).length > 0;
  }

  protected choose(user: AdminUserDto): void {
    this.selected.set(user);
    this.chosenRoles.set(staffRolesOf(user.roles));
    this.submitted.set(false);
  }

  protected back(): void {
    this.selected.set(null);
  }

  protected async save(): Promise<void> {
    const user = this.selected();
    this.submitted.set(true);
    if (!user || !this.chosenRoles().length) return;
    this.saving.set(true);
    try {
      const updated = await firstValueFrom(
        this.api.updateRoles(user.id, { roles: [...this.chosenRoles()] }),
      );
      this.open.set(false);
      this.added.emit(updated);
    } catch (error) {
      void this.errors.present(error);
    } finally {
      this.saving.set(false);
    }
  }

  private restart(): void {
    this.accounts.reset();
    this.selected.set(null);
    this.chosenRoles.set([]);
    this.submitted.set(false);
  }
}
