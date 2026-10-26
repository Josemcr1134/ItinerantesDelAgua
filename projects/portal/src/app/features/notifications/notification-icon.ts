import { Component, input } from '@angular/core';
import { NotificationCategory } from 'data-access';

/** Ícono de cada grupo (trazo de 24 px con el color del texto); General es una gota. */
@Component({
  selector: 'portal-notification-icon',
  template: `
    <svg
      aria-hidden="true"
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      @switch (category()) {
        @case ('TRAINING') {
          <path
            d="M5 13.18V16a2 2 0 0 0 1.04 1.75l5 2.73a2 2 0 0 0 1.92 0l5-2.73A2 2 0 0 0 19 16v-2.82M21 10.09l-8.04 4.39a2 2 0 0 1-1.92 0L2.61 9.88a1 1 0 0 1 0-1.76l8.43-4.6a2 2 0 0 1 1.92 0l9.52 5.19a1 1 0 0 1 .52.88V16"
          />
        }
        @case ('APPLICATIONS') {
          <path
            d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2ZM9 14l2 2 4-4"
          />
        }
        @case ('PAYMENTS') {
          <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
          <path d="M2.5 10h19M6.5 15h4" />
        }
        @default {
          <path d="M12 3.5s6 6.4 6 10.9a6 6 0 0 1-12 0c0-4.5 6-10.9 6-10.9Z" />
          <path d="M9.5 15a2.5 2.5 0 0 0 2.5 2.5" />
        }
      }
    </svg>
  `,
  styles: ':host { display: inline-grid; }',
})
export class NotificationIcon {
  readonly category = input.required<NotificationCategory>();
  readonly size = input(22);
}
