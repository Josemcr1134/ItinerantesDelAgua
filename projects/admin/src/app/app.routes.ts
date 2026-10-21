import { Routes } from '@angular/router';
import { authGuard, authRoutes } from 'auth';
import { environment } from '../environments/environment';

/** Rutas solo de desarrollo: catálogo visual de componentes. */
const devRoutes: Routes = environment.production
  ? []
  : [{ path: 'ui', loadComponent: () => import('./dev/ui-demo/ui-demo') }];

export const routes: Routes = [
  ...authRoutes,
  ...devRoutes,
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/admin-shell/admin-shell'),
    children: [
      {
        path: '',
        title: 'Inicio · Administrador',
        loadComponent: () => import('./pages/home/home'),
      },
      // TODO: módulos del administrador (lazy) cuando se definan.
    ],
  },
  { path: '**', redirectTo: '' },
];
