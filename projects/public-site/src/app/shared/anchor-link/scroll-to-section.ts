/**
 * Hace scroll a una sección de la página (salvo `prefers-reduced-motion`) y le
 * mueve el foco, para lectores de pantalla y teclado. La sección destino debe
 * tener `tabindex="-1"` para poder recibir foco.
 */
export function scrollToSection(document: Document, target: HTMLElement): void {
  const view = document.defaultView;
  const reduceMotion = view?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? true;
  target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  target.focus({ preventScroll: true });
}
