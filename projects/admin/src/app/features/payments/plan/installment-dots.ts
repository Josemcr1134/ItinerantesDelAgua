import { Component, computed, input } from '@angular/core';
import { PlanInstallmentDto } from 'data-access';
import { INSTALLMENT_STATUS_LABELS } from '../payment-labels';

/** Mini línea de cuotas: un punto por cuota con su estado. */
@Component({
  selector: 'adm-installment-dots',
  template: `
    <ol class="dots" [attr.aria-label]="label()">
      @for (i of installments(); track i.id) {
        <li
          [class]="'dot dot--' + i.status"
          [title]="'Cuota ' + i.sequence + ': ' + labels[i.status]"
        ></li>
      }
    </ol>
  `,
  styles: `
    .dots {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin: var(--space-1) 0;
      padding: 0;
      list-style: none;
    }
    .dot {
      width: 14px;
      height: 14px;
      border: 2px solid color-mix(in srgb, var(--color-primary) 35%, transparent);
      border-radius: 50%;
    }
    .dot--PAID {
      border-color: #2f7a3e;
      background-color: #2f7a3e;
    }
    .dot--PROCESSING {
      border-color: var(--color-deep-blue);
      background-color: color-mix(in srgb, var(--color-deep-blue) 40%, transparent);
    }
    .dot--FAILED {
      border-color: var(--color-danger);
      background-color: var(--color-danger);
    }
    .dot--CANCELLED {
      border-style: dashed;
      opacity: 0.5;
    }
  `,
})
export class InstallmentDots {
  readonly installments = input.required<readonly PlanInstallmentDto[]>();
  protected readonly labels = INSTALLMENT_STATUS_LABELS;
  /** "Cuotas: 1 pagada, 1 fallida, 1 programada". */
  protected readonly label = computed(
    () =>
      'Cuotas: ' +
      this.installments()
        .map((i) => `${i.sequence} ${this.labels[i.status].toLowerCase()}`)
        .join(', '),
  );
}
