import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/** Secciones del menú que aún no tienen pantalla (se reemplazan al diseñarlas). */
@Component({
  selector: 'portal-coming-soon-page',
  imports: [RouterLink],
  template: `
    <section class="soon">
      <h1 class="soon__title">{{ section() }}</h1>
      <!-- TODO(contenido): texto provisional mientras se construye la sección. -->
      <p>Esta sección está en desarrollo.</p>
      <a routerLink="/">Volver al Dashboard</a>
    </section>
  `,
  styles: `
    .soon {
      display: grid;
      justify-items: start;
      gap: var(--space-2);
      padding: var(--space-5) var(--space-4);
      border-radius: 25px;
      background-color: #fff;
      box-shadow: -18.9px 18.9px 27.3px -8.4px rgb(63 86 68 / 0.15);
    }
    .soon__title {
      color: var(--color-primary);
      font-size: 1.75rem;
      font-weight: 600;
    }
    a {
      color: var(--color-primary);
      font-weight: 600;
    }
  `,
})
export default class ComingSoonPage {
  /** Nombre de la sección (de `data.section` de la ruta). */
  readonly section = input('');
}
