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

  /**
   * Título, descripción y etiquetas para compartir de la oferta (para quien
   * ejecuta JavaScript, como Google; WhatsApp y las redes las reciben en el
   * HTML desde `api/offer-page.js`). Miniatura: la primera imagen del
   * carrusel o, si no hay, la portada.
   */
  protected onLoaded(offer: OfferDetailDto): void {
    const title = `${offer.name} · Itinerantes del Agua`;
    const description = offer.summary || offer.name;
    this.title.setTitle(title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: location.href });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    const image = offer.carouselImageUrls[0] ?? offer.coverImageUrl;
    if (image) {
      this.meta.updateTag({ property: 'og:image', content: image });
      this.meta.updateTag({ property: 'og:image:alt', content: offer.name });
      this.meta.updateTag({ name: 'twitter:image', content: image });
      this.meta.removeTag('property="og:image:width"');
      this.meta.removeTag('property="og:image:height"');
    }
  }
}
