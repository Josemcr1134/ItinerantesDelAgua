import { Routes } from '@angular/router';
import { environment } from '../environments/environment';

/** Rutas solo de desarrollo: catálogo visual de componentes. */
const devRoutes: Routes = environment.production
  ? []
  : [{ path: 'ui', loadComponent: () => import('./dev/ui-demo/ui-demo') }];

// TODO: módulos del administrador (lazy) cuando se definan.
export const routes: Routes = [...devRoutes];
