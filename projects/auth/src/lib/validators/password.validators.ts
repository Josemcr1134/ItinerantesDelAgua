import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Reglas de la API: mínimo 8 caracteres, al menos una letra y un número. */
export const passwordRules: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '');
  if (!value) {
    return null;
  }
  const errors: ValidationErrors = {};
  if (value.length < 8) {
    errors['minLength'] = true;
  }
  if (!/[a-zA-ZÀ-ÿ]/.test(value)) {
    errors['letter'] = true;
  }
  if (!/\d/.test(value)) {
    errors['number'] = true;
  }
  return Object.keys(errors).length ? errors : null;
};

/** El grupo debe tener dos controles con el mismo valor. */
export function matchingFields(field: string, confirmation: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const confirm = group.get(confirmation)?.value;
    return confirm && group.get(field)?.value !== confirm ? { mismatch: true } : null;
  };
}
