import { SiteMetricDto } from 'data-access';
import { IMPACT_STATS_CONTENT } from '../../content/impact-stats.content';
import { applySiteMetrics } from './site-metrics';

const metric = (m: Partial<SiteMetricDto> & Pick<SiteMetricDto, 'key'>): SiteMetricDto => ({
  label: '',
  value: 0,
  prefix: '',
  suffix: '',
  display: '',
  sortOrder: 1,
  ...m,
});

const API_METRICS: SiteMetricDto[] = [
  metric({
    key: 'WATER_LITERS_REVITALIZED',
    label: 'De agua revitaliza',
    value: 3_200_000,
    prefix: '+',
    suffix: ' L',
    display: '+3,200,000 L',
  }),
  metric({
    key: 'PEOPLE_TRAINED',
    label: 'Personas formadas',
    value: 1950,
    suffix: '+',
    display: '1,950+',
  }),
  metric({
    key: 'YOUTH_TRAINED',
    label: 'Jóvenes capacitadas y capacitados',
    value: 260,
    suffix: '+',
    display: '260+',
  }),
];

describe('applySiteMetrics', () => {
  it('sin datos de la API se queda con el contenido del diseño', () => {
    expect(applySiteMetrics(IMPACT_STATS_CONTENT, null)).toBe(IMPACT_STATS_CONTENT);
    expect(applySiteMetrics(IMPACT_STATS_CONTENT, [])).toBe(IMPACT_STATS_CONTENT);
  });

  it('pone la cifra de agua en el badge con la unidad aparte', () => {
    const result = applySiteMetrics(IMPACT_STATS_CONTENT, API_METRICS);
    expect(result.highlight).toMatchObject({
      value: '+3,200,000',
      unit: 'L',
      label: 'De agua revitaliza',
    });
  });

  it('usa las cifras visibles en su orden y conserva el diseño cuando el texto coincide', () => {
    const { stats } = applySiteMetrics(IMPACT_STATS_CONTENT, API_METRICS);
    expect(stats.map((s) => s.key)).toEqual(['PEOPLE_TRAINED', 'YOUTH_TRAINED']);
    // Mismo texto: saltos de línea y anillo del diseño.
    expect(stats[0]).toMatchObject({
      value: '1,950+',
      unit: undefined,
      label: 'Personas\nformadas',
      progress: 0.949,
    });
    // Texto editado por el equipo: se muestra el de la API.
    expect(stats[1].label).toBe('Jóvenes capacitadas y capacitados');
  });

  it('oculta el badge si la cifra de agua no es visible', () => {
    const result = applySiteMetrics(IMPACT_STATS_CONTENT, API_METRICS.slice(1));
    expect(result.highlight).toBeNull();
  });
});
