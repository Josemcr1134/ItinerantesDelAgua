import { Component, computed, input } from '@angular/core';

/** Foto redonda de una persona o, si no hay, su inicial. Decorativa (el nombre va al lado). */
@Component({
  selector: 'adm-avatar',
  host: { '[style.--avatar-size.px]': 'size()', 'aria-hidden': 'true' },
  template: `
    @if (photoUrl()) {
      <img
        class="avatar"
        [src]="photoUrl()"
        alt=""
        [width]="size()"
        [height]="size()"
        loading="lazy"
      />
    } @else {
      <span class="avatar avatar--initial">{{ initial() }}</span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
    }
    .avatar {
      width: var(--avatar-size);
      height: var(--avatar-size);
      border-radius: 50%;
      object-fit: cover;
    }
    .avatar--initial {
      display: grid;
      place-items: center;
      background-color: var(--color-columbia-blue);
      color: var(--color-deep-blue);
      font-size: calc(var(--avatar-size) * 0.4);
      font-weight: 700;
    }
  `,
})
export class Avatar {
  readonly name = input.required<string>();
  readonly photoUrl = input<string | null>(null);
  readonly size = input(40);
  protected readonly initial = computed(() => this.name().trim().charAt(0).toUpperCase());
}
