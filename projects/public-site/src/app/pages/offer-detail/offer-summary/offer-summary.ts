import { Component, computed, input } from '@angular/core';
import { OfferActionDto, OfferDetailDto } from 'data-access';
import { OFFER_DETAIL_CONTENT, SCHEDULE_ZONES } from '../../../content/offer-detail.content';
import { portalActionUrl } from '../../../content/portal-links';
import {
  CDMX,
  dateRange,
  formatMoney,
  percentRange,
  shortDate,
  time,
  utcOffset,
  weekdaysLabel,
  zoneName,
} from '../../catalog/catalog-format';

interface ActionView {
  readonly type: OfferActionDto['type'];
  readonly label: string;
  readonly href: string;
  readonly enabled: boolean;
  readonly primary: boolean;
  readonly note: string | null;
}

/**
 * Resumen de la ficha (Figma, columna derecha): fechas, horario por zonas con
 * la de quien visita resaltada, lugar, costo en su moneda (por módulo y en
 * cuotas), el bloque de beca y las acciones que calcula la API. Cada acción
 * lleva al Portal, que pide la sesión y la ejecuta.
 */
@Component({
  selector: 'pub-offer-summary',
  templateUrl: './offer-summary.html',
  styleUrls: ['./offer-summary.scss', './offer-actions.scss'],
})
export class OfferSummary {
  readonly offer = input.required<OfferDetailDto>();
  readonly timezone = input.required<string>();

  protected readonly t = OFFER_DETAIL_CONTENT;

  protected readonly dates = computed(() => {
    const o = this.offer();
    return dateRange(o.dates.startsAt, o.dates.endsAt, this.timezone());
  });

  protected readonly enrollmentNote = computed(() => {
    const o = this.offer();
    const zone = this.timezone();
    if (o.availability === 'ENROLLMENT_OPEN' && o.dates.enrollmentClosesAt) {
      return this.t.summary.enrollmentUntil(shortDate(o.dates.enrollmentClosesAt, zone));
    }
    if (o.availability === 'UPCOMING' && o.dates.enrollmentOpensAt) {
      return this.t.summary.enrollmentFrom(shortDate(o.dates.enrollmentOpensAt, zone));
    }
    return null;
  });

  /** "Sáb y dom · 10:00–13:00" y la tabla de zonas (con la de quien visita). */
  protected readonly schedule = computed(() => {
    const schedule = this.offer().schedule;
    if (!schedule) return null;
    const days = weekdaysLabel(schedule.weekdays);
    const heading = `${days ? `${days} · ` : ''}${schedule.startTime}–${schedule.endTime}`;
    const first = schedule.firstSession;
    if (!first) return { heading, rows: [] };
    const visitor = this.timezone();
    const visitorOffset = utcOffset(first.startsAt, visitor);
    const range = (zone: string) => `${time(first.startsAt, zone)}–${time(first.endsAt, zone)}`;
    const rows = SCHEDULE_ZONES.map((zone) => ({
      label: zone.label as string,
      time: range(zone.timeZone),
      mine: utcOffset(first.startsAt, zone.timeZone) === visitorOffset,
      extra: false,
    }));
    // Una sola fila resaltada; si su zona no está, se agrega al final.
    const mine = rows.findIndex((row) => row.mine);
    const marked = rows.map((row, i) => ({ ...row, mine: i === mine }));
    if (mine < 0 && visitor !== CDMX) {
      marked.push({
        label: this.t.summary.otherZone(zoneName(visitor)),
        time: range(visitor),
        mine: true,
        extra: true,
      });
    }
    return { heading, rows: marked };
  });

  protected readonly venueLine = computed(() => {
    const venue = this.offer().venue;
    return venue ? [venue.address, venue.city].filter(Boolean).join(', ') : '';
  });

  protected readonly price = computed(() => {
    const o = this.offer();
    const pricing = o.pricing;
    if (pricing.kind === 'FREE') return { amount: this.t.summary.free, detail: null };
    if (pricing.kind === 'EXTERNAL_ENROLLMENT')
      return { amount: this.t.summary.external, detail: null };
    if (!pricing.price) return { amount: this.t.summary.toConfirm, detail: null };
    const parts: string[] = [];
    if (o.modules.length > 1) {
      parts.push(
        this.t.summary.perModule(
          formatMoney({
            amountCents: Math.round(pricing.price.amountCents / o.modules.length),
            currency: pricing.price.currency,
          }),
        ),
      );
    }
    if (pricing.installments)
      parts.push(this.t.summary.installments(pricing.installments.maxInstallments));
    const detail = parts.length ? `${parts.join(' o ')}.` : null;
    return {
      amount: formatMoney(pricing.price),
      detail: detail && detail[0].toUpperCase() + detail.slice(1),
    };
  });

  protected readonly scholarship = computed(() => {
    const details = this.offer().scholarshipDetails;
    if (!details) return null;
    const zone = this.timezone();
    const window =
      details.windowStatus === 'OPEN' && details.closesAt
        ? this.t.scholarship.until(shortDate(details.closesAt, zone))
        : details.windowStatus === 'UPCOMING' && details.opensAt
          ? this.t.scholarship.opens(shortDate(details.opensAt, zone))
          : details.windowStatus === 'CLOSED'
            ? this.t.scholarship.closed
            : null;
    const types = details.scholarshipTypes.map((t) => ({
      label: `${t.scholarshipType.name} ${percentRange(t.scholarshipType.minPercent, t.scholarshipType.maxPercent)}${t.scholarshipType.requiresInterview ? '*' : ''}`,
      full: t.isFull,
    }));
    const interview = details.scholarshipTypes
      .filter((t) => t.scholarshipType.requiresInterview)
      .map((t) => t.scholarshipType.name);
    return {
      window,
      types,
      interview: interview.length ? this.t.scholarship.interview(interview.join(', ')) : null,
    };
  });

  private readonly actionViews = computed<ActionView[]>(() => {
    const o = this.offer();
    return o.actions.map((action) => ({
      type: action.type,
      label: this.t.actions[action.type],
      href: portalActionUrl(o.slug, action.type),
      enabled: action.enabled,
      primary: action.primary,
      note: action.enabled
        ? null
        : action.availableFrom
          ? this.t.availableFrom(shortDate(action.availableFrom, this.timezone()))
          : action.reason
            ? this.t.reasons[action.reason]
            : null,
    }));
  });
  /** La de beca va dentro de su bloque; el resto, al pie (la principal rellena). */
  protected readonly scholarshipAction = computed(
    () => this.actionViews().find((a) => a.type === 'APPLY_SCHOLARSHIP') ?? null,
  );
  protected readonly actions = computed(() =>
    this.actionViews().filter((a) => !(a.type === 'APPLY_SCHOLARSHIP' && this.scholarship())),
  );
}
