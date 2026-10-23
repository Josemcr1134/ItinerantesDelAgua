import { Component, effect, input, model, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Dialog, DialogActions } from 'ui-kit';
import { FormActions } from '../form-actions/form-actions';

let nextId = 0;

/**
 * Confirmar una acción con motivo obligatorio (marcar asistencia, suspender
 * un acceso, cancelar un plan…). Emite el motivo; quien lo abre envía la
 * petición y lo cierra al terminar (`open.set(false)`).
 *
 * ```html
 * <adm-reason-dialog [(open)]="cancelling" title="Cancelar plan" submitLabel="Cancelar plan"
 *   [busy]="busy()" (confirmed)="cancel($event)">Las cuotas pendientes no se cobran.</adm-reason-dialog>
 * ```
 */
@Component({
  selector: 'adm-reason-dialog',
  imports: [FormsModule, Dialog, DialogActions, FormActions],
  template: `
    <ui-dialog [(open)]="open" [title]="title()" [busy]="busy()">
      <form [id]="id + '-form'" class="form" (ngSubmit)="submit()">
        <div class="lead"><ng-content /></div>
        <div class="adm-field">
          <label class="adm-field__label" [for]="id">{{ label() }}</label>
          <textarea
            class="adm-field__input"
            name="reason"
            rows="3"
            required
            [id]="id"
            [maxlength]="maxLength()"
            [placeholder]="placeholder()"
            [(ngModel)]="reason"
            [attr.aria-describedby]="hint() ? id + '-hint' : null"
          ></textarea>
          @if (hint()) {
            <p class="adm-field__hint" [id]="id + '-hint'">{{ hint() }}</p>
          }
        </div>
        @if (error()) {
          <p class="adm-field__error" role="alert">{{ error() }}</p>
        }
      </form>
      <div uiDialogActions>
        <adm-form-actions
          [form]="id + '-form'"
          [submitLabel]="submitLabel()"
          [busy]="busy()"
          (cancel)="open.set(false)"
        />
      </div>
    </ui-dialog>
  `,
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }
    .lead:empty {
      display: none;
    }
  `,
})
export class ReasonDialog {
  readonly open = model(false);
  readonly title = input.required<string>();
  readonly submitLabel = input.required<string>();
  readonly label = input('Motivo');
  readonly hint = input('');
  readonly placeholder = input('');
  readonly maxLength = input(500);
  readonly busy = input(false);
  readonly confirmed = output<string>();

  protected readonly id = `adm-reason-${nextId++}`;
  protected readonly reason = signal('');
  protected readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (!this.open()) return;
      untracked(() => {
        this.reason.set('');
        this.error.set(null);
      });
    });
  }

  protected submit(): void {
    const reason = this.reason().trim();
    if (!reason) {
      this.error.set('Escribe el motivo.');
      return;
    }
    this.error.set(null);
    this.confirmed.emit(reason);
  }
}
