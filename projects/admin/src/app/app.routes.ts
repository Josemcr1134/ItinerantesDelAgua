import { Routes } from '@angular/router';
import { authGuard, authRoutes } from 'auth';
import { environment } from '../environments/environment';
import { adminAccessGuard } from './core/access/access.guards';

/** Rutas solo de desarrollo: catálogo visual de componentes. */
const devRoutes: Routes = environment.production
  ? []
  : [{ path: 'ui', loadComponent: () => import('./dev/ui-demo/ui-demo') }];

export const routes: Routes = [
  ...authRoutes,
  ...devRoutes,
  {
    path: '',
    // Primero la sesión; después el acceso al panel (`GET /admin/me`).
    canActivate: [authGuard, adminAccessGuard],
    loadComponent: () => import('./layout/admin-shell/admin-shell'),
    children: [
      {
        path: '',
        title: 'Inicio · Administrador',
        loadComponent: () => import('./pages/home/home'),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
