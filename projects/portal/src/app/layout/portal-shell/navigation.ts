/** Ícono de cada sección del menú lateral (Figma HU-06). */
export type NavIcon = 'dashboard' | 'formation' | 'library' | 'calendar' | 'calls' | 'scholarships';

export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: NavIcon;
  /** Activo solo con la ruta exacta. */
  readonly exact?: boolean;
}

/** Menú lateral del portal, en el orden del Figma. */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', path: '/', icon: 'dashboard', exact: true },
  { label: 'Formación', path: '/formacion', icon: 'formation' },
  { label: 'Biblioteca', path: '/biblioteca', icon: 'library' },
  { label: 'Calendario', path: '/calendario', icon: 'calendar' },
  { label: 'Convocatorias', path: '/convocatorias', icon: 'calls' },
  { label: 'Becas', path: '/becas', icon: 'scholarships' },
];
