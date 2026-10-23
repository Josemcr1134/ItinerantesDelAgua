import {
  Component,
  computed,
  effect,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Dialog, DialogActions } from 'ui-kit';
import { FormActions } from '../../../shared/form-actions/form-actions';

export type AttendanceAction = 'mark' | 'unmark';

const REASON_MAX = 1000;

/**
 * Motivo obligatorio para marcar asistencia a mano ("Pasar lista en sitio")
 * o para desmarcarla (corrección). Emite el motivo; quien lo abre envía la
 * petición y lo cierra al terminar.
 */
@Component({
  selector: 'adm-attendance-reason-dialog',
  imports: [FormsModule, Dialog, DialogActions, FormActions],
  template: `
    <ui-dialog [(open)]="open" [title]="title()" [busy]="busy()">
      <form id="attendance-reason-form" class="form" (ngSubmit)="submit()">
        <p>{{ lead() }}</p>
        <div class="adm-field">
          <label class="adm-field__label" for="attendance-reason">Motivo</label>
          <textarea
            id="attendance-reason"
            class="adm-field__input"
            name="reason"
            rows="3"
            required
            [maxlength]="reasonMax"
            [placeholder]="action() === 'mark' ? 'Por ejemplo: pasó lista en sitio' : ''"
            [(ngModel)]="reason"
            aria-describedby="attendance-reason-hint"
          ></textarea>
          <p id="attendance-reason-hint" class="adm-field__hint">
            Queda registrado con tu nombre{{ action() === 'unmark' ? ' en la auditoría' : '' }}.
          </p>
        </div>
        @if (error()) {
          <p class="adm-field__error" role="alert">{{ error() }}</p>
        }
      </form>
      <div uiDialogActions>
        <adm-form-actions
          form="attendance-reason-form"
          [submitLabel]="action() === 'mark' ? 'Marcar asistencia' : 'Desmarcar'"
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
    p {
      margin: 0;
    }
  `,
})
export class AttendanceReasonDialog {
  readonly open = model(false);
  readonly action = input<AttendanceAction>('mark');
  /** Personas afectadas (para el texto). */
  readonly names = input<readonly string[]>([]);
  readonly busy = input(false);
  readonly confirmed = output<string>();

  protected readonly reasonMax = REASON_MAX;
  protected readonly reason = signal('');
  protected readonly error = signal<string | null>(null);

  protected readonly title = computed(() =>
    this.action() === 'mark' ? 'Marcar asistencia' : 'Desmarcar asistencia',
  );
  protected readonly lead = computed(() => {
    const names = this.names();
    const who = names.length === 1 ? names[0] : `${names.length} personas`;
    return this.action() === 'mark'
      ? `Se registra la asistencia de ${who} como «Manual».`
      : `Se borra el registro de asistencia de ${who} y su porcentaje se recalcula.`;
  });

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
