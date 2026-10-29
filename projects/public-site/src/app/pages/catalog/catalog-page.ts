import { Component, inject, input } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { CATALOG_CONTENT, OfferCatalog } from 'catalog';
import { CLOSING_CTA_CONTENT } from '../../content/closing-cta.content';
import { ClosingCta } from '../../sections/closing-cta/closing-cta';

/**
 * Catálogo de oferta formativa (HU-15, Figma "Oferta formativa"): título con
 * la onda azul, el catálogo compartido con el Portal (filtros en la URL,
 * tarjetas y paginación) y, al cierre, la sección de contacto de la home.
 */
@Component({
  selector: 'pub-catalog-page',
  imports: [OfferCatalog, ClosingCta],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
})
export default class CatalogPage {
  /** `?tipo=diplomados|cursos|talleres|eventos|convocatorias`. */
  readonly tipo = input<string>();
  /** `?modalidad=en-linea|presencial`. */
  readonly modalidad = input<string>();
  /** `?estado=`; por defecto, abiertas y próximas. */
  readonly estado = input<string>();
  /** `?beca=1`: solo con beca disponible. */
  readonly beca = input<string>();
  /** `?q=`: nombre de la oferta o docente. */
  readonly q = input<string>();
  /** `?topic=` (HU-34): temática pública, desde "Itinerantes del Agua". */
  readonly topic = input<string>();
  /** `?pagina=` (desde 1). */
  readonly pagina = input<string>();

  protected readonly c = CATALOG_CONTENT;
  protected readonly closingCta = CLOSING_CTA_CONTENT;

  constructor() {
    // TODO(contenido): confirmar la descripción para buscadores.
    inject(Meta).updateTag({ name: 'description', content: this.c.subtitle });
  }
}
