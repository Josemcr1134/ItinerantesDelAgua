import { Component, computed, effect, inject, input, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AdminDashboardApi,
  AdminDashboardDto,
  AdminDashboardTrendsDto,
  CurrencyTotalsDto,
  requestState,
  TopOfferDto,
} from 'data-access';
import { AdminAccess } from '../../core/access/admin-access';
import { RequestState } from '../../shared/request-state/request-state';
import {
  APPLICATION_KIND_LABELS,
  APPLICATION_STATUS_LABELS,
} from '../applications/application-labels';
import { OFFER_TYPE_LABELS } from '../offers/offer-labels';
import { BarItem, BarList } from './charts/bar-list';
import { ChartSeries, ColumnChart } from './charts/column-chart';
import { formatCount } from './charts/chart-scale';
import { StackedBar, StackSegment } from './charts/stacked-bar';
import { DashboardCard, DashboardMetric } from './dashboard-card';
import { DashboardHero } from './dashboard-hero';
import { DashboardTasks } from './dashboard-tasks';
import {
  DEFAULT_PERIOD,
  ENROLLMENT_SOURCE_LABELS,
  ENROLLMENT_STATES,
  PERIODS,
  SERIES_COLORS,
} from './dashboard-labels';

const countryNames = new Intl.DisplayNames('es', { type: 'region' });
// Los meses de las series ("2026-10") ya vienen en hora de CDMX.
const shortMonth = new Intl.DateTimeFormat('es-MX', { month: 'short', timeZone: 'UTC' });
const longMonth = new Intl.DateTimeFormat('es-MX', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
const monthDate = (month: string) => {
  const [year, index] = month.split('-').map(Number);
  return new Date(Date.UTC(year, index - 1, 1));
};

const moneyFormats = new Map<string, { full: Intl.NumberFormat; compact: Intl.NumberFormat }>();
function moneyFormat(currency: string) {
  let format = moneyFormats.get(currency);
  if (!format) {
    const base = { style: 'currency', currency, currencyDisplay: 'narrowSymbol' } as const;
    format = {
      full: new Intl.NumberFormat('es-MX', { ...base, maximumFractionDigits: 0 }),
      compact: new Intl.NumberFormat('es-MX', { ...base, notation: 'compact' }),
    };
    moneyFormats.set(currency, format);
  }
  return format;
}

/** Ocupación de una oferta con cupo (verde; oro casi lleno; terracota lleno). */
interface Occupancy {
  readonly percent: number;
  readonly tone: 'ok' | 'warning' | 'full';
  readonly text: string;
}

/**
 * Inicio del panel (Fase 08): saludo con el periodo, pendientes que llevan a
 * su pantalla, una tarjeta por bloque (sin permiso el bloque llega en `null`
 * y no se pinta) y gráficas: evolución por mes, neto cobrado por moneda,
 * inscripciones, postulaciones, ofertas con más inscripciones y países.
 * Periodo y meses en la URL (`?periodo=7|30|90|365&meses=6|12`).
 */
@Component({
  selector: 'adm-dashboard-page',
  imports: [
    RouterLink,
    RequestState,
    DashboardHero,
    DashboardTasks,
    DashboardCard,
    DashboardMetric,
    ColumnChart,
    BarList,
    StackedBar,
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export default class DashboardPage {
  /** Días del resumen (30 por defecto). */
  readonly periodo = input<string>();
  /** Meses de las series (6 por defecto). */
  readonly meses = input<string>();

  private readonly api = inject(AdminDashboardApi);
  protected readonly access = inject(AdminAccess);

  protected readonly overview = requestState<AdminDashboardDto>();
  protected readonly trends = requestState<AdminDashboardTrendsDto>();

  protected readonly firstName = computed(
    () => this.access.me()?.user.fullName.split(' ')[0] ?? '',
  );

  protected readonly period = computed(
    () =>
      PERIODS.find((p) => String(p.days) === this.periodo()) ??
      PERIODS.find((p) => p.days === DEFAULT_PERIOD)!,
  );
  protected readonly months = computed(() => (this.meses() === '12' ? 12 : 6));

  protected readonly typeLabels = OFFER_TYPE_LABELS;
  protected readonly count = formatCount;

  constructor() {
    effect(() => {
      const days = this.period().days;
      untracked(() => this.loadOverview(days));
    });
    effect(() => {
      const months = this.months();
      untracked(() => void this.trends.run(this.api.trends(months)));
    });
  }

  protected loadOverview(days = this.period().days): void {
    // Sin `from` la API usa los últimos 30 días hasta ahora.
    const from =
      days === DEFAULT_PERIOD ? undefined : new Date(Date.now() - days * 86_400_000).toISOString();
    void this.overview.run(this.api.overview(from ? { from } : {}));
  }

  protected reloadTrends(): void {
    void this.trends.run(this.api.trends(this.months()));
  }

  // --- Tarjetas ---
  protected net(currency: CurrencyTotalsDto): string {
    return moneyFormat(currency.currency).full.format(currency.net.amountCents / 100);
  }

  protected readonly paymentsCount = computed(
    () =>
      this.overview.data()?.payments?.currencies.reduce((sum, c) => sum + c.paymentCount, 0) ?? 0,
  );

  // --- Gráficas ---
  protected readonly trendView = computed(() => {
    const months = this.trends.data()?.months;
    if (!months?.length) return null;
    const dates = months.map((m) => monthDate(m.month));
    const series: ChartSeries[] = [
      {
        name: 'Personas nuevas',
        color: SERIES_COLORS[0],
        values: months.map((m) => m.newParticipants),
      },
    ];
    if (months.every((m) => m.newEnrollments !== null)) {
      series.push({
        name: 'Inscripciones',
        color: SERIES_COLORS[1],
        values: months.map((m) => m.newEnrollments ?? 0),
      });
    }
    if (months.every((m) => m.submittedApplications !== null)) {
      series.push({
        name: 'Postulaciones',
        color: SERIES_COLORS[2],
        values: months.map((m) => m.submittedApplications ?? 0),
      });
    }
    // Una gráfica por moneda (cada una con su escala; nunca se suman).
    const money = months.every((m) => m.netMxnCents !== null && m.netUsdCents !== null)
      ? (['MXN', 'USD'] as const).map((currency) => {
          const format = moneyFormat(currency);
          return {
            currency,
            format: (value: number) => `${format.full.format(value)} ${currency}`,
            axisFormat: (value: number) => format.compact.format(value),
            series: [
              {
                name: `Neto ${currency}`,
                color: SERIES_COLORS[0],
                values: months.map(
                  (m) => ((currency === 'MXN' ? m.netMxnCents : m.netUsdCents) ?? 0) / 100,
                ),
              },
            ],
          };
        })
      : [];
    return {
      labels: dates.map((d) => shortMonth.format(d).replace('.', '')),
      fullLabels: dates.map((d) => longMonth.format(d)),
      series,
      money,
    };
  });

  protected readonly enrollmentSegments = computed<StackSegment[]>(() => {
    const enrollments = this.overview.data()?.training?.enrollments;
    if (!enrollments) return [];
    return ENROLLMENT_STATES.map((state, i) => ({
      label: state.label,
      value: enrollments[state.key],
      color: SERIES_COLORS[i],
    }));
  });

  protected readonly sources = computed<BarItem[]>(() =>
    (this.overview.data()?.training?.bySource ?? [])
      .filter((s) => s.count > 0)
      .sort((a, b) => b.count - a.count)
      .map((s) => ({ label: ENROLLMENT_SOURCE_LABELS[s.source], value: s.count })),
  );

  protected readonly applicationStatuses = computed<BarItem[]>(() =>
    (this.overview.data()?.applications?.byStatus ?? [])
      .filter((s) => s.count > 0)
      .map((s) => ({ label: APPLICATION_STATUS_LABELS[s.status], value: s.count })),
  );

  protected readonly applicationKinds = computed(() =>
    (this.overview.data()?.applications?.byKind ?? []).map((k) => ({
      label: APPLICATION_KIND_LABELS[k.kind],
      count: k.count,
    })),
  );

  protected readonly countries = computed<BarItem[]>(() =>
    (this.overview.data()?.people.topCountries ?? []).map((c) => ({
      label: countryNames.of(c.countryCode) ?? c.countryCode,
      value: c.count,
    })),
  );

  protected occupancy(offer: TopOfferDto): Occupancy | null {
    if (!offer.capacity) return null;
    const ratio = offer.enrolled / offer.capacity;
    return {
      percent: Math.min(ratio, 1) * 100,
      tone: ratio >= 1 ? 'full' : ratio >= 0.85 ? 'warning' : 'ok',
      text:
        ratio >= 1 ? 'Cupo lleno' : ratio >= 0.85 ? 'Casi lleno' : `${Math.round(ratio * 100)} %`,
    };
  }
}
