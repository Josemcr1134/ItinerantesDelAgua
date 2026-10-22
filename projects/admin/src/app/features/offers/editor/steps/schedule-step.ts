import { Component, computed, effect, forwardRef, inject, signal, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  AdminOfferDetailDto,
  CALENDAR_CATEGORY_VALUES,
  CalendarCategory,
  UpdateScheduleStepDto,
} from 'data-access';
import { CALENDAR_CATEGORY_LABELS, WEEKDAYS } from '../../offer-labels';
import { isoToZonedInput, zonedInputToIso } from '../../shared/zoned-time';
import { formDirty } from './form-dirty';
import { OfferStep } from './offer-step';

/** Paso 3 — Horarios (fechas en hora CDMX y regla que genera las sesiones). */
@Component({
  selector: 'adm-schedule-step',
  imports: [ReactiveFormsModule],
  providers: [{ provide: OfferStep, useExisting: forwardRef(() => ScheduleStep) }],
  templateUrl: './schedule-step.html',
  styles: `
    .rule {
      margin-top: var(--space-3);
    }
    .weekdays-field {
      margin: 0;
      padding: 0;
      border: 0;
    }
    .weekdays {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin: var(--space-2) 0 0;
      padding: 0;
      border: 0;
    }
    .weekday {
      display: inline-grid;
      place-items: center;
      min-width: 52px;
      min-height: 44px;
      padding: 0 var(--space-2);
      border: 1.5px solid #d9d2c1;
      border-radius: 12px;
      background: #fff;
      font-weight: 600;
      cursor: pointer;
    }
    .weekday:has(input:checked) {
      border-color: var(--color-primary);
      background: var(--color-primary);
      color: var(--color-on-primary);
    }
    .weekday:has(input:focus-visible) {
      outline: 3px solid var(--color-accent);
      outline-offset: 2px;
    }
    .weekday:has(input:disabled) {
      cursor: not-allowed;
      opacity: 0.6;
    }
    .dates {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin: var(--space-2) 0 0;
      padding: 0;
      list-style: none;
    }
    .date {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 6px 4px 12px;
      border-radius: var(--radius-pill);
      background: color-mix(in srgb, var(--color-primary) 12%, transparent);
      color: var(--color-primary);
      font-weight: 600;
      font-size: 0.875rem;
    }
    .date button {
      width: 28px;
      height: 28px;
      border: 0;
      border-radius: 50%;
      background: none;
      color: inherit;
      font-size: 1.125rem;
      cursor: pointer;
    }
    .add-date {
      display: flex;
      gap: var(--space-2);
      margin-top: var(--space-2);
    }
  `,
})
export class ScheduleStep extends OfferStep {
  readonly slug = 'schedule' as const;

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly weekdays = WEEKDAYS;
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
  protected readonly newExcludedDate = signal('');
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

  protected toggleDay(day: number, checked: boolean): void {
    this.days.update((list) =>
      checked ? [...list, day].sort((a, b) => a - b) : list.filter((d) => d !== day),
    );
  }

  protected addExcludedDate(): void {
    const date = this.newExcludedDate();
    if (date && !this.excludedDates().includes(date)) {
      this.excludedDates.update((list) => [...list, date].sort());
    }
    this.newExcludedDate.set('');
  }

  protected removeExcludedDate(date: string): void {
    this.excludedDates.update((list) => list.filter((d) => d !== date));
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
