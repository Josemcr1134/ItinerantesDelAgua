import { NavbarContent } from '../layout/navbar/navbar-content';
import { SECTION_IDS } from './section-ids';

export const NAVBAR_CONTENT: NavbarContent = {
  logo: {
    src: 'assets/images/logoGreen.webp',
    alt: 'Itinerantes del Agua, ir al inicio',
  },
  homeHref: `#${SECTION_IDS.hero}`,
  navLabel: 'Navegación principal',
  links: [
    { label: 'Objetivos', href: `#${SECTION_IDS.objectives}` },
    { label: 'Nuestra trayectoria', href: `#${SECTION_IDS.trajectory}` },
    { label: 'Escuela Itinerante del Agua', href: `#${SECTION_IDS.areas}` },
    { label: 'Contacto', href: `#${SECTION_IDS.contact}` },
  ],
  cta: {
    label: 'Regístrate',
    href: '#', // TODO: URL del registro del Portal Educativo (aún no desarrollado)
  },
  menuOpenLabel: 'Abrir menú',
  menuCloseLabel: 'Cerrar menú',
};
