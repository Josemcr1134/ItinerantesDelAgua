import { Component, inject, input } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { OfferDetail } from 'catalog';
import { OfferDetailDto } from 'data-access';
import { CLOSING_CTA_CONTENT } from '../../content/closing-cta.content';
import { ClosingCta } from '../../sections/closing-cta/closing-cta';

/**
 * Ficha de una oferta (HU-16): la ficha compartida con el Portal (las
 * acciones llevan al Portal) y, al cierre, la sección de contacto. Pone el
 * título y la descripción para buscadores con la oferta.
 */
@Component({
  selector: 'pub-offer-detail-page',
  imports: [OfferDetail, ClosingCta],
  template: `
    <div class="detail">
      <cat-offer-detail [slug]="slug()" (loaded)="onLoaded($event)" />
    </div>
    <pub-closing-cta [content]="closingCta" />
  `,
  styleUrl: './offer-detail-page.scss',
})
export default class OfferDetailPage {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  /** `/escuela/oferta/:slug`. */
  readonly slug = input.required<string>();

  protected readonly closingCta = CLOSING_CTA_CONTENT;

  protected onLoaded(offer: OfferDetailDto): void {
    this.title.setTitle(`${offer.name} · Itinerantes del Agua`);
    this.meta.updateTag({ name: 'description', content: offer.summary || offer.name });
  }
}
