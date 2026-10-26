import { Component, computed, input } from '@angular/core';

/**
 * Avatar con las iniciales del nombre (la API aún no guarda foto de perfil).
 * Decorativo: el nombre siempre está escrito al lado o en el botón que lo usa.
 */
@Component({
  selector: 'portal-avatar',
  template: `{{ initials() }}`,
  host: { 'aria-hidden': 'true', '[style.--avatar-size.px]': 'size()' },
  styles: `
    :host {
      display: inline-grid;
      flex: none;
      place-items: center;
      width: var(--avatar-size);
      height: var(--avatar-size);
      border-radius: 50%;
      background-color: var(--color-primary);
      color: #fff;
      font-size: calc(var(--avatar-size) * 0.4);
      font-weight: 600;
      line-height: 1;
      user-select: none;
    }
  `,
})
export class Avatar {
  readonly name = input.required<string>();
  readonly size = input(42);

  protected readonly initials = computed(() =>
    this.name()
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? '')
      .join(''),
  );
}
