import { DOCUMENT } from '@angular/common';
import { Directive, inject } from '@angular/core';
import { Router } from '@angular/router';
import { scrollToSection } from './scroll-to-section';

/**
 * Enlace interno de la landing: a una ancla (`href="#id"` o `"/#id"`) o a
 * otra página (`href="/escuela/oferta"`).
 *
 * Si el ancla está en la página actual, hace scroll suave (salvo
 * `prefers-reduced-motion`), mueve el foco a la sección para lectores de
 * pantalla y teclado, y actualiza el hash. Si es otra página, navega con el
 * Router sin recargar (el scroll al ancla lo resuelve `anchorScrolling`). Sin
 * JS el `href` sigue funcionando de forma nativa.
 *
 * La sección destino debe tener `tabindex="-1"` para poder recibir foco.
 */
@Directive({
  selector: 'a[pubAnchorLink]',
  host: { '(click)': 'onClick($event)' },
})
export class AnchorLink {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router, { optional: true });

  protected onClick(event: MouseEvent): void {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      return;
    }
    const href = (event.currentTarget as HTMLAnchorElement).getAttribute('href') ?? '';
    const here = this.document.location;
    const url = new URL(href, here.href);
    if (url.origin !== here.origin) {
      return;
    }

    if (url.pathname === here.pathname && url.hash) {
      const target = this.document.getElementById(url.hash.slice(1));
      if (!target) {
        return;
      }
      event.preventDefault();
      scrollToSection(this.document, target);
      this.document.defaultView?.history.pushState(null, '', href);
      return;
    }

    if (this.router) {
      event.preventDefault();
      void this.router.navigateByUrl(url.pathname + url.search + url.hash);
    }
  }
}
