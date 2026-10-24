import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CodeInput } from './code-input';

@Component({
  imports: [ReactiveFormsModule, CodeInput],
  template: `<portal-code-input inputId="code" label="Código" [formControl]="code" />`,
})
class Host {
  readonly code = new FormControl('', { nonNullable: true });
}

describe('CodeInput', () => {
  async function render() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector<HTMLInputElement>('#code')!;
    const boxes = () =>
      [...host.querySelectorAll('.code__box')].map((b) => b.textContent?.trim() || '_').join('');
    return { fixture, input, boxes };
  }

  it('reparte los dígitos en las casillas y descarta lo que no es número', async () => {
    const { fixture, input, boxes } = await render();
    input.value = '48 5-1a2';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.code.value).toBe('48512');
    expect(input.value).toBe('48512');
    expect(boxes()).toBe('48512_');
    expect(input.getAttribute('autocomplete')).toBe('one-time-code');
    expect(input.getAttribute('aria-label')).toBe('Código');
  });

  it('un código pegado de más se recorta al largo y el formulario puede vaciarlo', async () => {
    const { fixture, input, boxes } = await render();
    input.value = '1234567890';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(fixture.componentInstance.code.value).toBe('123456');
    fixture.componentInstance.code.reset();
    await fixture.whenStable();
    expect(boxes()).toBe('______');
  });
});
