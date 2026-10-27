/**
 * `?returnUrl=` que viaja por login, registro y verificación del correo (p. ej.
 * la inscripción desde la ficha de la landing). Solo rutas internas del
 * Portal, para evitar redirecciones a otros sitios; si no, `null`.
 */
export function safeReturnUrl(url: string | null | undefined): string | null {
  return url && url.startsWith('/') && !url.startsWith('//') ? url : null;
}

/** Query params con el regreso (o sin él), para los enlaces entre pantallas. */
export const returnParams = (url: string | null | undefined) => {
  const safe = safeReturnUrl(url);
  return safe ? { returnUrl: safe } : {};
};
