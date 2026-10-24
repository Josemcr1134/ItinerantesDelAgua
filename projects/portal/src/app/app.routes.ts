import { Routes } from '@angular/router';
import { authGuard, authRoutes, guestGuard } from 'auth';

export const routes: Routes = [
  // Login propio del portal (Figma HU-04); el resto de las rutas de acceso son las compartidas.
  {
    path: 'login',
    title: 'Ingresar al Portal · Itinerantes del Agua',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/access/login/login-page'),
  },
  ...authRoutes.filter((route) => route.path !== 'login'),
  {
    path: 'registro',
    title: 'Crear cuenta · Itinerantes del Agua',
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
