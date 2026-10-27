import { DOCUMENT, ViewportScroller } from '@angular/common';
import {
  DestroyRef,
  EnvironmentProviders,
  inject,
  provideEnvironmentInitializer,
} from '@angular/core';
import { NavigationEnd, Router, Scroll } from '@angular/router';
import { filter } from 'rxjs';

export type PageScrollAction =
  | { readonly kind: 'position'; readonly position: [number, number] }
  | { readonly kind: 'anchor'; readonly anchor: string }
  | { readonly kind: 'top' }
  | { readonly kind: 'none' };

const pathOf = (event: Scroll) => {
  const e = event.routerEvent;
  return (e instanceof NavigationEnd ? e.urlAfterRedirects : e.url).split(/[?#]/)[0];
};

/**
 * Qué hacer con el scroll tras navegar: Atrás / Adelante → donde estaba; con
 * ancla → a la sección; otra página → arriba; misma página con otra query
 * (filtros, página del catálogo) → nada.
 */
export function pageScrollAction(event: Scroll, previousPath: string | null): PageScrollAction {
  if (event.position) return { kind: 'position', position: event.position };
  if (event.anchor) return { kind: 'anchor', anchor: event.anchor };
  return previousPath !== null && pathOf(event) !== previousPath
    ? { kind: 'top' }
    : { kind: 'none' };
}

/**
 * Scroll al navegar dentro de la landing con `pageScrollAction` (en lugar de
 * la restauración del Router, que sube la página también cuando solo cambia
 * la query). Requiere `withInMemoryScrolling`, que emite los eventos `Scroll`.
 */
export function providePageScroll(): EnvironmentProviders {
  return provideEnvironmentInitializer(() => {
    const viewport = inject(ViewportScroller);
    const document = inject(DOCUMENT);
    let previousPath: string | null = null;
    const subscription = inject(Router)
      .events.pipe(filter((event): event is Scroll => event instanceof Scroll))
      .subscribe((event) => {
        const action = pageScrollAction(event, previousPath);
        previousPath = pathOf(event);
        // Tras renderizar la página nueva (la sección del ancla ya existe).
        setTimeout(() => {
          if (action.kind === 'position') viewport.scrollToPosition(action.position);
          else if (action.kind === 'anchor') {
            // scrollIntoView respeta el scroll-margin de la sección (navbar fijo).
            const section = document.getElementById(action.anchor);
            if (section) section.scrollIntoView({ block: 'start' });
            else viewport.scrollToAnchor(action.anchor);
          } else if (action.kind === 'top') viewport.scrollToPosition([0, 0]);
        });
      });
    inject(DestroyRef).onDestroy(() => subscription.unsubscribe());
  });
}
