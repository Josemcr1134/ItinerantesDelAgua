import { Component, input } from '@angular/core';
import { OfferDetail } from 'catalog';
import { OfferDetailDto } from 'data-access';
import { usePageHeading } from '../../core/page-heading/page-heading';
import { PORTAL_CATALOG } from './portal-catalog';

/**
 * Ficha de una oferta dentro del Portal (la misma de la landing). Con la
 * sesión, la API calcula las acciones de esta persona (inscribirse, pagar,
 * ir al aula…), que siguen en el Portal.
 */
@Component({
  selector: 'portal-offer-page',
  imports: [OfferDetail],
  template: `<cat-offer-detail [slug]="slug()" [showCrumbs]="false" (loaded)="onLoaded($event)" />`,
})
export default class OfferPage {
  /** `/catalogo/:slug`. */
  readonly slug = input.required<string>();

  private readonly heading = usePageHeading();

  constructor() {
    this.setHeading(null);
  }

  protected onLoaded(offer: OfferDetailDto): void {
    this.setHeading(offer.name);
  }

  private setHeading(name: string | null): void {
    this.heading.set({
      title: 'Catálogo',
      breadcrumb: [
        { label: 'Catálogo', link: PORTAL_CATALOG.catalogPath },
        ...(name ? [{ label: name }] : []),
      ],
    });
  }
}
