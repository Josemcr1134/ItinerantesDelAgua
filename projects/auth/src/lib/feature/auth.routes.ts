import { Routes } from '@angular/router';
import { guestGuard } from '../auth.guards';

/**
 * Rutas de acceso compartidas (login, recuperar contraseña y verificar el
 * correo de una cuenta que intenta entrar sin verificarlo). Cada app las
 * incluye en su raíz: `routes = [...authRoutes, …]`.
 */
export const authRoutes: Routes = [
  {
    path: 'login',
    title: 'Iniciar sesión · Itinerantes del Agua',
    canActivate: [guestGuard],
    loadComponent: () => import('./login/login-page'),
  },
  {
    path: 'recuperar-contrasena',
    title: 'Recuperar contraseña · Itinerantes del Agua',
    canActivate: [guestGuard],
    loadComponent: () => import('./forgot-password/forgot-password-page'),
  },
  {
    path: 'verificar-correo',
    title: 'Verificar correo · Itinerantes del Agua',
    canActivate: [guestGuard],
    loadComponent: () => import('./verify-email/verify-email-page'),
  },
];
