import { ImpactStatsContent } from '../sections/impact-stats/impact-stats-content';

// Copy y valores tomados del Figma aprobado (Landing Desktop). Las cifras se
// actualizan con `GET /site/metrics` (claves `key`); estos valores se muestran
// mientras tanto o si la API no responde.
export const IMPACT_STATS_CONTENT: ImpactStatsContent = {
  heading: 'Soñamos con ríos libres y limpios.',
  divider: { src: 'assets/images/whiteLine.svg', alt: '' },
  highlight: {
    key: 'WATER_LITERS_REVITALIZED',
    value: '+3,000,000',
    unit: 'L',
    label: 'De agua revitaliza',
  },
  highlightOutline: { src: 'assets/images/badgeOutlineWide.svg', alt: '' },
  stats: [
    { key: 'PEOPLE_TRAINED', value: '1800+', label: 'Personas\nformadas', progress: 0.949 },
    {
      key: 'TERRITORIES_ACCOMPANIED',
      value: '12+',
      label: 'Territorios\nacompañados en México\ny Centroamérica',
      progress: 0.396,
    },
    { key: 'YOUTH_TRAINED', value: '250+', label: 'Jóvenes\ncapacitados.', progress: 0.85 },
  ],
  cardShape: { src: 'assets/images/statCard.svg', alt: '' },
};
