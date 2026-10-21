import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService, ROLE_LABELS, SessionStore } from 'auth';
import { AlertService } from 'ui-kit';

/** Marco del administrador con sesión (diseño provisional). */
@Component({
  selector: 'adm-admin-shell',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.scss',
})
export default class AdminShell {
  private readonly auth = inject(AuthService);
  private readonly alerts = inject(AlertService);
  protected readonly user = inject(SessionStore).user;
  protected readonly roles = computed(() =>
    (this.user()?.roles ?? []).map((role) => ROLE_LABELS[role]).join(' · '),
  );

  protected async logout(): Promise<void> {
    const confirmed = await this.alerts.confirm(
      '¿Cerrar sesión?',
      'Tendrás que volver a ingresar con tu correo y contraseña.',
      { confirmLabel: 'Cerrar sesión', variant: 'info' },
    );
    if (confirmed) {
      await this.auth.logout();
    }
  }
}
