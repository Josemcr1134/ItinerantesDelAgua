import {
  afterRenderEffect,
  Component,
  ElementRef,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';

let nextDialogId = 0;

/**
 * Diálogo modal con la línea gráfica del sitio, para formularios y contenido
 * propio (las alertas usan `AlertService`). Usa el `<dialog>` nativo: atrapa
 * el foco, se cierra con Escape y devuelve el foco al cerrar.
 *
 * ```html
 * <ui-dialog [(open)]="editing" title="Editar roles">
 *   …contenido…
 *   <div uiDialogActions>…botones…</div>
 * </ui-dialog>
 * ```
 */
@Component({
  selector: 'ui-dialog',
  template: `
    <dialog
      #dialog
      class="dialog"
      [class.dialog--wide]="size() === 'wide'"
      [attr.aria-labelledby]="id + '-title'"
      (cancel)="onCancel($event)"
      (close)="onClose()"
    >
      <header class="dialog__header">
        <h2 class="dialog__title" [id]="id + '-title'">{{ title() }}</h2>
        <button
          type="button"
          class="dialog__close"
          [attr.aria-label]="closeLabel()"
          [disabled]="busy()"
          (click)="open.set(false)"
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
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </header>
      @if (open()) {
        <div class="dialog__body">
          <ng-content />
        </div>
        <div class="dialog__actions">
          <ng-content select="[uiDialogActions]" />
        </div>
      }
    </dialog>
  `,
  styleUrl: './dialog.scss',
})
export class Dialog {
  readonly open = model(false);
  readonly title = input.required<string>();
  readonly size = input<'normal' | 'wide'>('normal');
  readonly closeLabel = input('Cerrar');
  /** Mientras hay una acción en curso no se puede cerrar. */
  readonly busy = input(false);
  /** Se emite al cerrarse por cualquier vía (botón, Escape o código). */
  readonly closed = output<void>();

  protected readonly id = `ui-dialog-${nextDialogId++}`;
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    afterRenderEffect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.open() && !dialog.open) {
        if (typeof dialog.showModal === 'function') {
          dialog.showModal();
        } else {
          dialog.setAttribute('open', '');
        }
      } else if (!this.open() && dialog.open) {
        if (typeof dialog.close === 'function') {
          dialog.close();
        } else {
          dialog.removeAttribute('open');
        }
      }
    });
  }

  protected onCancel(event: Event): void {
    if (this.busy()) {
      event.preventDefault();
    }
  }

  protected onClose(): void {
    this.open.set(false);
    this.closed.emit();
  }
}

/**
 * Pie de acciones de `ui-dialog` (botones alineados a la derecha, que bajan
 * de línea en pantallas estrechas): `<div uiDialogActions>…</div>`.
 */
@Component({
  selector: '[uiDialogActions]',
  template: '<ng-content />',
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: flex-end;
      gap: var(--space-3);
    }
  `,
})
export class DialogActions {}
