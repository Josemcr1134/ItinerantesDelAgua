import { Component, effect, forwardRef, inject, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminOfferDetailDto } from 'data-access';
import { formDirty } from './form-dirty';
import { OfferStep } from './offer-step';

/** Paso 6 — Asistencia: horas para registrarla tras cada sesión (HU-30). */
@Component({
  selector: 'adm-attendance-step',
  imports: [ReactiveFormsModule],
  providers: [{ provide: OfferStep, useExisting: forwardRef(() => AttendanceStep) }],
  template: `
    <form [formGroup]="form" (submit)="$event.preventDefault()">
      <section class="adm-section" aria-labelledby="attendance-title">
        <h2 id="attendance-title" class="adm-section__title">Registro de asistencia</h2>
        <div class="adm-field hours">
          <label class="adm-field__label" for="a-hours"
            >Horas para registrar la asistencia tras cada sesión</label
          >
          <input
            id="a-hours"
            class="adm-field__input"
            type="number"
            min="1"
            max="72"
            step="1"
            formControlName="hours"
            aria-describedby="a-hours-hint"
            [attr.aria-invalid]="form.controls.hours.invalid || !!issue('attendanceWindowHours')"
          />
          <p id="a-hours-hint" class="adm-field__hint">Entre 1 y 72 horas (24 por defecto).</p>
          @if (form.controls.hours.invalid) {
            <p class="adm-field__error">Escribe un número entre 1 y 72.</p>
          } @else if (issue('attendanceWindowHours')) {
            <p class="adm-field__error">{{ issue('attendanceWindowHours') }}</p>
          }
        </div>
      </section>
    </form>
  `,
  styles: `
    .hours {
      max-width: 22rem;
    }
  `,
})
export class AttendanceStep extends OfferStep {
  readonly slug = 'attendance' as const;

  protected readonly form = inject(NonNullableFormBuilder).group({
    hours: [24, [Validators.required, Validators.min(1), Validators.max(72)]],
  });
  readonly dirty = formDirty(this.form);

  constructor() {
    super();
    effect(() => {
      const offer = this.offer();
      untracked(() => {
        this.form.reset({ hours: offer.attendance.attendanceWindowHours });
        this.applyReadonly(this.form);
      });
    });
  }

  async save(): Promise<AdminOfferDetailDto | null> {
    if (this.form.invalid) return null;
    return this.patch('attendance', { attendanceWindowHours: this.form.getRawValue().hours });
  }
}
