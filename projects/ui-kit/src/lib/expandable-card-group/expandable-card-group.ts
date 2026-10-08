import {
  afterNextRender,
  Component,
  ElementRef,
  Injector,
  inject,
  input,
  signal,
  viewChildren,
} from '@angular/core';
import { Button } from '../button/button';
import { ExpandableItem } from './expandable-item';

let nextGroupId = 0;

/**
 * Grupo de tarjetas con un único panel de detalle debajo del grupo.
 * Solo una tarjeta puede estar expandida a la vez.
 *
 * Accesibilidad: cada tarjeta expone un `<button>` con `aria-expanded` y
 * `aria-controls`; las flechas, Home y End mueven el foco entre tarjetas; al
 * abrir un panel el foco pasa a su título y al colapsarlo vuelve a la tarjeta.
 */
@Component({
  selector: 'ui-expandable-card-group',
  imports: [Button],
  templateUrl: './expandable-card-group.html',
  styleUrl: './expandable-card-group.scss',
})
export class ExpandableCardGroup {
  readonly items = input.required<readonly ExpandableItem[]>();
  /** Nombre accesible de la lista de tarjetas. */
  readonly groupLabel = input.required<string>();
  /** Texto del botón que colapsa el panel. */
  readonly collapseLabel = input.required<string>();

  protected readonly expandedId = signal<string | null>(null);

  private readonly groupId = `ui-ecg-${nextGroupId++}`;
  private readonly injector = inject(Injector);
  private readonly triggers = viewChildren<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panelHeading = viewChildren<ElementRef<HTMLElement>>('panelHeading');

  protected triggerId(itemId: string): string {
    return `${this.groupId}-trigger-${itemId}`;
  }

  protected panelId(itemId: string): string {
    return `${this.groupId}-panel-${itemId}`;
  }

  protected panelHeadingId(itemId: string): string {
    return `${this.groupId}-panel-heading-${itemId}`;
  }

  protected toggle(itemId: string): void {
    if (this.expandedId() === itemId) {
      this.expandedId.set(null);
      return;
    }
    this.expandedId.set(itemId);
    afterNextRender(() => this.panelHeading()[0]?.nativeElement.focus(), {
      injector: this.injector,
    });
  }

  protected collapse(): void {
    const index = this.items().findIndex((item) => item.id === this.expandedId());
    this.expandedId.set(null);
    this.triggers()[index]?.nativeElement.focus();
  }

  protected onTriggerKeydown(event: KeyboardEvent, index: number): void {
    const last = this.items().length - 1;
    const targets: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowDown: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    const target = targets[event.key];
    if (target === undefined) {
      return;
    }
    event.preventDefault();
    this.triggers()[target]?.nativeElement.focus();
  }
}
