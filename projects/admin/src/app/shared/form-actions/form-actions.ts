import { Component, input, output } from '@angular/core';
import { Button } from 'ui-kit';

/**
 * Pie de un formulario en diálogo: "Cancelar" y el botón principal, que
 * muestra `busyLabel` mientras guarda. Con `form` el botón envía ese
 * formulario; sin él, emite `submitted`.
 *
 * ```html
 * <div uiDialogActions>
 *   <adm-form-actions form="teacher-form" [busy]="saving()" submitLabel="Guardar" (cancel)="open.set(false)" />
 * </div>
 * ```
 */
@Component({
  selector: 'adm-form-actions',
  imports: [Button],
  template: `
    <button type="button" class="adm-link" [disabled]="busy()" (click)="cancel.emit()">
      {{ cancelLabel() }}
    </button>
    @if (showSubmit()) {
      <button
        uiButton
        [attr.type]="form() ? 'submit' : 'button'"
        [attr.form]="form() ?? null"
        [disabled]="busy()"
        (click)="form() ? null : submitted.emit()"
      >
        {{ busy() ? busyLabel() : submitLabel() }}
      </button>
    }
  `,
  styles: `
    :host {
      display: contents;
    }
  `,
})
export class FormActions {
  readonly submitLabel = input.required<string>();
  readonly busyLabel = input('Guardando…');
  readonly cancelLabel = input('Cancelar');
  readonly busy = input(false);
  /** `id` del formulario que envía el botón principal. */
  readonly form = input<string>();
  readonly showSubmit = input(true);
  readonly cancel = output<void>();
  readonly submitted = output<void>();
}
