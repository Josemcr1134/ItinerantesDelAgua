import { Component, input } from '@angular/core';
import { CATALOG_CONTENT, OfferCatalog } from 'catalog';
import { usePageHeading } from '../../core/page-heading/page-heading';

/**
 * Catálogo de oferta formativa dentro del Portal (el mismo de la landing):
 * filtros en la URL, tarjetas y paginación. "Ver detalle" abre la ficha aquí.
 */
@Component({
  selector: 'portal-catalog-page',
  imports: [OfferCatalog],
  template: `
    <cat-offer-catalog
      [tipo]="tipo()"
      [modalidad]="modalidad()"
      [estado]="estado()"
      [beca]="beca()"
      [q]="q()"
      [topic]="topic()"
      [pagina]="pagina()"
    />
  `,
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
  /** `?topic=`: temática pública. */
  readonly topic = input<string>();
  /** `?pagina=` (desde 1). */
  readonly pagina = input<string>();

  constructor() {
    usePageHeading().set({ title: 'Catálogo', subtitle: CATALOG_CONTENT.subtitle });
  }
}
