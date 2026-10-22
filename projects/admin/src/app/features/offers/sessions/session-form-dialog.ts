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
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminSessionDto, CALENDAR_CATEGORY_VALUES, CalendarCategory } from 'data-access';
import { Dialog, DialogActions } from 'ui-kit';
import { FormActions } from '../../../shared/form-actions/form-actions';
import { CALENDAR_CATEGORY_LABELS } from '../offer-labels';
import { isoToZonedInput, zonedInputToIso } from '../shared/zoned-time';
import { formatSessionSlot, HTTPS_URL, MEETING_URL } from './session-labels';
import { SessionsStore } from './sessions-store';

/**
 * Agregar una sesión suelta (fecha, horario, módulo, categoría y enlaces) o
 * editar una existente (enlaces, módulo, categoría, ventana de asistencia y
 * grabación). El horario de una existente se cambia con "Reprogramar".
 */
@Component({
  selector: 'adm-session-form-dialog',
  imports: [ReactiveFormsModule, Dialog, DialogActions, FormActions],
  templateUrl: './session-form-dialog.html',
  styleUrl: './sessions-dialogs.scss',
})
export class SessionFormDialog {
  readonly open = model(false);
  /** Sesión a editar (`null`: agregar una nueva). */
  readonly session = input<AdminSessionDto | null>(null);

  protected readonly store = inject(SessionsStore);
  protected readonly categories = CALENDAR_CATEGORY_VALUES;
  protected readonly categoryLabels = CALENDAR_CATEGORY_LABELS;
  protected readonly submitted = signal(false);
  protected readonly busy = computed(() => this.store.busyId() !== null);
  protected readonly slot = computed(() => {
    const s = this.session();
    return s ? formatSessionSlot(s.startsAt, s.endsAt) : '';
  });
  /** Ventana de asistencia de la oferta (cuando la sesión no la cambia). */
  protected readonly offerWindow = computed(
    () => this.store.offer()?.attendance.attendanceWindowHours ?? null,
  );

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly form = this.fb.group({
    date: [''],
    startTime: [''],
    endTime: [''],
    moduleId: [''],
    category: this.fb.control<CalendarCategory>('TRAINING'),
    joinUrl: ['', Validators.pattern(MEETING_URL)],
    hostUrl: ['', Validators.pattern(MEETING_URL)],
    recordingUrl: ['', Validators.pattern(HTTPS_URL)],
    notifyRecording: [true],
    windowHours: this.fb.control<number | null>(null, [Validators.min(1), Validators.max(72)]),
  });
  private readonly recordingUrl = toSignal(this.form.controls.recordingUrl.valueChanges, {
    initialValue: '',
  });
  /** Se publica una grabación nueva o distinta (se puede avisar a los inscritos). */
  protected readonly publishesRecording = computed(() => {
    const url = this.recordingUrl().trim();
    return !!url && url !== (this.session()?.recordingUrl ?? '');
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const s = this.session();
      untracked(() => this.reset(s));
    });
  }

  protected showError(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  /** Horario de una sesión nueva (CDMX → UTC) o un error. */
  protected readonly slotError = signal<string | null>(null);

  protected async save(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid) return;
    const s = this.session();
    const done = s ? await this.saveChanges(s) : await this.create();
    if (done) this.open.set(false);
  }

  private async create(): Promise<boolean> {
    const v = this.form.getRawValue();
    const startsAt = zonedInputToIso(`${v.date}T${v.startTime}`);
    const endsAt = zonedInputToIso(`${v.date}T${v.endTime}`);
    if (!startsAt || !endsAt || Date.parse(endsAt) <= Date.parse(startsAt)) {
      this.slotError.set('Elige la fecha y una hora de fin posterior a la de inicio.');
      return false;
    }
    this.slotError.set(null);
    const online = this.store.online();
    return !!(await this.store.create({
      startsAt,
      endsAt,
      moduleId: v.moduleId || undefined,
      category: v.category,
      joinUrl: (online && v.joinUrl.trim()) || undefined,
      hostUrl: (online && v.hostUrl.trim()) || undefined,
    }));
  }

  /** Envía solo lo que cambió; `null` quita un valor. */
  private async saveChanges(s: AdminSessionDto): Promise<boolean> {
    const v = this.form.getRawValue();
    const text = (value: string) => value.trim() || null;
    const next = {
      moduleId: v.moduleId || null,
      category: v.category,
      ...(this.store.online()
        ? {
            joinUrl: text(v.joinUrl),
            hostUrl: text(v.hostUrl),
            recordingUrl: text(v.recordingUrl),
          }
        : {}),
      attendanceWindowHours: v.windowHours ?? null,
    };
    const current: Record<keyof typeof next, unknown> = {
      moduleId: s.module?.id ?? null,
      category: s.category,
      joinUrl: s.joinUrl,
      hostUrl: s.hostUrl,
      recordingUrl: s.recordingUrl,
      attendanceWindowHours: s.attendanceWindowHours,
    };
    const changed = (Object.keys(next) as (keyof typeof next)[]).filter(
      (key) => next[key] !== current[key],
    );
    if (!changed.length) return true;
    const body = {
      ...Object.fromEntries(changed.map((key) => [key, next[key]])),
      ...(this.publishesRecording() ? { notifyRecording: v.notifyRecording } : {}),
    };
    return !!(await this.store.update(
      s,
      body,
      this.publishesRecording() ? 'Se publicó la grabación.' : 'Se guardaron los cambios.',
    ));
  }

  private reset(s: AdminSessionDto | null): void {
    this.submitted.set(false);
    this.slotError.set(null);
    const [date = '', startTime = ''] = isoToZonedInput(s?.startsAt).split('T');
    this.form.reset({
      date,
      startTime,
      endTime: isoToZonedInput(s?.endsAt).split('T')[1] ?? '',
      moduleId: s?.module?.id ?? '',
      category: s?.category ?? this.store.offer()?.schedule.calendarCategory ?? 'TRAINING',
      joinUrl: s?.joinUrl ?? '',
      hostUrl: s?.hostUrl ?? '',
      recordingUrl: s?.recordingUrl ?? '',
      notifyRecording: true,
      windowHours: s?.attendanceWindowHours ?? null,
    });
  }
}
