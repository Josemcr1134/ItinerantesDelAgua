import { Routes } from '@angular/router';
import { Home } from './pages/home/home';

// La landing se carga sin lazy loading: es la ruta inicial y se prerenderizará.
export const routes: Routes = [
  { path: '', component: Home },
  { path: '**', redirectTo: '' },
];
