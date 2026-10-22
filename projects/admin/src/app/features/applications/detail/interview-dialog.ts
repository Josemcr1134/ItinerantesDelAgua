import { Component, effect, inject, input, model, signal, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminApplicationsApi, AdminInterviewDto } from 'data-access';
import { Dialog, DialogActions } from 'ui-kit';
import { FormActions } from '../../../shared/form-actions/form-actions';
import { isoToZonedInput, zonedInputToIso } from '../../offers/shared/zoned-time';
import { ApplicationStore } from './application-store';

/** Enlace https de Zoom (zoom.us o un subdominio). */
const ZOOM_URL = /^https:\/\/([\w-]+\.)*zoom\.us\/\S+$/i;
const DURATIONS = [30, 45, 60, 90] as const;

/** Agendar o reprogramar la entrevista por Zoom (hora del centro de México). */
@Component({
  selector: 'adm-interview-dialog',
  imports: [ReactiveFormsModule, Dialog, DialogActions, FormActions],
  template: `
    <ui-dialog
      [(open)]="open"
      [title]="current() ? 'Reprogramar entrevista' : 'Agendar entrevista'"
      [busy]="store.busy()"
    >
      <form id="interview-form" class="form" novalidate [formGroup]="form" (ngSubmit)="save()">
        <p class="adm-field__hint">
          Hora del centro de México. Se avisa al postulante con la hora en su zona.
          @if (current()) {
            La entrevista anterior se cancela.
          }
        </p>
        <div class="row">
          <div class="adm-field">
            <label class="adm-field__label" for="interview-date">Fecha</label>
            <input
              id="interview-date"
              class="adm-field__input"
              type="date"
              formControlName="date"
              required
              [attr.aria-invalid]="showError('date')"
            />
          </div>
          <div class="adm-field">
            <label class="adm-field__label" for="interview-time">Hora</label>
            <input
              id="interview-time"
              class="adm-field__input"
              type="time"
              formControlName="time"
              required
              [attr.aria-invalid]="showError('time')"
            />
          </div>
          <div class="adm-field">
            <label class="adm-field__label" for="interview-duration">Duración</label>
            <select id="interview-duration" class="adm-field__input" formControlName="minutes">
              @for (m of durations; track m) {
                <option [ngValue]="m">{{ m }} min</option>
              }
            </select>
          </div>
        </div>
        @if (showError('date') || showError('time')) {
          <p class="adm-field__error">Elige la fecha y la hora de la entrevista.</p>
        }
        <div class="adm-field">
          <label class="adm-field__label" for="interview-url">Enlace de Zoom</label>
          <input
            id="interview-url"
            class="adm-field__input"
            type="url"
            formControlName="joinUrl"
            placeholder="https://zoom.us/j/…"
            required
            [attr.aria-invalid]="showError('joinUrl')"
            [attr.aria-describedby]="showError('joinUrl') ? 'interview-url-error' : null"
          />
          @if (showError('joinUrl')) {
            <p id="interview-url-error" class="adm-field__error">
              Usa un enlace de Zoom que empiece con https:// (por ejemplo, https://zoom.us/j/…).
            </p>
          }
        </div>
      </form>
      <div uiDialogActions>
        <adm-form-actions
          form="interview-form"
          [submitLabel]="current() ? 'Reprogramar' : 'Agendar y avisar'"
          [busy]="store.busy()"
          (cancel)="open.set(false)"
        />
      </div>
    </ui-dialog>
  `,
  styleUrl: './panels.scss',
})
export class InterviewDialog {
  readonly open = model(false);
  /** Entrevista agendada (para reprogramarla) o `null`. */
  readonly current = input<AdminInterviewDto | null>(null);

  protected readonly store = inject(ApplicationStore);
  private readonly api = inject(AdminApplicationsApi);
  protected readonly durations = DURATIONS;
  private readonly submitted = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    date: ['', Validators.required],
    time: ['', Validators.required],
    minutes: [45 as number],
    joinUrl: ['', [Validators.required, Validators.pattern(ZOOM_URL)]],
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const current = this.current();
      untracked(() => {
        this.submitted.set(false);
        const [date = '', time = ''] = isoToZonedInput(current?.startsAt).split('T');
        const minutes = current
          ? Math.round((Date.parse(current.endsAt) - Date.parse(current.startsAt)) / 60000)
          : 45;
        this.form.reset({
          date,
          time,
          minutes: (DURATIONS as readonly number[]).includes(minutes) ? minutes : 45,
          joinUrl: current?.joinUrl ?? '',
        });
      });
    });
  }

  protected showError(name: 'date' | 'time' | 'joinUrl'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected async save(): Promise<void> {
    this.submitted.set(true);
    const v = this.form.getRawValue();
    const startsAt = zonedInputToIso(`${v.date}T${v.time}`);
    if (this.form.invalid || !startsAt) return;
    const endsAt = new Date(Date.parse(startsAt) + v.minutes * 60000).toISOString();
    const done = await this.store.update(
      (id) => this.api.scheduleInterview(id, { startsAt, endsAt, joinUrl: v.joinUrl.trim() }),
      this.current()
        ? 'Se reprogramó la entrevista y se avisó al postulante.'
        : 'Se agendó la entrevista y se avisó al postulante.',
    );
    if (done) this.open.set(false);
  }
}
