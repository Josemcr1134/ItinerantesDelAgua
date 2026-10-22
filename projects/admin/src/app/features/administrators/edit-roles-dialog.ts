import { Component, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { AdminUserDto, AdminUsersApi, Role, RoleDefinitionDto } from 'data-access';
import { Dialog, DialogActions } from 'ui-kit';
import { firstValueFrom } from 'rxjs';
import { ErrorPresenter } from '../../core/error-presenter';
import { FormActions } from '../../shared/form-actions/form-actions';
import { RolePicker } from './role-picker/role-picker';
import { staffRolesOf } from './team-roles';

/**
 * Editar los roles del equipo de una cuenta. Si se quitan todos, en lugar de
 * guardar pide "quitar del equipo" (`removeRequested`), que se confirma aparte.
 */
@Component({
  selector: 'adm-edit-roles-dialog',
  imports: [Dialog, DialogActions, FormActions, RolePicker],
  template: `
    <ui-dialog [(open)]="open" [title]="'Roles de ' + (user()?.fullName ?? '')" [busy]="saving()">
      @if (user(); as u) {
        <p class="lead">{{ u.email }}</p>
        <adm-role-picker
          [roles]="roles()"
          [(value)]="selected"
          [locked]="locked()"
          [disabled]="saving()"
          hint="Los cambios aplican de inmediato. Sin ningún rol, la persona sale del equipo."
        />
      }
      <div uiDialogActions>
        <adm-form-actions
          submitLabel="Guardar roles"
          [busy]="saving()"
          (cancel)="open.set(false)"
          (submitted)="save()"
        />
      </div>
    </ui-dialog>
  `,
  styles: `
    .lead {
      margin-bottom: var(--space-3);
      color: color-mix(in srgb, var(--color-raisin-black) 70%, transparent);
    }
  `,
})
export class EditRolesDialog {
  readonly open = model(false);
  readonly user = input<AdminUserDto | null>(null);
  /** Roles del equipo para elegir (catálogo de la API). */
  readonly roles = input.required<readonly RoleDefinitionDto[]>();
  /** Roles que no se pueden quitar (mi SUPER_ADMIN). */
  readonly locked = input<readonly Role[]>([]);
  readonly saved = output<AdminUserDto>();
  readonly removeRequested = output<AdminUserDto>();

  private readonly api = inject(AdminUsersApi);
  private readonly errors = inject(ErrorPresenter);
  protected readonly selected = signal<readonly Role[]>([]);
  protected readonly saving = signal(false);

  constructor() {
    // Al abrir, parte de los roles actuales.
    effect(() => {
      if (!this.open()) return;
      const user = this.user();
      untracked(() => this.selected.set(user ? staffRolesOf(user.roles) : []));
    });
  }

  protected async save(): Promise<void> {
    const user = this.user();
    if (!user) return;
    if (!this.selected().length) {
      this.open.set(false);
      this.removeRequested.emit(user);
      return;
    }
    this.saving.set(true);
    try {
      const updated = await firstValueFrom(
        this.api.updateRoles(user.id, { roles: [...this.selected()] }),
      );
      this.open.set(false);
      this.saved.emit(updated);
    } catch (error) {
      void this.errors.present(error);
    } finally {
      this.saving.set(false);
    }
  }
}
