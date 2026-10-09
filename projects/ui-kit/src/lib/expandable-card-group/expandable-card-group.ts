import { NgTemplateOutlet } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  contentChild,
  contentChildren,
  DestroyRef,
  ElementRef,
  inject,
  input,
  model,
  signal,
  viewChildren,
} from '@angular/core';
import { CardPanel, CardPanelDefault } from './card-panel';
import { ExpandableItem } from './expandable-item';

let nextGroupId = 0;

/**
 * Grupo de tarjetas con un panel siempre visible debajo. Cada tarjeta tiene
 * un botón-pestaña que muestra su contenido en el panel; al volver a pulsarlo
 * el panel regresa a su contenido por defecto. Solo una tarjeta activa a la vez.
 *
 * En pantallas estrechas (`inlineQuery`) el panel se abre justo bajo la
 * tarjeta activa, como un acordeón, y no hay panel por defecto.
 *
 * Accesibilidad: los botones exponen `aria-expanded` y `aria-controls`; las
 * flechas, Home y End mueven el foco entre ellos.
 */
@Component({
  selector: 'ui-expandable-card-group',
  imports: [NgTemplateOutlet],
  templateUrl: './expandable-card-group.html',
  styleUrl: './expandable-card-group.scss',
})
export class ExpandableCardGroup {
  readonly items = input.required<readonly ExpandableItem[]>();
  /** Nombre accesible de la lista de tarjetas y del panel por defecto. */
  readonly groupLabel = input.required<string>();
  /** Prefijo del nombre accesible del botón para abrir ("Ver"). */
  readonly openLabel = input.required<string>();
  /** Prefijo del nombre accesible del botón para cerrar ("Cerrar"). */
  readonly closeLabel = input.required<string>();
  /**
   * Tarjeta activa (enlazable con `[(activeId)]`). Su valor inicial es la
   * tarjeta abierta al cargar; `null` muestra el panel por defecto.
   */
  readonly activeId = model<string | null>(null);
  /** Media query en la que el panel se abre bajo su tarjeta (por defecto, < lg). */
  readonly inlineQuery = input('(max-width: 63.9988rem)');

  protected readonly expandedId = this.activeId;
  /** Panel bajo la tarjeta activa (true) o al final del grupo (false). */
  protected readonly inline = signal(false);

  private readonly panels = contentChildren(CardPanel);
  private readonly defaultPanel = contentChild(CardPanelDefault);
  private readonly triggers = viewChildren<ElementRef<HTMLButtonElement>>('trigger');

  protected readonly activeTemplate = computed(() => {
    const id = this.expandedId();
    const panel = id ? this.panels().find((p) => p.itemId() === id) : undefined;
    return panel?.template ?? this.defaultPanel()?.template ?? null;
  });

  constructor() {
    const view = inject(DOCUMENT).defaultView;
    const destroyRef = inject(DestroyRef);
    // Solo en navegador: al prerenderizar se usa la disposición de escritorio.
    afterNextRender(() => {
      if (!view?.matchMedia) {
        return;
      }
      const query = view.matchMedia(this.inlineQuery());
      const update = () => this.inline.set(query.matches);
      update();
      query.addEventListener('change', update);
      destroyRef.onDestroy(() => query.removeEventListener('change', update));
    });
  }

  private readonly groupId = `ui-ecg-${nextGroupId++}`;
  protected readonly panelId = `${this.groupId}-panel`;

  protected titleId(itemId: string): string {
    return `${this.groupId}-title-${itemId}`;
  }

  protected toggle(itemId: string): void {
    this.expandedId.update((current) => (current === itemId ? null : itemId));
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
