import { Component, input } from '@angular/core';
import { Avatar } from '../avatar/avatar';

/**
 * Persona en una lista o tarjeta: avatar, nombre y un detalle (correo,
 * roles, uso…). Lo proyectado se muestra junto al nombre (p. ej. "Tú"); lo
 * marcado con `admPersonExtra`, debajo del detalle.
 * Usa `span` para poder ir dentro de botones.
 */
@Component({
  selector: 'adm-person',
  imports: [Avatar],
  template: `
    @if (showAvatar()) {
      <adm-avatar [name]="name()" [photoUrl]="photoUrl()" [size]="avatarSize()" />
    }
    <span class="person__text">
      <span class="person__name">{{ name() }}<ng-content /></span>
      @if (detail()) {
        <span class="person__detail">{{ detail() }}</span>
      }
      <ng-content select="[admPersonExtra]" />
    </span>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      min-width: 0;
    }
    .person__text {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .person__name {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2);
      font-weight: 700;
      overflow-wrap: anywhere;
    }
    .person__detail {
      font-weight: 400;
      color: color-mix(in srgb, var(--color-raisin-black) 70%, transparent);
      font-size: 0.875rem;
      line-height: 1.4;
      overflow-wrap: break-word;
    }
  `,
})
export class Person {
  readonly name = input.required<string>();
  readonly detail = input<string | null>(null);
  readonly photoUrl = input<string | null>(null);
  readonly avatarSize = input(40);
  readonly showAvatar = input(true);
}
