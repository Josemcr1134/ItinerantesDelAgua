import { computed, Injectable, signal } from '@angular/core';

/**
 * Peticiones en curso para el loader general. Lo alimenta
 * `loadingInterceptor`; también puede usarse para tareas propias con `track`.
 */
@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly pending = signal(0);

  /** Hay al menos una petición en curso. */
  readonly isLoading = computed(() => this.pending() > 0);

  start(): void {
    this.pending.update((n) => n + 1);
  }

  stop(): void {
    this.pending.update((n) => Math.max(0, n - 1));
  }

  /** Ejecuta una promesa mostrando el loader general mientras dura. */
  async track<T>(task: Promise<T>): Promise<T> {
    this.start();
    try {
      return await task;
    } finally {
      this.stop();
    }
  }
}
