const numberFormat = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 });

/** Prefijo + número con separador de miles + sufijo ("+1,950", "12,000 L"). */
export function formatMetric(prefix: string, value: number, suffix: string): string {
  return `${prefix}${numberFormat.format(value)}${suffix}`;
}
