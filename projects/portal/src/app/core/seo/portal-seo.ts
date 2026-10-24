import { DOCUMENT, inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRouteSnapshot, RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { environment } from '../../../environments/environment';

/** Metadatos de una página (en `data.seo` de la ruta). */
export interface PageSeo {
  readonly description: string;
  /** Solo las páginas públicas se indexan (login y registro); el resto, `noindex`. */
  readonly index?: boolean;
}

const SITE_NAME = 'Itinerantes del Agua';
const DEFAULT_TITLE = `Portal · ${SITE_NAME}`;

/**
 * Título y metadatos de cada página: descripción, robots, URL canónica y
 * Open Graph / Twitter. Reemplaza al `TitleStrategy` por defecto para
 * actualizar todo en la misma navegación.
 */
@Injectable({ providedIn: 'root' })
export class PortalSeo extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot) ?? DEFAULT_TITLE;
    const seo = deepestSeo(snapshot.root);
    const path = snapshot.url.split(/[?#]/)[0];
    const url = new URL(path, environment.siteUrl).href;

    this.title.setTitle(title);
    this.meta.updateTag({
      name: 'robots',
      content: seo?.index ? 'index, follow' : 'noindex, nofollow',
    });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    if (seo) {
      this.meta.updateTag({ name: 'description', content: seo.description });
      this.meta.updateTag({ property: 'og:description', content: seo.description });
      this.meta.updateTag({ name: 'twitter:description', content: seo.description });
    }
    this.canonical().setAttribute('href', url);
  }

  private canonical(): HTMLLinkElement {
    const existing = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (existing) return existing;
    const link = this.document.createElement('link');
    link.setAttribute('rel', 'canonical');
    this.document.head.appendChild(link);
    return link;
  }
}

/** `data.seo` de la ruta activa más profunda. */
function deepestSeo(route: ActivatedRouteSnapshot): PageSeo | undefined {
  let current: ActivatedRouteSnapshot | null = route;
  let seo: PageSeo | undefined;
  while (current) {
    seo = (current.data['seo'] as PageSeo | undefined) ?? seo;
    current = current.firstChild;
  }
  return seo;
}
