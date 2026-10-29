import { Permission } from 'data-access';

export type NavIcon =
  | 'home'
  | 'calendar'
  | 'offers'
  | 'teachers'
  | 'scholarships'
  | 'applications'
  | 'follow-up'
  | 'payments'
  | 'contact'
  | 'accounts'
  | 'users'
  | 'site'
  | 'audit';

export interface NavItem {
  readonly label: string;
  readonly path: string;
  readonly icon: NavIcon;
  /** Permiso necesario para verlo (sin definir: todo el equipo). */
  readonly permission?: Permission;
  /** Activo solo con la ruta exacta. */
  readonly exact?: boolean;
  /** Contador junto al nombre (p. ej. mensajes sin leer). */
  readonly counter?: 'contact-unread';
}

/** Menú lateral del panel; cada módulo nuevo se agrega aquí con su permiso. */
export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Inicio', path: '/', icon: 'home', exact: true },
  { label: 'Oferta formativa', path: '/ofertas', icon: 'offers', permission: 'offers.read' },
  { label: 'Calendario', path: '/calendario', icon: 'calendar', permission: 'offers.read' },
  { label: 'Becas', path: '/tipos-de-beca', icon: 'scholarships', permission: 'offers.read' },
  { label: 'Docentes', path: '/docentes', icon: 'teachers', permission: 'offers.read' },
  {
    label: 'Postulaciones',
    path: '/postulaciones',
    icon: 'applications',
    permission: 'applications.read',
  },
  {
    label: 'Seguimiento',
    path: '/seguimiento',
    icon: 'follow-up',
    permission: 'followup.read',
  },
  { label: 'Pagos', path: '/pagos', icon: 'payments', permission: 'payments.read' },
  {
    label: 'Mensajes',
    path: '/mensajes',
    icon: 'contact',
    permission: 'contact.read',
    counter: 'contact-unread',
  },
  { label: 'Usuarios', path: '/usuarios', icon: 'accounts', permission: 'users.manage' },
  { label: 'Administradores', path: '/administradores', icon: 'users', permission: 'users.manage' },
  { label: 'Página web', path: '/pagina-web', icon: 'site', permission: 'site.write' },
  { label: 'Auditoría', path: '/auditoria', icon: 'audit', permission: 'audit.read' },
];
