import { DOCUMENT } from '@angular/common';
import { Directive, inject } from '@angular/core';
import { scrollToSection } from './scroll-to-section';

/**
 * Enlace a una ancla de la misma página (`<a pubAnchorLink href="#id">`).
 *
 * Hace scroll suave (salvo `prefers-reduced-motion`), mueve el foco a la
 * sección destino para lectores de pantalla y teclado, y actualiza el hash de
 * la URL. Sin JS el `href` sigue funcionando de forma nativa.
 *
 * La sección destino debe tener `tabindex="-1"` para poder recibir foco.
 */
@Directive({
  selector: 'a[pubAnchorLink]',
  host: { '(click)': 'onClick($event)' },
})
export class AnchorLink {
  private readonly document = inject(DOCUMENT);

  protected onClick(event: MouseEvent): void {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return;
    }
    const href = (event.currentTarget as HTMLAnchorElement).getAttribute('href') ?? '';
    const target = href.startsWith('#') ? this.document.getElementById(href.slice(1)) : null;
    if (!target) {
      return;
    }

    event.preventDefault();
    scrollToSection(this.document, target);
    this.document.defaultView?.history.pushState(null, '', href);
  }
}
