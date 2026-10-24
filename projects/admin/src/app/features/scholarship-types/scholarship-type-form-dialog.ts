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
import { AdminScholarshipTypeDto, AdminScholarshipTypesApi } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { Dialog, DialogActions } from 'ui-kit';
import { ErrorPresenter } from '../../core/error-presenter';
import { FormActions } from '../../shared/form-actions/form-actions';
import { percentRange } from './scholarship-type-labels';

/** Reglas de la API (CreateScholarshipTypeRequestDto). */
const KEY = /^[A-Z][A-Z0-9_]*$/;
const LIMITS = { key: 40, name: 80, description: 500 } as const;

/** "Beca 15% Ríos" → "BECA_15_RIOS" (sugerencia de clave al crear). */
function keyFrom(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/^(\d)/, 'BECA_$1')
    .slice(0, LIMITS.key);
}

/**
 * Crear o editar un tipo de beca: nombre, descripción, % fijo o rango,
 * entrevista, cupo global, orden y si está activo. La clave solo se elige al
 * crear (no cambia después).
 */
@Component({
  selector: 'adm-scholarship-type-form-dialog',
  imports: [ReactiveFormsModule, Dialog, DialogActions, FormActions],
  templateUrl: './scholarship-type-form-dialog.html',
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    .row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr));
      gap: var(--space-3);
    }
    .preview {
      margin: 0;
      padding: var(--space-3);
      border-radius: 12px;
      background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
      color: var(--color-primary);
      font-weight: 700;
    }
    .mono {
      font-family: var(--font-family-numeric), ui-monospace, monospace;
    }
  `,
})
export class ScholarshipTypeFormDialog {
  readonly open = model(false);
  /** Tipo a editar (`null`: crear uno). */
  readonly type = input<AdminScholarshipTypeDto | null>(null);
  readonly saved = output<AdminScholarshipTypeDto>();

  private readonly api = inject(AdminScholarshipTypesApi);
  private readonly errors = inject(ErrorPresenter);
  protected readonly limits = LIMITS;
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);
  protected readonly error = signal<string | null>(null);
  /** Al crear, la clave sigue al nombre hasta que se edita a mano. */
  private keyTouched = false;

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(LIMITS.name)]],
    key: ['', [Validators.required, Validators.pattern(KEY), Validators.maxLength(LIMITS.key)]],
    description: ['', Validators.maxLength(LIMITS.description)],
    minPercent: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(100),
    ]),
    maxPercent: this.fb.control<number | null>(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(100),
    ]),
    requiresInterview: [false],
    maxRecipients: this.fb.control<number | null>(null, Validators.min(1)),
    sortOrder: this.fb.control<number | null>(null),
    active: [true],
  });
  private readonly values = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue(),
  });

  /** "Aguas Libres · 50% · requiere entrevista" mientras se escribe. */
  protected readonly preview = computed(() => {
    const v = this.values();
    if (!v.name?.trim() || !v.minPercent || !v.maxPercent) return null;
    return [
      v.name.trim(),
      percentRange(v.minPercent, v.maxPercent),
      v.requiresInterview ? 'requiere entrevista' : null,
      v.maxRecipients ? `${v.maxRecipients} cupos` : 'sin límite de cupo',
    ]
      .filter(Boolean)
      .join(' · ');
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const type = this.type();
      untracked(() => this.reset(type));
    });
    this.form.controls.name.valueChanges.subscribe((name) => {
      if (!this.type() && !this.keyTouched) {
        this.form.controls.key.setValue(keyFrom(name), { emitEvent: false });
      }
    });
  }

  protected touchKey(): void {
    this.keyTouched = true;
  }

  protected showError(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected async save(): Promise<void> {
    this.submitted.set(true);
    const v = this.form.getRawValue();
    if (this.form.invalid || v.minPercent === null || v.maxPercent === null) return;
    if (v.minPercent > v.maxPercent) {
      this.error.set('El % mínimo no puede ser mayor que el máximo (iguales = % fijo).');
      return;
    }
    this.error.set(null);
    const fields = {
      name: v.name.trim(),
      description: v.description.trim() || null,
      minPercent: v.minPercent,
      maxPercent: v.maxPercent,
      requiresInterview: v.requiresInterview,
      maxRecipients: v.maxRecipients ?? null,
      active: v.active,
      ...(v.sortOrder !== null ? { sortOrder: v.sortOrder } : {}),
    };
    const current = this.type();
    this.saving.set(true);
    try {
      const saved = await firstValueFrom(
        current
          ? this.api.update(current.id, changedFields(current, fields))
          : this.api.create({ ...fields, key: v.key }),
      );
      this.open.set(false);
      this.saved.emit(saved);
    } catch (error) {
      void this.errors.present(error);
    } finally {
      this.saving.set(false);
    }
  }

  private reset(type: AdminScholarshipTypeDto | null): void {
    this.submitted.set(false);
    this.error.set(null);
    this.keyTouched = !!type;
    this.form.reset({
      name: type?.name ?? '',
      key: type?.key ?? '',
      description: type?.description ?? '',
      minPercent: type?.minPercent ?? null,
      maxPercent: type?.maxPercent ?? null,
      requiresInterview: type?.requiresInterview ?? false,
      maxRecipients: type?.maxRecipients ?? null,
      sortOrder: type?.sortOrder ?? null,
      active: type?.active ?? true,
    });
    if (type) this.form.controls.key.disable({ emitEvent: false });
    else this.form.controls.key.enable({ emitEvent: false });
  }
}

/** Solo lo que cambió respecto al tipo guardado (cada edición queda en la auditoría). */
function changedFields<T extends Record<string, unknown>>(
  current: AdminScholarshipTypeDto,
  next: T,
): Partial<T> {
  const before = current as unknown as Record<string, unknown>;
  return Object.fromEntries(
    Object.entries(next).filter(([key, value]) => before[key] !== value),
  ) as Partial<T>;
}
