import { CanDeactivateFn, Routes } from '@angular/router';
import { permissionGuard } from '../../core/access/access.guards';
import type OfferEditorPage from './editor/offer-editor-page';

/** Confirma antes de salir del asistente con cambios sin guardar. */
const confirmLeaveEditor: CanDeactivateFn<OfferEditorPage> = (page) => page.confirmLeave();

/** Oferta formativa (permiso `offers.read`; editar requiere `offers.write`). */
const routes: Routes = [
  {
    path: '',
    title: 'Oferta formativa · Administrador',
    loadComponent: () => import('./list/offers-list-page'),
  },
  {
    path: ':id/contenido',
    title: 'Contenido del aula · Administrador',
    loadComponent: () => import('./content/content-page'),
  },
  {
    path: ':id/asistencia',
    title: 'Asistencia · Administrador',
    canActivate: [permissionGuard('attendance.read')],
    loadComponent: () => import('./attendance/attendance-page'),
  },
  {
    path: ':id/moodle',
    title: 'Acceso Moodle · Administrador',
    loadComponent: () => import('./moodle/moodle-page'),
  },
  {
    path: ':id/sesiones',
    title: 'Sesiones · Administrador',
    loadComponent: () => import('./sessions/sessions-page'),
  },
  {
    path: ':id',
    title: 'Editar oferta · Administrador',
    loadComponent: () => import('./editor/offer-editor-page'),
    canDeactivate: [confirmLeaveEditor],
  },
];

export default routes;
