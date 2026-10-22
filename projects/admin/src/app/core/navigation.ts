import { Permission } from 'data-access';

export type NavIcon = 'home' | 'users';

export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: NavIcon;
  /** Permiso necesario para verlo (sin definir: todo el equipo). */
  readonly permission?: Permission;
  /** Activo solo con la ruta exacta. */
  readonly exact?: boolean;
}

/** Menú lateral del panel; cada módulo nuevo se agrega aquí con su permiso. */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Inicio', path: '/', icon: 'home', exact: true },
];
