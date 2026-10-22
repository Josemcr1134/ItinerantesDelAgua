import { Routes } from '@angular/router';

/** Postulaciones (permiso `applications.read`). */
const routes: Routes = [
  {
    path: '',
    title: 'Postulaciones · Administrador',
    loadComponent: () => import('./list/applications-page'),
  },
];

export default routes;
