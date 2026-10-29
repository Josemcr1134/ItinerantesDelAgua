import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { authGuard, authRoutes, guestGuard } from 'auth';
import { PageSeo } from './core/seo/portal-seo';
import { formationTypeMatch } from './features/formation/formation-options';
import { applicationRedirect } from './shared/applications/application-redirect';

// TODO(contenido): confirmar las descripciones para buscadores.
const LOGIN_SEO: PageSeo = {
  description: 'Ingresa al Portal de la Escuela Itinerante del Agua con tu correo y contraseña.',
  index: true,
};
const REGISTER_SEO: PageSeo = {
  description:
    'Crea tu cuenta en el Portal de la Escuela Itinerante del Agua para postularte a su oferta formativa.',
  index: true,
};

export const routes: Routes = [
  // Login y verificación del correo propios del portal (Figma HU-04 y HU-03); el
  // resto de las rutas de acceso son las compartidas.
  {
    path: 'login',
    title: 'Ingresar al Portal · Itinerantes del Agua',
    data: { seo: LOGIN_SEO },
    canActivate: [guestGuard],
    loadComponent: () => import('./features/access/login/login-page'),
  },
  ...authRoutes.filter((route) => route.path !== 'login' && route.path !== 'verificar-correo'),
  {
    path: 'registro',
    title: 'Crear cuenta en el Portal · Itinerantes del Agua',
    data: { seo: REGISTER_SEO },
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
    canActivate: [authGuard],
    loadComponent: () => import('./layout/portal-shell/portal-shell'),
    children: [
      {
        path: '',
        title: 'Dashboard · Portal',
        loadComponent: () => import('./features/dashboard/dashboard-page'),
      },
      {
        path: 'convocatorias',
        title: 'Convocatorias · Portal',
        loadComponent: () => import('./features/open-calls/open-calls-page'),
      },
      {
        path: 'becas',
        children: [
          {
            path: '',
            title: 'Becas · Portal',
            loadComponent: () => import('./features/scholarships/scholarships-page'),
          },
          {
            path: ':id',
            title: 'Postulación a beca · Portal',
            loadComponent: () => import('./features/scholarships/scholarship-application-page'),
          },
        ],
      },
      // Acciones de la ficha de la landing (postular, inscribirse, pagar…).
      {
        path: 'inscripcion/:slug',
        title: 'Inscripción · Portal',
        loadComponent: () => import('./features/offer-action/offer-action-page'),
      },
      {
        path: 'perfil',
        title: 'Mi perfil · Portal',
        loadComponent: () => import('./features/profile/profile-page'),
      },
      {
        path: 'notificaciones',
        title: 'Notificaciones · Portal',
        loadComponent: () => import('./features/notifications/notifications-page'),
      },
      // Enlaces de notificaciones y correos (`/portal/postulaciones/{id}[/pago]`).
      {
        path: 'postulaciones/:id',
        canActivate: [applicationRedirect],
        children: [],
      },
      // Pagar saldo (ruta de la API): a la pantalla de pago de esa postulación.
      {
        path: 'postulaciones/:id/pago',
        redirectTo: ({ params }) =>
          inject(Router).createUrlTree(['/pago'], { queryParams: { postulacion: params['id'] } }),
      },
      // Pagos (Fase 05): resumen y pago, vuelta de Stripe y Mis pagos.
      {
        path: 'pago',
        title: 'Pago · Portal',
        loadComponent: () => import('./features/payments/checkout/checkout-page'),
      },
      {
        path: 'pagos/resultado',
        title: 'Pago · Portal',
        loadComponent: () => import('./features/payments/result/payment-result-page'),
      },
      {
        path: 'perfil/pagos',
        redirectTo: ({ queryParams }) =>
          inject(Router).createUrlTree(['/perfil'], {
            queryParams: { ...queryParams, pestana: 'pagos' },
          }),
      },
      {
        path: 'asistencia/:sessionId',
        title: 'Registro de asistencia · Portal',
        loadComponent: () => import('./features/attendance/attendance-page'),
      },
      {
        path: 'calendario',
        title: 'Calendario · Portal',
        loadComponent: () => import('./features/calendar/calendar-page'),
      },
      {
        path: 'biblioteca',
        title: 'Biblioteca · Portal',
        loadComponent: () => import('./features/library/library-page'),
      },
      {
        path: 'formacion',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'diplomados' },
          {
            path: 'aula/:offerId',
            title: 'Mi aula · Portal',
            loadComponent: () => import('./features/classroom/classroom-page'),
          },
          {
            path: ':tipo',
            title: 'Formación · Portal',
            canMatch: [formationTypeMatch],
            loadComponent: () => import('./features/formation/formation-page'),
          },
        ],
      },
      // Rutas de los correos y de `action.path` de las notificaciones (backend) que
      // aquí tienen otro nombre: se redirigen conservando la query.
      {
        path: 'aula/:offerId',
        redirectTo: ({ params, queryParams }) =>
          inject(Router).createUrlTree(['/formacion/aula', params['offerId']], { queryParams }),
      },
      {
        path: 'aula/:offerId/materiales',
        redirectTo: ({ params, queryParams }) =>
          inject(Router).createUrlTree(['/formacion/aula', params['offerId']], {
            queryParams: { ...queryParams, seccion: null },
          }),
      },
      { path: 'sesiones', redirectTo: 'calendario' },
      { path: 'mi-formacion', redirectTo: 'formacion' },
      // Pagar desde la ficha: la pantalla de acciones resuelve la oferta por slug
      // (si ya pagó, lleva a su aula o a su postulación).
      {
        path: 'pagar/:slug',
        redirectTo: ({ params }) =>
          inject(Router).createUrlTree(['/inscripcion', params['slug']], {
            queryParams: { accion: 'ENROLL_AND_PAY' },
          }),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
