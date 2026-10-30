import { Component, computed, input } from '@angular/core';
import { Signature } from 'ui-kit';
import { FooterContent } from './footer-content';

/** Footer: logo, lema, redes sociales y la firma sobre el fondo verde. */
@Component({
  selector: 'pub-footer',
  imports: [Signature],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  readonly content = input.required<FooterContent>();

  /** Frases del lema (separadas por "·"): en línea en escritorio, una por bloque en móvil. */
  protected readonly taglineParts = computed(() => this.content().tagline.split(' · '));
}
