import { Component, ElementRef, input, viewChild } from '@angular/core';

let nextMenuId = 0;

/**
 * Menú "Más acciones" de una fila. Usa `popover` nativo (capa superior: no lo
 * recorta la tabla; se cierra con Escape o al hacer clic fuera) y se coloca
 * junto a su botón. Proyecta botones con `role="menuitem"` y la clase
 * global `adm-menuitem`.
 *
 * ```html
 * <adm-row-menu label="Más acciones de X">
 *   <button class="adm-menuitem" role="menuitem" (click)="…">Duplicar</button>
 * </adm-row-menu>
 * ```
 */
@Component({
  selector: 'adm-row-menu',
  template: `
    <button
      #trigger
      type="button"
      class="adm-action trigger"
      aria-haspopup="menu"
      [attr.aria-label]="label()"
      [attr.aria-controls]="id"
      [attr.popovertarget]="id"
    >
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="5" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
      </svg>
    </button>
    <div
      #menu
      class="menu"
      role="menu"
      popover
      [id]="id"
      [attr.aria-label]="label()"
      (toggle)="onToggle($event)"
      (click)="close()"
      (keydown)="onKeydown($event)"
    >
      <ng-content />
    </div>
  `,
  styleUrl: './row-menu.scss',
})
export class RowMenu {
  readonly label = input('Más acciones');

  protected readonly id = `adm-row-menu-${nextMenuId++}`;
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly menu = viewChild.required<ElementRef<HTMLElement>>('menu');

  protected onToggle(event: Event): void {
    if ((event as ToggleEvent).newState !== 'open') return;
    // Se abre bajo el botón, alineado a su borde derecho y dentro de la pantalla.
    const button = this.trigger().nativeElement.getBoundingClientRect();
    const menu = this.menu().nativeElement;
    const width = menu.offsetWidth;
    const height = menu.offsetHeight;
    const left = Math.max(8, Math.min(button.right - width, innerWidth - width - 8));
    const below = button.bottom + 6;
    const top = below + height > innerHeight - 8 ? button.top - height - 6 : below;
    menu.style.left = `${left}px`;
    menu.style.top = `${Math.max(8, top)}px`;
    this.items()[0]?.focus();
  }

  protected close(): void {
    this.menu().nativeElement.hidePopover?.();
  }

  /** Flechas para recorrer las opciones. */
  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
    event.preventDefault();
    const items = this.items();
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = event.key === 'ArrowDown' ? index + 1 : index - 1;
    items[(next + items.length) % items.length]?.focus();
  }

  private items(): HTMLElement[] {
    return [
      ...this.menu().nativeElement.querySelectorAll<HTMLElement>(
        '[role="menuitem"]:not(:disabled)',
      ),
    ];
  }
}
