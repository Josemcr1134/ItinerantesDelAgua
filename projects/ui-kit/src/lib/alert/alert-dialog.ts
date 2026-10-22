import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Button } from '../button/button';
import { ALERT_ILLUSTRATIONS, AlertOptions } from './alert-options';

let nextAlertId = 0;

/**
 * Modal de alerta con la línea gráfica del sitio (ilustración, título en
 * Amatic SC y botones con llenado de agua). Usa el `<dialog>` nativo: atrapa
 * el foco, se cierra con Escape y devuelve el foco al cerrar.
 *
 * Normalmente se abre con `AlertService`; `closed` emite `true` al confirmar y
 * `false` al cancelar o cerrar.
 */
@Component({
  selector: 'ui-alert-dialog',
  imports: [Button],
  templateUrl: './alert-dialog.html',
  styleUrl: './alert-dialog.scss',
})
export class AlertDialog {
  readonly options = input.required<AlertOptions>();
  readonly closed = output<boolean>();

  private readonly illustrations = inject(ALERT_ILLUSTRATIONS);
  private readonly document = inject(DOCUMENT);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  private readonly previousFocus = this.document.activeElement as HTMLElement | null;
  private result = false;

  protected readonly id = `ui-alert-${nextAlertId++}`;
  protected readonly variant = computed(() => this.options().variant ?? 'info');
  protected readonly illustration = computed(
    () => this.options().illustration ?? this.illustrations[this.variant()],
  );
  /** Si la ilustración no carga, se oculta en vez de mostrar una imagen rota. */
  protected readonly illustrationFailed = signal(false);
  /** Errores, avisos y confirmaciones interrumpen: rol `alertdialog`. */
  protected readonly role = computed(() =>
    this.options().cancelLabel || ['error', 'warning', 'network'].includes(this.variant())
      ? 'alertdialog'
      : 'dialog',
  );

  constructor() {
    afterNextRender(() => {
      const dialog = this.dialog().nativeElement;
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    });
  }

  protected close(result: boolean): void {
    this.result = result;
    const dialog = this.dialog().nativeElement;
    if (typeof dialog.close === 'function' && dialog.open) {
      dialog.close();
    } else {
      this.onClosed();
    }
  }

  /** Escape: se trata como cancelar. */
  protected onCancel(): void {
    this.result = false;
  }

  protected onClosed(): void {
    this.previousFocus?.focus?.();
    this.closed.emit(this.result);
  }
}
