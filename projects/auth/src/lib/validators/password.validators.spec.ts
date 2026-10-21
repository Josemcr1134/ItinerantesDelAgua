import { FormControl, FormGroup } from '@angular/forms';
import { matchingFields, passwordRules } from './password.validators';

describe('validadores de contraseña', () => {
  it('exige 8 caracteres, una letra y un número', () => {
    expect(passwordRules(new FormControl('abc'))).toEqual({ minLength: true, number: true });
    expect(passwordRules(new FormControl('12345678'))).toEqual({ letter: true });
    expect(passwordRules(new FormControl('Clave1234'))).toBeNull();
    expect(passwordRules(new FormControl(''))).toBeNull();
  });

  it('compara la confirmación', () => {
    const group = new FormGroup(
      { a: new FormControl('Clave1234'), b: new FormControl('Clave1235') },
      { validators: matchingFields('a', 'b') },
    );
    expect(group.hasError('mismatch')).toBe(true);
    group.controls.b.setValue('Clave1234');
    expect(group.hasError('mismatch')).toBe(false);
  });
});
