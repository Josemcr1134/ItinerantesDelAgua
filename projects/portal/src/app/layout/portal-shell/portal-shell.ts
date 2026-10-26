import { NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService, SessionStore } from 'auth';
import { filter } from 'rxjs';
import { AlertService } from 'ui-kit';
import { PageHeading } from '../../core/page-heading/page-heading';
import { Avatar } from '../../shared/avatar/avatar';
import { MenuIcon } from './menu-icon';
import { NAV_ITEMS, NavItem } from './navigation';

const COLLAPSED_KEY = 'portal.sidebar.collapsed';

/** Preferencia del menú en este navegador (si el almacenamiento falla, expandido). */
function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Marco del portal (Figma HU-06): menú lateral que se contrae a solo íconos
 * (se recuerda en este navegador), saludo con el menú de la cuenta y, en
 * móvil, barra superior con el menú desplegable.
 */
@Component({
  selector: 'portal-shell',
  imports: [NgTemplateOutlet, RouterOutlet, RouterLink, RouterLinkActive, MenuIcon, Avatar],
  templateUrl: './portal-shell.html',
  styleUrls: ['./portal-shell.scss', './portal-sidebar.scss', './account-menu.scss'],
  host: {
    '[class.shell--collapsed]': 'collapsed()',
    '(document:keydown.escape)': 'closeMenus()',
    '(document:click)': 'closeAccountMenu($event)',
  },
})
export default class PortalShell {
  private readonly auth = inject(AuthService);
  private readonly alerts = inject(AlertService);
  protected readonly navItems = NAV_ITEMS;
  protected readonly pageHeading = inject(PageHeading);

  private readonly user = inject(SessionStore).user;
  protected readonly fullName = computed(() => this.user()?.fullName ?? '');
  /** "Hola, Jesús Pérez": nombre y primer apellido (o los dos primeros nombres). */
  protected readonly shortName = computed(() =>
    this.fullName().trim().split(/\s+/).slice(0, 2).join(' '),
  );

  protected readonly collapsed = signal(readCollapsed());
  /** Menú lateral desplegado en móvil. */
  protected readonly drawerOpen = signal(false);
  /** Menú de la cuenta: desde el saludo (arriba) o desde el pie del menú lateral. */
  protected readonly accountMenu = signal<'header' | 'sidebar' | null>(null);
  private readonly router = inject(Router);
  /** Ruta actual (sin query) para marcar el ítem desplegable activo. */
  private readonly url = signal(this.router.url);
  /** Desplegables abiertos o cerrados a mano; sin elección, abierto si está activo. */
  private readonly groups = signal<Readonly<Record<string, boolean>>>({});
  private readonly drawerToggle = viewChild<ElementRef<HTMLButtonElement>>('drawerToggle');
  private readonly sidebar = viewChild.required<ElementRef<HTMLElement>>('sidebar');
  private readonly injector = inject(Injector);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => {
        this.url.set(event.urlAfterRedirects);
        this.drawerOpen.set(false);
        this.accountMenu.set(null);
      });
  }

  protected isActive(item: NavItem): boolean {
    const path = this.url().split(/[?#]/)[0];
    return path === item.path || path.startsWith(item.path + '/');
  }

  protected isOpen(item: NavItem): boolean {
    return this.groups()[item.path] ?? this.isActive(item);
  }

  /** Abre o cierra el desplegable; con el menú contraído, va a su primera sección. */
  protected toggleGroup(item: NavItem): void {
    if (this.collapsed() && !this.drawerOpen()) {
      void this.router.navigateByUrl(item.children?.[0]?.path ?? item.path);
      return;
    }
    this.groups.update((groups) => ({ ...groups, [item.path]: !this.isOpen(item) }));
  }

  protected toggleCollapsed(): void {
    this.collapsed.update((value) => !value);
    try {
      localStorage.setItem(COLLAPSED_KEY, this.collapsed() ? '1' : '0');
    } catch {
      // Sin almacenamiento: la preferencia dura solo esta visita.
    }
  }

  /** En móvil: al abrir, el foco pasa al primer enlace del menú. */
  protected toggleDrawer(): void {
    this.drawerOpen.update((open) => !open);
    if (this.drawerOpen()) {
      afterNextRender(
        () => this.sidebar().nativeElement.querySelector<HTMLElement>('.nav__link')?.focus(),
        { injector: this.injector },
      );
    }
  }

  protected toggleAccountMenu(origin: 'header' | 'sidebar'): void {
    this.accountMenu.update((open) => (open === origin ? null : origin));
  }

  protected closeMenus(): void {
    if (this.accountMenu()) {
      this.accountMenu.set(null);
    } else if (this.drawerOpen()) {
      this.drawerOpen.set(false);
      this.drawerToggle()?.nativeElement.focus();
    }
  }

  /** Clic fuera del menú de la cuenta: se cierra. */
  protected closeAccountMenu(event: MouseEvent): void {
    const target = event.target as Element | null;
    if (this.accountMenu() && !target?.closest('.account')) {
      this.accountMenu.set(null);
    }
  }

  protected async logout(): Promise<void> {
    this.accountMenu.set(null);
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
