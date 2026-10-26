/** Ícono de cada sección del menú lateral (Figma HU-06). */
export type NavIcon = 'dashboard' | 'formation' | 'library' | 'calendar' | 'calls' | 'scholarships';

export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: NavIcon;
  /** Activo solo con la ruta exacta. */
  readonly exact?: boolean;
  /** Sub-ítems: el ítem se despliega (Formación → Diplomados, Cursos, Talleres). */
  readonly children?: readonly NavChild[];
}

export interface NavChild {
  readonly label: string;
  readonly path: string;
}

/** Menú lateral del portal, en el orden del Figma. */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', path: '/', icon: 'dashboard', exact: true },
  {
    label: 'Formación',
    path: '/formacion',
    icon: 'formation',
    children: [
      { label: 'Diplomados', path: '/formacion/diplomados' },
      { label: 'Cursos', path: '/formacion/cursos' },
      { label: 'Talleres', path: '/formacion/talleres' },
    ],
  },
  { label: 'Biblioteca', path: '/biblioteca', icon: 'library' },
  { label: 'Calendario', path: '/calendario', icon: 'calendar' },
  { label: 'Convocatorias', path: '/convocatorias', icon: 'calls' },
  { label: 'Becas', path: '/becas', icon: 'scholarships' },
];
