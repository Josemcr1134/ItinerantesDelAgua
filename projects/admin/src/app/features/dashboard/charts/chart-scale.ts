/**
 * Marcas del eje Y: de 0 a un tope "redondo" con el paso más fino (1, 2, 2.5,
 * 5 × 10ⁿ) que no pase de `maxSteps` tramos. 41 → 0, 10 … 50.
 */
export function niceTicks(max: number, maxSteps = 5): number[] {
  if (max <= 0) return [0, 1];
  const power = 10 ** Math.floor(Math.log10(max / maxSteps));
  // 2.5 solo desde las decenas (los conteos no llevan decimales).
  const step =
    [1, 2, 2.5, 5, 10]
      .map((nice) => Math.max(nice * power, 1))
      .filter((s) => Number.isInteger(s))
      .find((s) => Math.ceil(max / s) <= maxSteps) ?? 10 * power;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let tick = 0; tick <= top; tick += step) ticks.push(tick);
  return ticks;
}

const compact = new Intl.NumberFormat('es-MX', { notation: 'compact' });
const plain = new Intl.NumberFormat('es-MX');

/** 1.2 k, 45 k, 1.3 M (ejes y cifras secundarias). */
export const formatCompact = (value: number): string => compact.format(value);
/** 1,284 */
export const formatCount = (value: number): string => plain.format(value);
