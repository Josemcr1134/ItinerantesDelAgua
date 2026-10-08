import {
  afterNextRender,
  Component,
  ElementRef,
  Injector,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Button } from 'ui-kit';
import { SECTION_IDS } from '../../content/section-ids';
import { ClosingCtaContent } from './closing-cta-content';

/**
 * Sección de cierre "Territorios que cuidan y aprenden" sobre el fondo verde
 * ondulado; destino del ancla "Contacto". Al pulsar "Hablemos" el bloque se
 * sustituye por el formulario de contacto, con un botón para volver.
 */
@Component({
  selector: 'pub-closing-cta',
  imports: [Button],
  templateUrl: './closing-cta.html',
  styleUrl: './closing-cta.scss',
})
export class ClosingCta {
  readonly content = input.required<ClosingCtaContent>();

  protected readonly sectionId = SECTION_IDS.contact;
  protected readonly showForm = signal(false);

  private readonly injector = inject(Injector);
  private readonly ctaButton = viewChild('cta', { read: ElementRef<HTMLButtonElement> });
  private readonly form = viewChild<ElementRef<HTMLElement>>('form');

  protected openForm(): void {
    this.showForm.set(true);
    // Lleva el foco al formulario para teclado y lectores de pantalla.
    afterNextRender(() => this.form()?.nativeElement.focus(), { injector: this.injector });
  }

  protected closeForm(): void {
    this.showForm.set(false);
    afterNextRender(() => this.ctaButton()?.nativeElement.focus(), { injector: this.injector });
  }
}
