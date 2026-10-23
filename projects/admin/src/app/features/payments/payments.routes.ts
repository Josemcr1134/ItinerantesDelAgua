import { Routes } from '@angular/router';

/** Pagos (permiso `payments.read`; actuar requiere `payments.manage`). */
const routes: Routes = [
  {
    path: '',
    title: 'Pagos · Administrador',
    loadComponent: () => import('./payments-page'),
  },
  {
    path: 'planes/:id',
    title: 'Plan de cuotas · Administrador',
    loadComponent: () => import('./plan/plan-detail-page'),
  },
  {
    path: ':id',
    title: 'Pago · Administrador',
    loadComponent: () => import('./payment/payment-detail-page'),
  },
];

export default routes;
