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
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminImageDto, AdminTeacherDto, AdminTeachersApi } from 'data-access';
import { Dialog, DialogActions } from 'ui-kit';
import { firstValueFrom } from 'rxjs';
import { ErrorPresenter } from '../../core/error-presenter';
import { FormActions } from '../../shared/form-actions/form-actions';
import { ImageField } from '../../shared/image-field/image-field';

/** Reglas de la API (CreateTeacherRequestDto). */
const NAME = { min: 3, max: 160 } as const;
const HTTPS_URL = /^https:\/\/\S+$/;

/** Registrar o editar un docente (nombre, semblanza, CV y foto). */
@Component({
  selector: 'adm-teacher-form-dialog',
  imports: [ReactiveFormsModule, Dialog, DialogActions, FormActions, ImageField],
  template: `
    <ui-dialog
      [(open)]="open"
      [title]="teacher() ? 'Editar docente' : 'Registrar docente'"
      [busy]="saving()"
    >
      <form id="teacher-form" class="form" novalidate [formGroup]="form" (ngSubmit)="save()">
        <adm-image-field
          label="Foto"
          purpose="TEACHER_PHOTO"
          shape="round"
          hint="JPG, PNG o WebP de hasta 5 MB. Se muestra en la ficha de las ofertas."
          [(image)]="photo"
        />

        <div class="adm-field">
          <label class="adm-field__label" for="teacher-name">Nombre completo</label>
          <input
            id="teacher-name"
            class="adm-field__input"
            formControlName="fullName"
            required
            [attr.maxlength]="name.max"
            [attr.aria-invalid]="showError('fullName')"
            [attr.aria-describedby]="showError('fullName') ? 'teacher-name-error' : null"
          />
          @if (showError('fullName')) {
            <p id="teacher-name-error" class="adm-field__error">
              Escribe el nombre (entre {{ name.min }} y {{ name.max }} caracteres).
            </p>
          }
        </div>

        <div class="adm-field">
          <label class="adm-field__label" for="teacher-bio"
            >Semblanza <span class="adm-field__hint">(opcional)</span></label
          >
          <textarea
            id="teacher-bio"
            class="adm-field__input"
            rows="5"
            formControlName="bio"
          ></textarea>
        </div>

        <div class="adm-field">
          <label class="adm-field__label" for="teacher-cv"
            >Enlace al CV <span class="adm-field__hint">(opcional)</span></label
          >
          <input
            id="teacher-cv"
            class="adm-field__input"
            type="url"
            formControlName="cvUrl"
            placeholder="https://…"
            [attr.aria-invalid]="showError('cvUrl')"
            [attr.aria-describedby]="showError('cvUrl') ? 'teacher-cv-error' : null"
          />
          @if (showError('cvUrl')) {
            <p id="teacher-cv-error" class="adm-field__error">
              Usa un enlace que empiece con https://
            </p>
          }
        </div>
      </form>
      <div uiDialogActions>
        <adm-form-actions
          form="teacher-form"
          [submitLabel]="teacher() ? 'Guardar cambios' : 'Registrar docente'"
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
export class TeacherFormDialog {
  readonly open = model(false);
  /** Docente a editar (`null`: registrar uno nuevo). */
  readonly teacher = input<AdminTeacherDto | null>(null);
  readonly saved = output<AdminTeacherDto>();

  private readonly api = inject(AdminTeachersApi);
  private readonly errors = inject(ErrorPresenter);

  protected readonly name = NAME;
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);
  protected readonly photo = signal<AdminImageDto | null>(null);

  protected readonly form = inject(NonNullableFormBuilder).group({
    fullName: [
      '',
      [Validators.required, Validators.minLength(NAME.min), Validators.maxLength(NAME.max)],
    ],
    bio: [''],
    cvUrl: ['', Validators.pattern(HTTPS_URL)],
  });

  constructor() {
    // Al abrir, carga el docente (o deja el formulario vacío).
    effect(() => {
      if (!this.open()) return;
      const teacher = this.teacher();
      untracked(() => {
        this.submitted.set(false);
        this.form.reset({
          fullName: teacher?.fullName ?? '',
          bio: teacher?.bio ?? '',
          cvUrl: teacher?.cvUrl ?? '',
        });
        this.photo.set(
          teacher?.photoKey && teacher.photoUrl
            ? { key: teacher.photoKey, url: teacher.photoUrl }
            : null,
        );
      });
    });
  }

  protected showError(name: 'fullName' | 'cvUrl'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || this.submitted());
  }

  protected async save(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const body = {
      fullName: v.fullName.trim(),
      bio: v.bio.trim() || null,
      cvUrl: v.cvUrl.trim() || null,
      photoKey: this.photo()?.key ?? null,
    };
    const teacher = this.teacher();
    this.saving.set(true);
    try {
      const result = await firstValueFrom(
        teacher ? this.api.update(teacher.id, body) : this.api.create(body),
      );
      this.open.set(false);
      this.saved.emit(result);
    } catch (error) {
      void this.errors.present(error);
    } finally {
      this.saving.set(false);
    }
  }
}
