import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminSessionDto } from 'data-access';
import { Dialog, DialogActions } from 'ui-kit';
import { FormActions } from '../../../shared/form-actions/form-actions';
import { isoToZonedInput, zonedInputToIso } from '../shared/zoned-time';
import { formatSessionSlot } from './session-labels';
import { SessionsStore } from './sessions-store';

export type SessionChange = 'reschedule' | 'cancel';

const REASON_MAX = 1000;

/**
 * Reprogramar (nuevo horario) o cancelar una sesión. Ambos piden un motivo,
 * que se envía a las personas inscritas junto con el aviso.
 */
@Component({
  selector: 'adm-session-change-dialog',
  imports: [FormsModule, Dialog, DialogActions, FormActions],
  template: `
    <ui-dialog
      [(open)]="open"
      [title]="mode() === 'reschedule' ? 'Reprogramar sesión' : 'Cancelar sesión'"
      [busy]="busy()"
    >
      <form id="session-change-form" class="form" (ngSubmit)="save()">
        <p class="slot">{{ slot() }}</p>
        @if (mode() === 'reschedule') {
          <p class="adm-field__hint">Nuevo horario, en hora del centro de México.</p>
          <div class="row">
            <div class="adm-field">
              <label class="adm-field__label" for="change-date">Fecha</label>
              <input
                id="change-date"
                class="adm-field__input"
                type="date"
                name="date"
                required
                [(ngModel)]="date"
              />
            </div>
            <div class="adm-field">
              <label class="adm-field__label" for="change-start">Inicio</label>
              <input
                id="change-start"
                class="adm-field__input"
                type="time"
                name="start"
                required
                [(ngModel)]="startTime"
              />
            </div>
            <div class="adm-field">
              <label class="adm-field__label" for="change-end">Fin</label>
              <input
                id="change-end"
                class="adm-field__input"
                type="time"
                name="end"
                required
                [(ngModel)]="endTime"
              />
            </div>
          </div>
        } @else {
          <p>
            Queda «Cancelada»: se ve en el calendario, pero sin enlace ni registro de asistencia, y
            no cuenta para el porcentaje de nadie.
          </p>
        }
        <div class="adm-field">
          <label class="adm-field__label" for="change-reason">Motivo</label>
          <textarea
            id="change-reason"
            class="adm-field__input"
            name="reason"
            rows="3"
            required
            [maxlength]="reasonMax"
            [(ngModel)]="reason"
            aria-describedby="change-reason-hint"
          ></textarea>
          <p id="change-reason-hint" class="adm-field__hint">
            Se envía a {{ audience() }} junto con el aviso (portal y correo).
          </p>
        </div>
        @if (error()) {
          <p class="adm-field__error" role="alert">{{ error() }}</p>
        }
      </form>
      <div uiDialogActions>
        <adm-form-actions
          form="session-change-form"
          [submitLabel]="mode() === 'reschedule' ? 'Reprogramar y avisar' : 'Cancelar y avisar'"
          [busy]="busy()"
          (cancel)="open.set(false)"
        />
      </div>
    </ui-dialog>
  `,
  styleUrl: './sessions-dialogs.scss',
})
export class SessionChangeDialog {
  readonly open = model(false);
  readonly session = input<AdminSessionDto | null>(null);
  readonly mode = input<SessionChange>('reschedule');

  private readonly store = inject(SessionsStore);
  protected readonly reasonMax = REASON_MAX;
  protected readonly busy = computed(() => this.store.busyId() !== null);
  protected readonly slot = computed(() => {
    const s = this.session();
    return s ? formatSessionSlot(s.startsAt, s.endsAt) : '';
  });
  protected readonly audience = computed(() => {
    const n = this.session()?.attendance.enrolled ?? 0;
    return n === 1 ? 'la persona inscrita' : `las ${n} personas inscritas`;
  });

  protected readonly date = signal('');
  protected readonly startTime = signal('');
  protected readonly endTime = signal('');
  protected readonly reason = signal('');
  protected readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const s = this.session();
      untracked(() => {
        const [date = '', start = ''] = isoToZonedInput(s?.startsAt).split('T');
        this.date.set(date);
        this.startTime.set(start);
        this.endTime.set(isoToZonedInput(s?.endsAt).split('T')[1] ?? '');
        this.reason.set('');
        this.error.set(null);
      });
    });
  }

  protected async save(): Promise<void> {
    const s = this.session();
    const reason = this.reason().trim();
    if (!s) return;
    if (!reason) {
      this.error.set('Escribe el motivo.');
      return;
    }
    let done: AdminSessionDto | null;
    if (this.mode() === 'reschedule') {
      const startsAt = zonedInputToIso(`${this.date()}T${this.startTime()}`);
      const endsAt = zonedInputToIso(`${this.date()}T${this.endTime()}`);
      if (!startsAt || !endsAt || Date.parse(endsAt) <= Date.parse(startsAt)) {
        this.error.set('Elige la fecha y una hora de fin posterior a la de inicio.');
        return;
      }
      if (startsAt === s.startsAt && endsAt === s.endsAt) {
        this.error.set('El horario nuevo es igual al actual.');
        return;
      }
      this.error.set(null);
      done = await this.store.reschedule(s, { startsAt, endsAt, reason });
    } else {
      this.error.set(null);
      done = await this.store.cancel(s, { reason });
    }
    if (done) this.open.set(false);
  }
}
