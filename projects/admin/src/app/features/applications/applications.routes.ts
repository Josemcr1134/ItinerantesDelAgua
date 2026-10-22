import { Routes } from '@angular/router';

/** Postulaciones (permiso `applications.read`). */
const routes: Routes = [
  {
    path: '',
    title: 'Postulaciones · Administrador',
    loadComponent: () => import('./list/applications-page'),
  },
  {
    path: ':id',
    title: 'Postulación · Administrador',
    loadComponent: () => import('./detail/application-detail-page'),
  },
];

export default routes;
