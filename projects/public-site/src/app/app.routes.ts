import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

// La landing se carga sin lazy loading: es la ruta inicial y se prerenderizará.
export const routes: Routes = [
  { path: '', component: Home },
  {
    path: 'escuela/oferta',
    title: 'Oferta formativa · Itinerantes del Agua',
    loadComponent: () => import('./pages/catalog/catalog-page'),
  },
  {
    // El título lo pone la página con el nombre de la oferta.
    path: 'escuela/oferta/:slug',
    title: 'Oferta formativa · Itinerantes del Agua',
    loadComponent: () => import('./pages/offer-detail/offer-detail-page'),
  },
  { path: '**', redirectTo: '' },
];
