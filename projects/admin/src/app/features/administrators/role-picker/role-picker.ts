import { Component, input, model } from '@angular/core';
import { Role, RoleDefinitionDto } from 'data-access';
import { PERMISSION_LABELS } from '../../../core/access/permission-labels';

let nextPickerId = 0;

/**
 * Casillas de los roles del equipo, cada uno con los permisos que otorga.
 * `locked` marca roles que no se pueden quitar (p. ej. mi SUPER_ADMIN).
 */
@Component({
  selector: 'adm-role-picker',
  template: `
    <fieldset class="picker" [attr.aria-describedby]="hint() ? id + '-hint' : null">
      <legend class="picker__legend">{{ legend() }}</legend>
      @if (hint()) {
        <p class="picker__hint" [id]="id + '-hint'">{{ hint() }}</p>
      }
      <ul class="picker__list">
        @for (def of roles(); track def.role) {
          @let checked = value().includes(def.role);
          @let isLocked = locked().includes(def.role);
          <li class="role" [class.role--checked]="checked">
            <input
              class="role__check"
              type="checkbox"
              [id]="id + '-' + def.role"
              [checked]="checked"
              [disabled]="isLocked || disabled()"
              [attr.aria-describedby]="id + '-' + def.role + '-perms'"
              (change)="toggle(def.role, $any($event.target).checked)"
            />
            <label class="role__label" [for]="id + '-' + def.role">
              {{ def.label }}
              @if (isLocked) {
                <span class="role__lock">(no puedes quitártelo)</span>
              }
            </label>
            <p class="role__perms" [id]="id + '-' + def.role + '-perms'">
              {{ describe(def) }}
            </p>
          </li>
        }
      </ul>
    </fieldset>
  `,
  styleUrl: './role-picker.scss',
})
export class RolePicker {
  /** Roles del equipo a mostrar (sin `PARTICIPANT`). */
  readonly roles = input.required<readonly RoleDefinitionDto[]>();
  readonly value = model<readonly Role[]>([]);
  readonly locked = input<readonly Role[]>([]);
  readonly disabled = input(false);
  readonly legend = input('Roles del equipo');
  readonly hint = input<string>();

  protected readonly id = `adm-roles-${nextPickerId++}`;

  protected toggle(role: Role, checked: boolean): void {
    this.value.update((roles) =>
      checked ? [...roles, role] : roles.filter((current) => current !== role),
    );
  }

  protected describe(def: RoleDefinitionDto): string {
    const abilities = def.permissions
      .filter((permission) => permission !== 'admin.access')
      .map((permission) => PERMISSION_LABELS[permission]);
    return abilities.length ? abilities.join(' · ') : 'Solo entrar al panel.';
  }
}
