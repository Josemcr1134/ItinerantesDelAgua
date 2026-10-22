import { Component, computed, inject } from '@angular/core';
import { AdminAccess } from '../../core/access/admin-access';
import { PERMISSION_LABELS } from '../../core/access/permission-labels';

/** Inicio del panel: saludo, roles y lo que la persona puede hacer (provisional). */
@Component({
  selector: 'adm-home',
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export default class Home {
  protected readonly access = inject(AdminAccess);

  protected readonly firstName = computed(
    () => this.access.me()?.user.fullName.split(' ')[0] ?? '',
  );
  protected readonly abilities = computed(() =>
    [...this.access.permissions()]
      .filter((permission) => permission !== 'admin.access')
      .map((permission) => PERMISSION_LABELS[permission]),
  );
}
