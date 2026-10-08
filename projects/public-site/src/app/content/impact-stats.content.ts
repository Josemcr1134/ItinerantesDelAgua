import { ImpactStatsContent } from '../sections/impact-stats/impact-stats-content';

// Copy y valores tomados del Figma aprobado (Landing Desktop).
export const IMPACT_STATS_CONTENT: ImpactStatsContent = {
  heading: 'Soñamos con ríos libres y limpios.',
  divider: { src: 'assets/images/whiteLine.svg', alt: '' },
  highlight: { value: '+3,000,000', unit: 'L', label: 'De agua revitaliza' },
  highlightOutline: { src: 'assets/images/badgeOutline.svg', alt: '' },
  stats: [
    { value: '1800+', label: 'Personas\nformadas', progress: 0.949 },
    {
      value: '12+',
      label: 'Territorios\nacompañados en México\ny Centroamérica',
      progress: 0.396,
    },
    { value: '250+', label: 'Jóvenes\ncapacitados.', progress: 0.85 },
  ],
  cardShape: { src: 'assets/images/statCard.svg', alt: '' },
};
