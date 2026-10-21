import { Component, input, model } from '@angular/core';
import { AUTH_TEXTS } from '../auth-texts';

/** Botón "ver / ocultar contraseña" para colocar dentro del campo. */
@Component({
  selector: 'auth-password-toggle',
  template: `
    <button
      type="button"
      class="toggle"
      [attr.aria-label]="visible() ? texts.hide : texts.show"
      [attr.aria-pressed]="visible()"
      [attr.aria-controls]="controls()"
      (click)="visible.set(!visible())"
    >
      <svg
        aria-hidden="true"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
        @if (visible()) {
          <path d="M3 3l18 18" />
        }
      </svg>
    </button>
  `,
  styles: `
    .toggle {
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
      padding: 0;
      border: 0;
      border-radius: inherit;
      background: none;
      color: inherit;
      cursor: pointer;
    }
  `,
})
export class PasswordToggle {
  readonly visible = model(false);
  /** `id` del campo que controla. */
  readonly controls = input.required<string>();
  protected readonly texts = AUTH_TEXTS.password;
}
