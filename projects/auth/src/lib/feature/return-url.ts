/** `returnUrl` si es una ruta interna (evita redirecciones abiertas); si no, `fallback`. */
export function safeReturnUrl(url: string | null | undefined, fallback: string): string {
  return url && url.startsWith('/') && !url.startsWith('//') ? url : fallback;
}
