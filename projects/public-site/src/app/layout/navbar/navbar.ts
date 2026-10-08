import { Component, ElementRef, input, signal, viewChild } from '@angular/core';
import { Button } from 'ui-kit';
import { AnchorLink } from '../../shared/anchor-link/anchor-link';
import { NavbarContent } from './navbar-content';

/** Navbar fijo con enlaces a anclas de la landing y menú desplegable en móvil. */
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
  private readonly toggleButton = viewChild.required<ElementRef<HTMLButtonElement>>('toggle');

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
