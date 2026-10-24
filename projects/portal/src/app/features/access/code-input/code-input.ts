import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

/**
 * Código de verificación en casillas (Figma HU-03). Es un solo `<input>`
 * encima de las casillas: así funcionan pegar el código, el autocompletado
 * de "código de un solo uso" y los lectores de pantalla.
 */
@Component({
  selector: 'portal-code-input',
  templateUrl: './code-input.html',
  styleUrl: './code-input.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CodeInput), multi: true },
  ],
  host: {
    '[class.code--invalid]': 'invalid()',
    '[class.code--disabled]': 'disabled()',
  },
})
export class CodeInput implements ControlValueAccessor {
  readonly inputId = input.required<string>();
  /** Nombre accesible (no hay etiqueta visible). */
  readonly label = input.required<string>();
  readonly length = input(6);
  readonly invalid = input(false);
  readonly describedBy = input<string | null>(null);

  protected readonly value = signal('');
  protected readonly focused = signal(false);
  protected readonly disabled = signal(false);
  protected readonly slots = computed(() => Array.from({ length: this.length() }, (_, i) => i));
  /** Casilla donde va el siguiente dígito. */
  protected readonly active = computed(() => Math.min(this.value().length, this.length() - 1));

  private onChange: (value: string) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled.set(disabled);
  }

  /** Solo dígitos ("123 456" pegado también sirve). */
  protected onInput(event: Event): void {
    const field = event.target as HTMLInputElement;
    const digits = field.value.replace(/\D/g, '').slice(0, this.length());
    field.value = digits;
    this.value.set(digits);
    this.onChange(digits);
  }

  /** El cursor siempre al final: se escribe y se borra de corrido. */
  protected keepCaretAtEnd(event: Event): void {
    const field = event.target as HTMLInputElement;
    const end = field.value.length;
    field.setSelectionRange(end, end);
  }
}
