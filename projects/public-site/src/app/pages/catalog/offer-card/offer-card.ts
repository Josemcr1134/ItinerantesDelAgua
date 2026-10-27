import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OfferSummaryDto } from 'data-access';
import { Button } from 'ui-kit';
import { OFFER_CARD_CONTENT } from '../../../content/catalog.content';
import { PAGE_PATHS } from '../../../content/page-paths';
import { dateRange, formatMoney, percentRange, scheduleLines, shortDate } from '../catalog-format';

/**
 * Tarjeta de una oferta (Figma "Oferta formativa"): imagen a todo lo ancho
 * arriba con el estado, tipo, nombre, fechas y horas, horario en
 * CDMX y en tu zona, costo en tu moneda, beca y [Ver detalle].
 */
@Component({
  selector: 'pub-offer-card',
  imports: [RouterLink, Button],
  templateUrl: './offer-card.html',
  styleUrl: './offer-card.scss',
})
export class OfferCard {
  readonly offer = input.required<OfferSummaryDto>();
  readonly timezone = input.required<string>();

  protected readonly t = OFFER_CARD_CONTENT;
  protected readonly detailLink = computed(() => `${PAGE_PATHS.catalog}/${this.offer().slug}`);
  protected readonly image = computed(
    () => this.offer().coverImageUrl ?? this.t.fallbackImages[this.offer().type],
  );

  protected readonly dates = computed(() => {
    const o = this.offer();
    const range = dateRange(o.dates.startsAt, o.dates.endsAt, this.timezone());
    return [range ?? this.t.datesToConfirm, o.totalHours && `${o.totalHours} h`]
      .filter(Boolean)
      .join(' · ');
  });

  protected readonly schedule = computed(() => {
    const schedule = this.offer().schedule;
    return schedule ? scheduleLines(schedule, this.timezone()) : null;
  });

  protected readonly venue = computed(() => {
    const o = this.offer();
    if (o.modality !== 'IN_PERSON') return null;
    const v = o.venue;
    return v ? [v.name, v.city].filter(Boolean).join(', ') : this.t.venueToConfirm;
  });

  protected readonly price = computed(() => {
    const pricing = this.offer().pricing;
    switch (pricing.kind) {
      case 'FREE':
        return { amount: this.t.free, extra: null };
      case 'EXTERNAL_ENROLLMENT':
        return { amount: this.t.external, extra: null };
      default:
        return pricing.price
          ? {
              amount: formatMoney(pricing.price),
              extra: pricing.installments
                ? this.t.installments(pricing.installments.maxInstallments)
                : null,
            }
          : { amount: this.t.priceToConfirm, extra: null };
    }
  });

  protected readonly scholarship = computed(() => {
    const badge = this.offer().scholarship;
    return badge ? this.t.scholarship(percentRange(badge.minPercent, badge.maxPercent)) : null;
  });

  /** Nota de inscripción: cuándo abre (próximas) o cuándo cierra (abiertas). */
  protected readonly note = computed(() => {
    const o = this.offer();
    const zone = this.timezone();
    if (o.availability === 'UPCOMING' && o.dates.enrollmentOpensAt) {
      return this.t.opensOn(shortDate(o.dates.enrollmentOpensAt, zone));
    }
    if (o.availability === 'ENROLLMENT_OPEN' && o.dates.enrollmentClosesAt) {
      const date = shortDate(o.dates.enrollmentClosesAt, zone);
      return o.type === 'OPEN_CALL' ? this.t.callClosesOn(date) : this.t.closesOn(date);
    }
    return null;
  });
}
