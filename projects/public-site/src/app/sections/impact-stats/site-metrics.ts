import { SiteMetricDto } from 'data-access';
import { ImpactStat, ImpactStatsContent } from './impact-stats-content';

/** Cifra que va en el badge destacado; el resto van en las tarjetas. */
export const HIGHLIGHT_METRIC_KEY = 'WATER_LITERS_REVITALIZED';

/** Misma frase ignorando saltos de línea, espacios y el punto final. */
const sameText = (a: string, b: string) => {
  const normalize = (s: string) => s.replace(/\s+/g, ' ').replace(/\.$/, '').trim().toLowerCase();
  return normalize(a) === normalize(b);
};

/**
 * Convierte una cifra de la API al formato de la sección. Un sufijo con
 * letras (" L") va como unidad aparte; uno de símbolos ("+") queda pegado al
 * número, como en el diseño.
 */
function toStat(metric: SiteMetricDto, design: ImpactStat | undefined): ImpactStat {
  const suffix = metric.suffix.trim();
  const isUnit = /\p{L}/u.test(suffix);
  const value = isUnit
    ? metric.display.slice(0, metric.display.length - metric.suffix.length).trim()
    : metric.display;
  return {
    key: metric.key,
    value,
    unit: isUnit ? suffix : undefined,
    // Si el texto coincide, se conservan los saltos de línea del diseño.
    label: design && sameText(design.label, metric.label) ? design.label : metric.label,
    progress: design?.progress,
  };
}

/**
 * Aplica las cifras de la API (`GET /site/metrics`) al contenido de la
 * sección. Sin datos, se queda el contenido del diseño; con datos, se
 * muestran solo las cifras visibles y en el orden de la API.
 */
export function applySiteMetrics(
  content: ImpactStatsContent,
  metrics: readonly SiteMetricDto[] | null,
): ImpactStatsContent {
  if (!metrics?.length) {
    return content;
  }
  const design = [content.highlight, ...content.stats].filter((s): s is ImpactStat => !!s);
  const byKey = (key: string) => design.find((stat) => stat.key === key);
  const highlight = metrics.find((m) => m.key === HIGHLIGHT_METRIC_KEY);
  return {
    ...content,
    highlight: highlight ? toStat(highlight, byKey(highlight.key)) : null,
    stats: metrics
      .filter((m) => m.key !== HIGHLIGHT_METRIC_KEY)
      .map((metric) => toStat(metric, byKey(metric.key))),
  };
}
