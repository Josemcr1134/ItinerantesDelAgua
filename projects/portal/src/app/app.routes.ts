import { Routes } from '@angular/router';
import { authGuard, authRoutes, guestGuard } from 'auth';
import { PageSeo } from './core/seo/portal-seo';
import { formationTypeMatch } from './features/formation/formation-options';

// TODO(contenido): confirmar las descripciones para buscadores.
/** Secciones del menú aún sin pantalla: [ruta, nombre]. */
const SECTIONS: readonly (readonly [string, string])[] = [
  ['convocatorias', 'Convocatorias'],
  ['becas', 'Becas'],
  ['perfil', 'Mi perfil'],
];

const LOGIN_SEO: PageSeo = {
  description: 'Ingresa al Portal de la Escuela Itinerante del Agua con tu correo y contraseña.',
  index: true,
};
const REGISTER_SEO: PageSeo = {
  description:
    'Crea tu cuenta en el Portal de la Escuela Itinerante del Agua para postularte a su oferta formativa.',
  index: true,
};

export const routes: Routes = [
  // Login propio del portal (Figma HU-04); el resto de las rutas de acceso son las compartidas.
  {
    path: 'login',
    title: 'Ingresar al Portal · Itinerantes del Agua',
    data: { seo: LOGIN_SEO },
    canActivate: [guestGuard],
    loadComponent: () => import('./features/access/login/login-page'),
  },
  ...authRoutes.filter((route) => route.path !== 'login'),
  {
    path: 'registro',
    title: 'Crear cuenta en el Portal · Itinerantes del Agua',
    data: { seo: REGISTER_SEO },
    canActivate: [guestGuard],
    loadComponent: () => import('./features/access/register/register-page'),
  },
  {
    path: 'verificar-correo',
    title: 'Verificar correo · Itinerantes del Agua',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/access/verify-email/verify-email-page'),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/portal-shell/portal-shell'),
    children: [
      {
        path: '',
        title: 'Dashboard · Portal',
        loadComponent: () => import('./features/dashboard/dashboard-page'),
      },
      {
        path: 'calendario',
        title: 'Calendario · Portal',
        loadComponent: () => import('./features/calendar/calendar-page'),
      },
      {
        path: 'biblioteca',
        title: 'Biblioteca · Portal',
        loadComponent: () => import('./features/library/library-page'),
      },
      {
        path: 'formacion',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'diplomados' },
          {
            path: 'aula/:offerId',
            title: 'Aula · Portal',
            data: { section: 'Aula' },
            loadComponent: () => import('./features/coming-soon/coming-soon-page'),
          },
          {
            path: ':tipo',
            title: 'Formación · Portal',
            canMatch: [formationTypeMatch],
            loadComponent: () => import('./features/formation/formation-page'),
          },
        ],
      },
      // TODO: cada sección reemplaza este marcador al tener su pantalla.
      ...SECTIONS.map(([path, section]) => ({
        path,
        title: `${section} · Portal`,
        data: { section },
        loadComponent: () => import('./features/coming-soon/coming-soon-page'),
      })),
    ],
  },
  { path: '**', redirectTo: '' },
];
