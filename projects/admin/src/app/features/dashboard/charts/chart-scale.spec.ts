import { niceTicks } from './chart-scale';

describe('niceTicks', () => {
  it('sube a un tope redondo con el paso más fino de hasta 5 tramos', () => {
    expect(niceTicks(41)).toEqual([0, 10, 20, 30, 40, 50]);
    expect(niceTicks(7)).toEqual([0, 2, 4, 6, 8]);
    expect(niceTicks(600)).toEqual([0, 200, 400, 600]);
    expect(niceTicks(91_000).at(-1)).toBe(100_000);
  });

  it('los conteos pequeños van de uno en uno y sin datos hay escala', () => {
    expect(niceTicks(3)).toEqual([0, 1, 2, 3]);
    expect(niceTicks(0)).toEqual([0, 1]);
  });
});
