import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { passwordRules, PasswordToggle } from 'auth';
import { ProfileApi, toApiError } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { AlertService } from 'ui-kit';
import { PROFILE_TEXTS } from '../profile-texts';

type Field = 'currentPassword' | 'newPassword' | 'confirmPassword';

/** La confirmación coincide con la nueva contraseña. */
function sameAsNew(control: AbstractControl): ValidationErrors | null {
  const parent = control.parent;
  return parent && control.value && control.value !== parent.get('newPassword')?.value
    ? { mismatch: true }
    : null;
}

/**
 * Seguridad (HU-14): cambiar la contraseña con la actual y la nueva dos
 * veces (reglas de HU-02). La API cierra las demás sesiones.
 */
@Component({
  selector: 'portal-security-form',
  imports: [ReactiveFormsModule, PasswordToggle],
  template: `
    <form class="panel" novalidate [formGroup]="form" (ngSubmit)="save()">
      @for (field of fields; track field.name) {
        <div class="field">
          <label class="field__label" [for]="'profile-' + field.name">{{ field.label }}</label>
          <div class="password">
            <input
              class="field__input"
              [id]="'profile-' + field.name"
              [type]="visible()[field.name] ? 'text' : 'password'"
              [autocomplete]="
                field.name === 'currentPassword' ? 'current-password' : 'new-password'
              "
              [formControlName]="field.name"
              [attr.aria-invalid]="showError(field.name)"
              [attr.aria-describedby]="
                showError(field.name)
                  ? 'profile-' + field.name + '-error'
                  : field.name === 'newPassword'
                    ? 'profile-rules'
                    : null
              "
            />
            <auth-password-toggle
              class="password__toggle"
              [visible]="visible()[field.name]"
              (visibleChange)="toggle(field.name, $event)"
              [controls]="'profile-' + field.name"
            />
          </div>
          @if (showError(field.name)) {
            <p class="field__error" [id]="'profile-' + field.name + '-error'">
              {{ errorFor(field.name) }}
            </p>
          } @else if (field.name === 'newPassword') {
            <p id="profile-rules" class="hint">{{ t.rules }}</p>
          }
        </div>
      }
      @if (error(); as message) {
        <p class="notice" role="alert">{{ message }}</p>
      }
      <button type="submit" class="button" [disabled]="saving()">
        {{ saving() ? t.saving : t.save }}
      </button>
    </form>
  `,
  styleUrl: '../profile-form.scss',
  styles: `
    :host .panel {
      max-width: 520px;
    }
    .password {
      position: relative;
    }
    .password .field__input {
      padding-right: 48px;
    }
    .password__toggle {
      position: absolute;
      top: 50%;
      right: 6px;
      translate: 0 -50%;
    }
  `,
})
export class SecurityForm {
  private readonly api = inject(ProfileApi);
  private readonly alerts = inject(AlertService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly t = PROFILE_TEXTS.security;
  protected readonly fields: readonly { name: Field; label: string }[] = [
    { name: 'currentPassword', label: this.t.current },
    { name: 'newPassword', label: this.t.next },
    { name: 'confirmPassword', label: this.t.confirm },
  ];
  protected readonly form = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, passwordRules]],
    confirmPassword: ['', [Validators.required, sameAsNew]],
  });
  protected readonly visible = signal<Record<Field, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    this.form.controls.newPassword.valueChanges.subscribe(() =>
      this.form.controls.confirmPassword.updateValueAndValidity(),
    );
  }

  protected toggle(name: Field, value: boolean): void {
    this.visible.update((state) => ({ ...state, [name]: value }));
  }

  protected showError(name: Field): boolean {
    const control = this.form.controls[name];
    return control.invalid && control.touched;
  }

  protected errorFor(name: Field): string {
    const errors = this.form.controls[name].errors ?? {};
    if (errors['api']) return errors['api'];
    if (errors['required']) return PROFILE_TEXTS.authErrors.required;
    if (errors['mismatch']) return this.t.mismatch;
    return this.t.rules;
  }

  protected async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.api.changePassword(this.form.getRawValue()));
      this.form.reset();
      await this.alerts.success(this.t.saved, this.t.savedText);
    } catch (error) {
      const apiError = toApiError(error);
      if (apiError.code === 'AUTH_CURRENT_PASSWORD_INVALID') {
        this.form.controls.currentPassword.setErrors({ api: this.t.currentInvalid });
        this.form.controls.currentPassword.markAsTouched();
      } else {
        for (const detail of apiError.details) {
          const control = this.form.get(detail.field);
          control?.setErrors({ api: detail.message });
          control?.markAsTouched();
        }
        this.error.set(apiError.message);
      }
    } finally {
      this.saving.set(false);
    }
  }
}
