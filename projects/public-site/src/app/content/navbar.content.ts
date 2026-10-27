import { environment } from '../../environments/environment';
import { NavbarContent } from '../layout/navbar/navbar-content';
import { PAGE_PATHS } from './page-paths';
import { SECTION_IDS } from './section-ids';

/** Registro en el Portal (otra app); sin su dominio configurado queda en "#". */
const registerHref = environment.portalUrl ? new URL('/registro', environment.portalUrl).href : '#';

export const NAVBAR_CONTENT: NavbarContent = {
  logo: {
    src: 'assets/images/logoGreen.webp',
    alt: 'Itinerantes del Agua, ir al inicio',
  },
  // Con "/" delante funcionan también desde otras páginas (p. ej. el catálogo).
  homeHref: `/#${SECTION_IDS.hero}`,
  navLabel: 'Navegación principal',
  links: [
    { label: 'Objetivos', href: `/#${SECTION_IDS.objectives}` },
    { label: 'Nuestra trayectoria', href: `/#${SECTION_IDS.trajectory}` },
    { label: 'Escuela Itinerante del Agua', href: `/#${SECTION_IDS.areas}` },
    { label: 'Catálogo', href: PAGE_PATHS.catalog },
    // La sección de contacto está en todas las páginas (cierre antes del footer).
    { label: 'Contacto', href: `#${SECTION_IDS.contact}` },
  ],
  cta: {
    label: 'Regístrate',
    href: registerHref,
  },
  menuOpenLabel: 'Abrir menú',
  menuCloseLabel: 'Cerrar menú',
};
