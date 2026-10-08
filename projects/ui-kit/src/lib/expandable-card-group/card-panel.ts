import { Directive, inject, input, TemplateRef } from '@angular/core';

/**
 * Contenido del panel para una tarjeta concreta:
 * `<ng-template uiCardPanel="historia">…</ng-template>`
 */
@Directive({ selector: 'ng-template[uiCardPanel]' })
export class CardPanel {
  readonly itemId = input.required<string>({ alias: 'uiCardPanel' });
  readonly template = inject(TemplateRef);
}

/** Contenido del panel cuando no hay ninguna tarjeta activa. */
@Directive({ selector: 'ng-template[uiCardPanelDefault]' })
export class CardPanelDefault {
  readonly template = inject(TemplateRef);
}
