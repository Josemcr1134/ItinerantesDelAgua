import { computed, DestroyRef, inject, Signal, signal } from '@angular/core';

export interface Countdown {
  /** Segundos que faltan (0 al terminar). */
  readonly remaining: Signal<number>;
  start(until: string | Date): void;
}

/** Cuenta regresiva en segundos (p. ej. "Reenviar en 0:30"). */
export function countdown(): Countdown {
  const target = signal(0);
  const now = signal(Date.now());
  let timer: ReturnType<typeof setInterval> | null = null;
  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };
  inject(DestroyRef).onDestroy(stop);

  const remaining = computed(() => Math.max(0, Math.ceil((target() - now()) / 1000)));
  return {
    remaining,
    start(until) {
      stop();
      target.set(new Date(until).getTime());
      now.set(Date.now());
      timer = setInterval(() => {
        now.set(Date.now());
        if (remaining() === 0) {
          stop();
        }
      }, 1000);
    },
  };
}
