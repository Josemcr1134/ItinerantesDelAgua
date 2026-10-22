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
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminModuleDto } from 'data-access';
import { Dialog, DialogActions } from 'ui-kit';
import { FormActions } from '../../../shared/form-actions/form-actions';
import { ContentStore } from './content-store';
import { PublicationFields, PublicationValue } from './publication-fields';
import { publicationBody, publicationError, publicationFrom } from './publication';

const TITLE = { min: 3, max: 120 } as const;

/** Agregar o editar un módulo: título, descripción, docente y publicación. */
@Component({
  selector: 'adm-module-form-dialog',
  imports: [ReactiveFormsModule, Dialog, DialogActions, FormActions, PublicationFields],
  template: `
    <ui-dialog
      [(open)]="open"
      [title]="module() ? 'Editar módulo ' + module()!.number : 'Agregar módulo'"
      [busy]="saving()"
    >
      <form id="module-form" class="form" novalidate [formGroup]="form" (ngSubmit)="save()">
        <div class="adm-field">
          <label class="adm-field__label" for="module-title">Título</label>
          <input
            id="module-title"
            class="adm-field__input"
            formControlName="title"
            [attr.maxlength]="title.max"
            [attr.aria-invalid]="showError()"
            [attr.aria-describedby]="showError() ? 'module-title-error' : 'module-title-hint'"
          />
          @if (showError()) {
            <p id="module-title-error" class="adm-field__error">
              Escribe el título (entre {{ title.min }} y {{ title.max }} caracteres).
            </p>
          } @else if (!module()) {
            <p id="module-title-hint" class="adm-field__hint">
              La numeración («Módulo {{ nextNumber() }}») es automática.
            </p>
          }
        </div>
        <div class="adm-field">
          <label class="adm-field__label" for="module-description"
            >Descripción <span class="adm-field__hint">(opcional)</span></label
          >
          <textarea
            id="module-description"
            class="adm-field__input"
            rows="3"
            formControlName="description"
          ></textarea>
        </div>
        <div class="adm-field">
          <label class="adm-field__label" for="module-teacher">Docente</label>
          <select id="module-teacher" class="adm-field__input" formControlName="teacherId">
            <option value="">Los docentes de la oferta</option>
            @for (t of teachers(); track t.id) {
              <option [value]="t.id">{{ t.fullName }}</option>
            }
          </select>
        </div>
        <adm-publication-fields
          [(value)]="publication"
          [enrollees]="store.content()?.activeEnrollees ?? 0"
        />
        @if (submitted() && pubError()) {
          <p class="adm-field__error" role="alert">{{ pubError() }}</p>
        }
      </form>
      <div uiDialogActions>
        <adm-form-actions
          form="module-form"
          [submitLabel]="module() ? 'Guardar módulo' : 'Agregar módulo'"
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
  `,
})
export class ModuleFormDialog {
  readonly open = model(false);
  /** Módulo a editar (`null`: agregar uno nuevo). */
  readonly module = input<AdminModuleDto | null>(null);

  protected readonly store = inject(ContentStore);
  protected readonly title = TITLE;
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);
  protected readonly publication = signal<PublicationValue>(publicationFrom(null, ''));

  private readonly timezone = computed(
    () => this.store.offer()?.schedule.timezone ?? 'America/Mexico_City',
  );
  protected readonly teachers = computed(() => this.store.offer()?.general.teachers ?? []);
  protected readonly nextNumber = computed(() => this.store.modules().length + 1);
  protected readonly pubError = computed(() =>
    publicationError(this.publication(), this.timezone()),
  );

  protected readonly form = inject(NonNullableFormBuilder).group({
    title: [
      '',
      [Validators.required, Validators.minLength(TITLE.min), Validators.maxLength(TITLE.max)],
    ],
    description: [''],
    teacherId: [''],
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const module = this.module();
      untracked(() => {
        this.submitted.set(false);
        this.form.reset({
          title: module?.title ?? '',
          description: module?.description ?? '',
          teacherId: module?.teacher?.id ?? '',
        });
        this.publication.set(publicationFrom(module, this.timezone()));
      });
    });
  }

  protected showError(): boolean {
    const c = this.form.controls.title;
    return c.invalid && (c.touched || this.submitted());
  }

  protected async save(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid || this.pubError()) return;
    const v = this.form.getRawValue();
    const fields = {
      title: v.title.trim(),
      description: v.description.trim() || null,
      teacherId: v.teacherId || null,
    };
    const pub = publicationBody(this.publication(), this.timezone());
    const module = this.module();
    this.saving.set(true);
    const saved = module
      ? await this.store.updateModule(
          module,
          { ...fields, ...pub },
          `Se guardó el «Módulo ${module.number}».`,
        )
      : await this.store.createModule(fields, pub.visibility === 'PUBLISHED' ? pub : null);
    this.saving.set(false);
    if (saved) this.open.set(false);
  }
}
