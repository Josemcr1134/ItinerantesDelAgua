import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Button } from 'ui-kit';
import { AnchorLink } from '../../shared/anchor-link/anchor-link';
import { NavbarContent } from './navbar-content';

/** Desplazamiento (px) a partir del cual el navbar pasa a cápsula flotante. */
const SCROLL_THRESHOLD = 8;

/** A partir de este ancho el menú se muestra en línea (breakpoint xl). */
const DESKTOP_QUERY = '(min-width: 80rem)';

/**
 * Navbar fijo con enlaces a anclas de la landing y menú desplegable en móvil.
 * En la parte superior se muestra como barra a todo el ancho; al hacer scroll
 * pasa a una cápsula flotante con fondo de vidrio.
 */
@Component({
  selector: 'pub-navbar',
  imports: [AnchorLink, Button],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
  host: {
    '(document:keydown.escape)': 'closeMenu(true)',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class Navbar {
  readonly content = input.required<NavbarContent>();

  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);
  private readonly toggleButton = viewChild.required<ElementRef<HTMLButtonElement>>('toggle');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly router = inject(Router);
  /** Ruta actual (sin query ni ancla), para marcar la página en el menú. */
  private readonly path = signal(this.router.url.split(/[?#]/)[0]);

  constructor() {
    const view = inject(DOCUMENT).defaultView;
    const destroyRef = inject(DestroyRef);

    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((event) => this.path.set(event.urlAfterRedirects.split(/[?#]/)[0]));

    // Solo en navegador (afterNextRender no corre al prerenderizar).
    afterNextRender(() => {
      if (!view) {
        return;
      }
      const update = () => this.scrolled.set(view.scrollY > SCROLL_THRESHOLD);
      update();
      view.addEventListener('scroll', update, { passive: true });
      destroyRef.onDestroy(() => view.removeEventListener('scroll', update));

      // Al pasar a escritorio (menú en línea) el desplegable se cierra.
      const desktop = view.matchMedia(DESKTOP_QUERY);
      const onDesktopChange = (event: MediaQueryListEvent) => event.matches && this.closeMenu();
      desktop.addEventListener('change', onDesktopChange);
      destroyRef.onDestroy(() => desktop.removeEventListener('change', onDesktopChange));
    });
  }

  /** Enlace a una página (no a un ancla) y es la actual o una de sus subpáginas. */
  protected isCurrent(href: string): boolean {
    if (href.includes('#')) return false;
    const path = this.path();
    return path === href || path.startsWith(`${href}/`);
  }

  /** Un clic fuera del header cierra el menú. */
  protected onDocumentClick(event: MouseEvent): void {
    const target = event.target;
    if (this.menuOpen() && target instanceof Node && !this.host.nativeElement.contains(target)) {
      this.closeMenu();
    }
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(returnFocus = false): void {
    if (!this.menuOpen()) {
      return;
    }
    this.menuOpen.set(false);
    if (returnFocus) {
      this.toggleButton().nativeElement.focus();
    }
  }
}
