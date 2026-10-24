import { Routes } from '@angular/router';
import { authGuard, authRoutes, guestGuard } from 'auth';
import { PageSeo } from './core/seo/portal-seo';

// TODO(contenido): confirmar las descripciones para buscadores.
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
    title: 'Inicio · Portal',
    canActivate: [authGuard],
    loadComponent: () => import('./features/home/home-page'),
  },
  { path: '**', redirectTo: '' },
];
