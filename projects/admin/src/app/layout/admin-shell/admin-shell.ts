import {
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from 'auth';
import { AlertService } from 'ui-kit';
import { filter } from 'rxjs';
import { AdminAccess } from '../../core/access/admin-access';
import { Icon } from '../../shared/icon/icon';
import { Person } from '../../shared/person/person';
import { NAV_ITEMS, NavItem } from '../../core/navigation';
import { ContactInbox } from '../../features/contact/contact-inbox';

/**
 * Marco del panel: menú lateral según los permisos de la persona (fijo en
 * escritorio, desplegable en móvil), su nombre y roles, y cerrar sesión.
 * Diseño provisional hasta tener el Figma.
 */
@Component({
  selector: 'adm-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, Person],
  templateUrl: './admin-shell.html',
  styleUrl: './admin-shell.scss',
  host: { '(document:keydown.escape)': 'closeMenu()' },
})
export default class AdminShell {
  private readonly auth = inject(AuthService);
  private readonly alerts = inject(AlertService);
  protected readonly access = inject(AdminAccess);
  private readonly inbox = inject(ContactInbox);

  protected readonly menuOpen = signal(false);
  private readonly menuToggle = viewChild<ElementRef<HTMLButtonElement>>('menuToggle');
  private readonly navLinks = viewChildren<ElementRef<HTMLAnchorElement>>('navLink');

  /** Solo las secciones que la persona puede usar. */
  protected readonly navItems = computed(() =>
    NAV_ITEMS.filter((item) => !item.permission || this.access.permissions().has(item.permission)),
  );
  /** Roles del equipo; en el menú se ve el primero y el resto se despliega. */
  protected readonly roles = computed(() =>
    this.access.roles().map((role) => this.access.roleLabel(role)),
  );
  protected readonly extraRoles = computed(() => this.roles().slice(1));
  protected readonly rolesOpen = signal(false);

  constructor() {
    // Al navegar desde el menú móvil, se cierra; y se actualizan los contadores.
    this.inbox.refresh();
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.menuOpen.set(false);
        this.inbox.refresh();
      });
  }

  /** Contador del ítem del menú (0: no se muestra). */
  protected count(item: NavItem): number {
    return item.counter === 'contact-unread' ? this.inbox.unread() : 0;
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
    if (this.menuOpen()) {
      setTimeout(() => this.navLinks()[0]?.nativeElement.focus());
    }
  }

  protected closeMenu(): void {
    if (this.menuOpen()) {
      this.menuOpen.set(false);
      this.menuToggle()?.nativeElement.focus();
    }
  }

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
