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
import { Button } from 'ui-kit';
import { AnchorLink } from '../../shared/anchor-link/anchor-link';
import { NavbarContent } from './navbar-content';

/** Desplazamiento (px) a partir del cual el navbar pasa a cápsula flotante. */
const SCROLL_THRESHOLD = 8;

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
  host: { '(document:keydown.escape)': 'closeMenu(true)' },
})
export class Navbar {
  readonly content = input.required<NavbarContent>();

  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);
  private readonly toggleButton = viewChild.required<ElementRef<HTMLButtonElement>>('toggle');

  constructor() {
    const view = inject(DOCUMENT).defaultView;
    const destroyRef = inject(DestroyRef);

    // Solo en navegador (afterNextRender no corre al prerenderizar).
    afterNextRender(() => {
      if (!view) {
        return;
      }
      const update = () => this.scrolled.set(view.scrollY > SCROLL_THRESHOLD);
      update();
      view.addEventListener('scroll', update, { passive: true });
      destroyRef.onDestroy(() => view.removeEventListener('scroll', update));
    });
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
