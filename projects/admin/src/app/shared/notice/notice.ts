import { Component, DestroyRef, effect, inject, input, model, untracked } from '@angular/core';

/**
 * Aviso del resultado de una acción ("Se borró a…"). Se cierra solo tras
 * `duration` ms o con la X; mientras el mouse o el foco están encima, la
 * cuenta se pausa para dar tiempo a leerlo. La región `role="status"` está
 * siempre en la página para que cada aviso se anuncie.
 *
 * ```html
 * <adm-notice [(message)]="notice" />
 * ```
 */
@Component({
  selector: 'adm-notice',
  template: `
    <div class="live" role="status">
      @if (message()) {
        <div
          class="adm-notice notice"
          (mouseenter)="pause()"
          (mouseleave)="resume()"
          (focusin)="pause()"
          (focusout)="resume()"
        >
          <p class="notice__text">{{ message() }}</p>
          <button type="button" class="notice__close" aria-label="Cerrar aviso" (click)="close()">
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .notice {
      display: flex;
      align-items: flex-start;
      gap: var(--space-2);
      @media (prefers-reduced-motion: no-preference) {
        animation: notice-in 0.2s ease-out;
      }
    }
    .notice__text {
      flex: 1;
      min-width: 0;
      padding-top: 2px;
    }
    .notice__close {
      display: grid;
      flex: none;
      place-items: center;
      width: 32px;
      height: 32px;
      margin: -4px -4px -4px 0;
      border: 0;
      border-radius: 50%;
      background: none;
      color: var(--color-primary);
      cursor: pointer;
    }
    .notice__close:hover {
      background-color: color-mix(in srgb, var(--color-primary) 12%, transparent);
    }
    @keyframes notice-in {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
    }
  `,
})
export class Notice {
  readonly message = model('');
  /** Tiempo visible (ms); `0` = hasta que se cierre. */
  readonly duration = input(6000);

  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Cada aviso nuevo reinicia la cuenta.
    effect(() => {
      if (this.message()) {
        untracked(() => this.resume());
      } else {
        this.stop();
      }
    });
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  protected close(): void {
    this.message.set('');
  }

  protected pause(): void {
    this.stop();
  }

  protected resume(): void {
    this.stop();
    if (this.duration() > 0 && this.message()) {
      this.timer = setTimeout(() => this.close(), this.duration());
    }
  }

  private stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
