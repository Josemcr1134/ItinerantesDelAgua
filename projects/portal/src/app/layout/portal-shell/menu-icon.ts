import { Component, input } from '@angular/core';
import { NavIcon } from './navigation';

/** Íconos del menú (trazo de 24 px que toma el color del texto). */
@Component({
  selector: 'portal-menu-icon',
  template: `
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      @switch (name()) {
        @case ('dashboard') {
          <path d="M4 4H10V12H4V4ZM4 16H10V20H4V16ZM14 12H20V20H14V12ZM14 4H20V8H14V4Z" />
        }
        @case ('formation') {
          <path
            stroke-width="1.6"
            d="M5 13.18V16a2 2 0 0 0 1.04 1.75l5 2.73a2 2 0 0 0 1.92 0l5-2.73A2 2 0 0 0 19 16v-2.82M21 10.09l-8.04 4.39a2 2 0 0 1-1.92 0L2.61 9.88a1 1 0 0 1 0-1.76l8.43-4.6a2 2 0 0 1 1.92 0l9.52 5.19a1 1 0 0 1 .52.88V16"
          />
        }
        @case ('catalog') {
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3M8 11h6M11 8v6" />
        }
        @case ('library') {
          <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" />
          <path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
        }
        @case ('calendar') {
          <path
            d="M16 3v4M8 3v4M4 11h16M7 14h.01M10 14h.01M13 14h.01M16 14h.01M13 17h.01M7 17h.01M10 17h.01M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"
          />
        }
        @case ('calls') {
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M19 8v6M22 11h-6" />
        }
        @case ('scholarships') {
          <circle cx="12" cy="8" r="6" />
          <path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
    }
  `,
})
export class MenuIcon {
  readonly name = input.required<NavIcon>();
}
