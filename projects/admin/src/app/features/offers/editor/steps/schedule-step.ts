import { Component, computed, effect, forwardRef, inject, signal, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AdminOfferDetailDto,
  CALENDAR_CATEGORY_VALUES,
  CalendarCategory,
  UpdateScheduleStepDto,
} from 'data-access';
import { CALENDAR_CATEGORY_LABELS } from '../../offer-labels';
import { DateListField } from '../../shared/date-list-field';
import { WeekdayPicker } from '../../shared/weekday-picker';
import { isoToZonedInput, zonedInputToIso } from '../../shared/zoned-time';
import { formDirty } from './form-dirty';
import { OfferStep } from './offer-step';

/** Paso 3 — Horarios (fechas en hora CDMX y regla que genera las sesiones). */
@Component({
  selector: 'adm-schedule-step',
  imports: [ReactiveFormsModule, RouterLink, WeekdayPicker, DateListField],
  providers: [{ provide: OfferStep, useExisting: forwardRef(() => ScheduleStep) }],
  templateUrl: './schedule-step.html',
  styles: `
    .rule {
      margin-top: var(--space-3);
    }
    .manage {
      display: inline-flex;
      align-items: center;
      margin-top: var(--space-4);
      text-decoration: none;
    }
  `,
})
export class ScheduleStep extends OfferStep {
  readonly slug = 'schedule' as const;

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly categories = CALENDAR_CATEGORY_VALUES;
  protected readonly categoryLabels = CALENDAR_CATEGORY_LABELS;

  protected readonly form = this.fb.group({
    enrollmentOpensAt: [''],
    enrollmentClosesAt: [''],
    startsAt: [''],
    endsAt: [''],
    finalProjectDueAt: [''],
    totalHours: this.fb.control<number | null>(null),
    calendarCategory: this.fb.control<CalendarCategory>('TRAINING'),
    hasRule: [false],
    startTime: [''],
    endTime: [''],
    excludeMexicanHolidays: [true],
  });
  protected readonly days = signal<readonly number[]>([]);
  protected readonly excludedDates = signal<readonly string[]>([]);
  protected readonly hasRule = signal(false);
  private readonly snapshot = signal('');
  private readonly extrasKey = computed(() => JSON.stringify([this.days(), this.excludedDates()]));
  private readonly formIsDirty = formDirty(this.form);
  readonly dirty = computed(() => this.formIsDirty() || this.extrasKey() !== this.snapshot());

  protected readonly timezone = computed(() => this.offer().schedule.timezone);
  protected readonly isOpenCall = computed(() => this.offer().type === 'OPEN_CALL');

  constructor() {
    super();
    effect(() => {
      const offer = this.offer();
      untracked(() => this.reset(offer));
    });
    this.form.controls.hasRule.valueChanges.subscribe((value) => this.hasRule.set(value));
  }

  async save(): Promise<AdminOfferDetailDto | null> {
    const v = this.form.getRawValue();
    const tz = this.timezone();
    const body: UpdateScheduleStepDto = {
      enrollmentOpensAt: zonedInputToIso(v.enrollmentOpensAt, tz),
      enrollmentClosesAt: zonedInputToIso(v.enrollmentClosesAt, tz),
      startsAt: zonedInputToIso(v.startsAt, tz),
      endsAt: zonedInputToIso(v.endsAt, tz),
      finalProjectDueAt: zonedInputToIso(v.finalProjectDueAt, tz),
      totalHours: v.totalHours ?? null,
      calendarCategory: v.calendarCategory,
      scheduleRule: v.hasRule
        ? {
            weekdays: [...this.days()],
            startTime: v.startTime,
            endTime: v.endTime,
            excludedDates: [...this.excludedDates()],
            excludeMexicanHolidays: v.excludeMexicanHolidays,
          }
        : null,
    };
    return this.patch('schedule', body);
  }

  private reset(offer: AdminOfferDetailDto): void {
    const s = offer.schedule;
    const tz = s.timezone;
    const rule = s.scheduleRule;
    this.form.reset({
      enrollmentOpensAt: isoToZonedInput(s.enrollmentOpensAt, tz),
      enrollmentClosesAt: isoToZonedInput(s.enrollmentClosesAt, tz),
      startsAt: isoToZonedInput(s.startsAt, tz),
      endsAt: isoToZonedInput(s.endsAt, tz),
      finalProjectDueAt: isoToZonedInput(s.finalProjectDueAt, tz),
      totalHours: s.totalHours,
      calendarCategory: s.calendarCategory,
      hasRule: !!rule,
      startTime: rule?.startTime ?? '',
      endTime: rule?.endTime ?? '',
      excludeMexicanHolidays: rule?.excludeMexicanHolidays ?? true,
    });
    this.hasRule.set(!!rule);
    this.days.set(rule?.weekdays ?? []);
    this.excludedDates.set(rule?.excludedDates ?? []);
    this.snapshot.set(this.extrasKey());
    this.applyReadonly(this.form);
  }
}
