import { Routes } from '@angular/router';

/** Bandeja de Contacto (permiso `contact.read`; cambiar estado o nota requiere `contact.manage`). */
const routes: Routes = [
  {
    path: '',
    title: 'Mensajes · Administrador',
    loadComponent: () => import('./contact-inbox-page'),
  },
  {
    path: ':id',
    title: 'Mensaje · Administrador',
    loadComponent: () => import('./message/contact-message-page'),
  },
];

export default routes;
