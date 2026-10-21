import { HttpContext, HttpContextToken } from '@angular/common/http';

/** La petición no muestra el loader general (p. ej. búsquedas en segundo plano). */
export const SKIP_GLOBAL_LOADER = new HttpContextToken<boolean>(() => false);

/** Ruta pública: no se adjunta el token ni se intenta renovar la sesión. */
export const PUBLIC_REQUEST = new HttpContextToken<boolean>(() => false);

/** Contexto para una ruta pública de la API. */
export const publicRequest = (context = new HttpContext()) => context.set(PUBLIC_REQUEST, true);

/** Contexto para una petición sin loader general. */
export const silentRequest = (context = new HttpContext()) => context.set(SKIP_GLOBAL_LOADER, true);
