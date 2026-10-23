import { Routes } from '@angular/router';
import { authGuard, authRoutes } from 'auth';
import { environment } from '../environments/environment';
import { adminAccessGuard, permissionGuard } from './core/access/access.guards';

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
      {
        path: 'ofertas',
        canActivate: [permissionGuard('offers.read')],
        loadChildren: () => import('./features/offers/offers.routes'),
      },
      {
        path: 'calendario',
        title: 'Calendario · Administrador',
        canActivate: [permissionGuard('offers.read')],
        loadComponent: () => import('./features/calendar/calendar-page'),
      },
      {
        path: 'docentes',
        title: 'Docentes · Administrador',
        canActivate: [permissionGuard('offers.read')],
        loadComponent: () => import('./features/teachers/teachers-page'),
      },
      {
        path: 'postulaciones',
        canActivate: [permissionGuard('applications.read')],
        loadChildren: () => import('./features/applications/applications.routes'),
      },
      {
        path: 'seguimiento',
        title: 'Seguimiento · Administrador',
        canActivate: [permissionGuard('followup.read')],
        loadComponent: () => import('./features/follow-up/follow-up-page'),
      },
      {
        path: 'pagos',
        canActivate: [permissionGuard('payments.read')],
        loadChildren: () => import('./features/payments/payments.routes'),
      },
      {
        path: 'administradores',
        title: 'Administradores · Administrador',
        canActivate: [permissionGuard('users.manage')],
        loadComponent: () => import('./features/administrators/administrators-page'),
      },
      {
        path: 'pagina-web',
        title: 'Página web · Administrador',
        canActivate: [permissionGuard('site.write')],
        loadComponent: () => import('./features/site/site-page'),
      },
      {
        path: 'auditoria',
        title: 'Auditoría · Administrador',
        canActivate: [permissionGuard('audit.read')],
        loadComponent: () => import('./features/audit/audit-page'),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
