import { Component, computed, inject } from '@angular/core';
import { AuthService, SessionStore } from 'auth';
import { Button } from 'ui-kit';

/** Inicio del portal (provisional hasta tener su diseño): saludo y cerrar sesión. */
@Component({
  selector: 'portal-home-page',
  imports: [Button],
  template: `
    <main class="home">
      <h1 class="home__title">Hola, {{ firstName() }}</h1>
      <button uiButton type="button" variant="secondary" (click)="auth.logout()">
        Cerrar sesión
      </button>
    </main>
  `,
  styles: `
    .home {
      display: grid;
      place-content: center;
      justify-items: center;
      gap: var(--space-4);
      min-height: 100dvh;
      padding: var(--space-4);
    }
    .home__title {
      color: var(--color-primary);
      font-size: 2rem;
      font-weight: 600;
    }
  `,
})
export default class HomePage {
  protected readonly auth = inject(AuthService);
  private readonly session = inject(SessionStore);

  protected readonly firstName = computed(() => this.session.user()?.fullName.split(' ')[0] ?? '');
}
