import { Component, computed, input } from '@angular/core';
import { ApplicationStatus } from 'data-access';

const STEPS = ['Formulario', 'Revisión en equipo', 'Entrevista por Zoom', 'Resultado'] as const;

/** Paso actual según el estado de la postulación. */
const STEP_OF: Readonly<Record<ApplicationStatus, number>> = {
  DRAFT: 0,
  SUBMITTED: 1,
  IN_REVIEW: 1,
  INTERVIEW_SCHEDULED: 2,
  APPROVED_PENDING_PAYMENT: 3,
  APPROVED_PENDING_CONFIRMATION: 3,
  ENROLLED: 3,
  NOT_SELECTED: 3,
  EXPIRED: 3,
};

/** Pasos de la convocatoria (Figma HU-20): Formulario › Revisión › Entrevista › Resultado. */
@Component({
  selector: 'portal-application-steps',
  template: `
    <ol class="steps" aria-label="Pasos de la postulación">
      @for (step of steps; track step; let i = $index) {
        <li
          class="step"
          [class.step--done]="i < current()"
          [class.step--current]="i === current()"
          [attr.aria-current]="i === current() ? 'step' : null"
        >
          <span class="step__number" aria-hidden="true">{{ i + 1 }}</span>
          {{ step }}
        </li>
      }
    </ol>
  `,
  styles: `
    .steps {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px 6px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .step {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: #5a6b60;
      font-size: 0.8125rem;
    }
    .step + .step::before {
      content: '›';
      margin-right: 2px;
      color: #5a6b60;
    }
    .step__number {
      display: inline-grid;
      place-items: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background-color: #e3ebe3;
      color: var(--color-primary);
      font-size: 0.75rem;
      font-weight: 700;
    }
    .step--current {
      color: var(--color-primary);
      font-weight: 700;
    }
    .step--current .step__number,
    .step--done .step__number {
      background-color: var(--color-primary);
      color: #fff;
    }
  `,
})
export class ApplicationSteps {
  readonly status = input.required<ApplicationStatus>();
  protected readonly steps = STEPS;
  protected readonly current = computed(() => STEP_OF[this.status()]);
}
