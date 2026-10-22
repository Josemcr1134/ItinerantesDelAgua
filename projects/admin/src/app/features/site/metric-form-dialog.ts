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
import { AdminSiteApi, AdminSiteMetricDto } from 'data-access';
import { Dialog, DialogActions } from 'ui-kit';
import { firstValueFrom } from 'rxjs';
import { ErrorPresenter } from '../../core/error-presenter';
import { FormActions } from '../../shared/form-actions/form-actions';
import { formatMetric } from './metric-format';

/** Editar una cifra de la landing: número, texto, prefijo/sufijo, orden y visibilidad. */
@Component({
  selector: 'adm-metric-form-dialog',
  imports: [ReactiveFormsModule, Dialog, DialogActions, FormActions],
  template: `
    <ui-dialog [(open)]="open" title="Editar cifra" [busy]="saving()">
      <form id="metric-form" class="form" novalidate [formGroup]="form" (ngSubmit)="save()">
        <p class="preview" aria-live="polite">
          <span class="preview__label">Así se verá</span>
          <span class="preview__value">{{ preview() }}</span>
          <span class="preview__text">{{ form.controls.label.value || '—' }}</span>
        </p>

        <div class="adm-field">
          <label class="adm-field__label" for="metric-label">Texto</label>
          <input
            id="metric-label"
            class="adm-field__input"
            formControlName="label"
            required
            [attr.aria-invalid]="showError('label')"
            [attr.aria-describedby]="showError('label') ? 'metric-label-error' : null"
          />
          @if (showError('label')) {
            <p id="metric-label-error" class="adm-field__error">Escribe el texto de la cifra.</p>
          }
        </div>

        <div class="row">
          <div class="adm-field">
            <label class="adm-field__label" for="metric-prefix"
              >Prefijo <span class="adm-field__hint">(opcional)</span></label
            >
            <input
              id="metric-prefix"
              class="adm-field__input"
              formControlName="prefix"
              aria-describedby="metric-affix-hint"
            />
          </div>
          <div class="adm-field">
            <label class="adm-field__label" for="metric-value">Número</label>
            <input
              id="metric-value"
              class="adm-field__input"
              type="number"
              inputmode="decimal"
              min="0"
              formControlName="value"
              required
              [attr.aria-invalid]="showError('value')"
              [attr.aria-describedby]="showError('value') ? 'metric-value-error' : null"
            />
          </div>
          <div class="adm-field">
            <label class="adm-field__label" for="metric-suffix"
              >Sufijo <span class="adm-field__hint">(opcional)</span></label
            >
            <input
              id="metric-suffix"
              class="adm-field__input"
              formControlName="suffix"
              aria-describedby="metric-affix-hint"
            />
          </div>
        </div>
        <p id="metric-affix-hint" class="adm-field__hint hint">
          Texto pegado al número, por ejemplo «+» o « L». Los espacios cuentan.
        </p>
        @if (showError('value')) {
          <p id="metric-value-error" class="adm-field__error">
            Escribe un número igual o mayor que 0.
          </p>
        }

        <div class="adm-field order">
          <label class="adm-field__label" for="metric-order">Orden</label>
          <input
            id="metric-order"
            class="adm-field__input"
            type="number"
            inputmode="numeric"
            step="1"
            formControlName="sortOrder"
            required
            aria-describedby="metric-order-hint"
            [attr.aria-invalid]="showError('sortOrder')"
          />
          <p id="metric-order-hint" class="adm-field__hint">
            Las cifras se muestran de menor a mayor.
          </p>
          @if (showError('sortOrder')) {
            <p class="adm-field__error">Escribe un número entero.</p>
          }
        </div>

        <label class="adm-check">
          <input type="checkbox" formControlName="visible" />
          Mostrar en la página web
        </label>
      </form>
      <div uiDialogActions>
        <adm-form-actions
          form="metric-form"
          submitLabel="Guardar cambios"
          [busy]="saving()"
          (cancel)="open.set(false)"
        />
      </div>
    </ui-dialog>
  `,
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .preview {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin: 0;
      padding: var(--space-3);
      border-radius: 16px;
      background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
      color: var(--color-primary);
    }

    .preview__label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .preview__value {
      font-size: 1.75rem;
      font-weight: 800;
      overflow-wrap: anywhere;
    }

    .row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr);
      gap: var(--space-3);
      align-items: end;
    }

    .hint {
      margin-top: calc(-1 * var(--space-3));
    }

    .order {
      max-width: 10rem;
    }
  `,
})
export class MetricFormDialog {
  readonly open = model(false);
  readonly metric = input<AdminSiteMetricDto | null>(null);
  readonly saved = output<AdminSiteMetricDto>();

  private readonly api = inject(AdminSiteApi);
  private readonly errors = inject(ErrorPresenter);

  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);

  protected readonly form = inject(NonNullableFormBuilder).group({
    label: ['', [Validators.required, Validators.pattern(/\S/)]],
    value: [0 as number | null, [Validators.required, Validators.min(0)]],
    prefix: [''],
    suffix: [''],
    sortOrder: [0 as number | null, [Validators.required, Validators.pattern(/^-?\d+$/)]],
    visible: [true],
  });

  private readonly formValue = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  /** Prefijo + número con separador de miles + sufijo, como en la landing. */
  protected readonly preview = computed(() => {
    const { prefix = '', value, suffix = '' } = this.formValue();
    return typeof value === 'number' ? formatMetric(prefix, value, suffix) : '—';
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const metric = this.metric();
      untracked(() => {
        this.submitted.set(false);
        this.form.reset({
          label: metric?.label ?? '',
          value: metric?.value ?? 0,
          prefix: metric?.prefix ?? '',
          suffix: metric?.suffix ?? '',
          sortOrder: metric?.sortOrder ?? 0,
          visible: metric?.visible ?? true,
        });
      });
    });
  }

  protected showError(name: 'label' | 'value' | 'sortOrder'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected async save(): Promise<void> {
    this.submitted.set(true);
    const metric = this.metric();
    if (this.form.invalid || !metric) return;
    const v = this.form.getRawValue();
    const next = {
      label: v.label.trim(),
      value: v.value ?? 0,
      prefix: v.prefix,
      suffix: v.suffix,
      sortOrder: v.sortOrder ?? 0,
      visible: v.visible,
    };
    // Solo lo que cambió (cada edición queda en la auditoría).
    const changed = (Object.keys(next) as (keyof typeof next)[]).filter(
      (field) => metric[field] !== next[field],
    );
    if (!changed.length) {
      this.open.set(false);
      return;
    }
    const body = Object.fromEntries(changed.map((field) => [field, next[field]])) as Partial<
      typeof next
    >;
    this.saving.set(true);
    try {
      const result = await firstValueFrom(this.api.updateMetric(metric.key, body));
      this.open.set(false);
      this.saved.emit(result);
    } catch (error) {
      void this.errors.present(error);
    } finally {
      this.saving.set(false);
    }
  }
}
