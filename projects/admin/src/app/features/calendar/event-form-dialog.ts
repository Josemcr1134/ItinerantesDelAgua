import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AdminCalendarApi,
  AdminCalendarEventDto,
  CALENDAR_CATEGORY_VALUES,
  CalendarCategory,
  LIBRARY_AUDIENCE_VALUES,
  LibraryAudience,
} from 'data-access';
import { firstValueFrom } from 'rxjs';
import { Dialog, DialogActions } from 'ui-kit';
import { ErrorPresenter } from '../../core/error-presenter';
import { offerOptions } from '../../shared/filters/offer-options';
import { FormActions } from '../../shared/form-actions/form-actions';
import { CALENDAR_CATEGORY_LABELS } from '../offers/offer-labels';
import { isoToZonedInput, zonedInputToIso } from '../offers/shared/zoned-time';
import { AUDIENCE_LABELS, CALENDAR_KIND_LABELS } from './calendar-labels';

const HTTPS_URL = /^https:\/\/\S+$/i;

/**
 * Crear un evento manual (webinar, encuentro…) o editar uno existente,
 * también las fechas importantes. Solo lo ve la audiencia elegida y no se
 * notifica. Horas en CDMX.
 */
@Component({
  selector: 'adm-event-form-dialog',
  imports: [ReactiveFormsModule, Dialog, DialogActions, FormActions],
  templateUrl: './event-form-dialog.html',
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    p {
      margin: 0;
    }
    .row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
      gap: var(--space-3);
    }
    .choices {
      display: grid;
      gap: var(--space-2);
      margin-top: var(--space-2);
    }
  `,
})
export class EventFormDialog {
  readonly open = model(false);
  /** Evento a editar (`null`: crear uno manual). */
  readonly event = input<AdminCalendarEventDto | null>(null);
  /** Fecha sugerida al crear (`AAAA-MM-DD`). */
  readonly date = input('');
  readonly saved = output<AdminCalendarEventDto>();

  private readonly api = inject(AdminCalendarApi);
  private readonly errors = inject(ErrorPresenter);
  protected readonly categories = CALENDAR_CATEGORY_VALUES;
  protected readonly categoryLabels = CALENDAR_CATEGORY_LABELS;
  protected readonly audiences = LIBRARY_AUDIENCE_VALUES;
  protected readonly audienceLabels = AUDIENCE_LABELS;
  protected readonly kindLabels = CALENDAR_KIND_LABELS;
  protected readonly offers = offerOptions();

  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);
  protected readonly error = signal<string | null>(null);

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.pattern(/\S/)]],
    description: [''],
    category: this.fb.control<CalendarCategory>('EVENTS'),
    audience: this.fb.control<LibraryAudience>('ALL_REGISTERED'),
    offerId: [''],
    allDay: [false],
    date: ['', Validators.required],
    startTime: [''],
    endTime: [''],
    location: [''],
    joinUrl: ['', Validators.pattern(HTTPS_URL)],
  });
  protected readonly allDay = toSignal(this.form.controls.allDay.valueChanges, {
    initialValue: false,
  });
  protected readonly audience = toSignal(this.form.controls.audience.valueChanges, {
    initialValue: 'ALL_REGISTERED' as LibraryAudience,
  });
  protected readonly isManual = computed(() => (this.event()?.kind ?? 'MANUAL') === 'MANUAL');

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const e = this.event();
      untracked(() => this.reset(e));
    });
  }

  protected showError(name: 'title' | 'date' | 'joinUrl'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected async save(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const startsAt = zonedInputToIso(`${v.date}T${v.allDay ? '00:00' : v.startTime}`);
    const endsAt = v.allDay || !v.endTime ? null : zonedInputToIso(`${v.date}T${v.endTime}`);
    if (!startsAt || (!v.allDay && !v.startTime)) {
      this.error.set('Elige la fecha y la hora de inicio (o marca «Todo el día»).');
      return;
    }
    if (endsAt && Date.parse(endsAt) <= Date.parse(startsAt)) {
      this.error.set('La hora de fin debe ser posterior a la de inicio.');
      return;
    }
    if (v.audience === 'OFFER_ENROLLED' && !v.offerId) {
      this.error.set('Elige la oferta cuyos inscritos verán el evento.');
      return;
    }
    this.error.set(null);
    const text = (value: string) => value.trim() || null;
    const fields = {
      title: v.title.trim(),
      description: text(v.description),
      category: v.category,
      audience: v.audience,
      offerId: v.offerId || null,
      startsAt,
      endsAt,
      allDay: v.allDay,
      location: text(v.location),
      joinUrl: text(v.joinUrl),
    };
    const current = this.event();
    this.saving.set(true);
    try {
      const saved = await firstValueFrom(
        current
          ? this.api.updateEvent(current.id, fields)
          : this.api.createEvent({
              ...fields,
              description: fields.description ?? undefined,
              offerId: fields.offerId ?? undefined,
              endsAt: fields.endsAt ?? undefined,
              location: fields.location ?? undefined,
              joinUrl: fields.joinUrl ?? undefined,
            }),
      );
      this.open.set(false);
      this.saved.emit(saved);
    } catch (error) {
      void this.errors.present(error);
    } finally {
      this.saving.set(false);
    }
  }

  private reset(e: AdminCalendarEventDto | null): void {
    this.submitted.set(false);
    this.error.set(null);
    const [date = '', startTime = ''] = isoToZonedInput(e?.startsAt).split('T');
    this.form.reset({
      title: e?.title ?? '',
      description: e?.description ?? '',
      category: e?.category ?? 'EVENTS',
      audience: e?.audience ?? 'ALL_REGISTERED',
      offerId: e?.offer?.id ?? '',
      allDay: e?.allDay ?? false,
      date: e ? date : this.date(),
      startTime: e?.allDay ? '' : startTime,
      endTime: e?.endsAt && !e.allDay ? (isoToZonedInput(e.endsAt).split('T')[1] ?? '') : '',
      location: e?.location ?? '',
      joinUrl: e?.joinUrl ?? '',
    });
  }
}
