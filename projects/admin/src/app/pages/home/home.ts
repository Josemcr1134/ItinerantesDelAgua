import { Component, computed, inject } from '@angular/core';
import { SessionStore } from 'auth';

/** Inicio del administrador (provisional hasta definir los módulos). */
@Component({
  selector: 'adm-home',
  template: `
    <h1 class="title">Hola, {{ firstName() }}</h1>
    <p class="text">Aquí aparecerán los módulos del administrador.</p>
  `,
  styles: `
    .title {
      color: var(--color-primary);
      font-family: var(--font-family-display);
      font-size: 3rem;
      text-transform: uppercase;
    }
    .text {
      margin-top: var(--space-2);
      color: var(--color-primary);
    }
  `,
})
export default class Home {
  private readonly user = inject(SessionStore).user;
  protected readonly firstName = computed(() => this.user()?.fullName.split(' ')[0] ?? '');
}
