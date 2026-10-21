import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactFormService } from 'data-access';
import { Button } from 'ui-kit';
import { ContactFormContent } from './contact-form-content';

type SendStatus = 'idle' | 'sending' | 'sent' | 'error';

/**
 * Formulario de contacto (variante "Contacto=Variante2" del Figma): correo,
 * mensaje, "Enviar" y "Volver". Errores asociados a cada campo con
 * aria-describedby y resultado del envío anunciado a lectores de pantalla.
 */
@Component({
  selector: 'pub-contact-form',
  imports: [ReactiveFormsModule, Button],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.scss',
})
export class ContactForm {
  readonly content = input.required<ContactFormContent>();
  readonly back = output<void>();

  protected readonly status = signal<SendStatus>('idle');
  protected readonly submitted = signal(false);

  private readonly contact = inject(ContactFormService);
  private readonly emailInput = viewChild.required<ElementRef<HTMLInputElement>>('email');
  private readonly messageInput = viewChild.required<ElementRef<HTMLTextAreaElement>>('message');

  protected readonly form = inject(NonNullableFormBuilder).group({
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
  });

  constructor() {
    // Al aparecer, el foco va al primer campo.
    afterNextRender(() => this.emailInput().nativeElement.focus());
  }

  protected showError(field: 'email' | 'message'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted());
  }

  protected emailError(): string {
    const errors = this.content().errors;
    return this.form.controls.email.hasError('required')
      ? errors.emailRequired
      : errors.emailInvalid;
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      const first = this.form.controls.email.invalid ? this.emailInput() : this.messageInput();
      first.nativeElement.focus();
      return;
    }
    this.status.set('sending');
    this.contact.send(this.form.getRawValue()).subscribe({
      next: () => {
        this.status.set('sent');
        this.submitted.set(false);
        this.form.reset();
      },
      error: () => this.status.set('error'),
    });
  }
}
