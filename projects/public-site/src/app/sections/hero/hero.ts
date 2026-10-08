import { Component, input } from '@angular/core';
import { Button } from 'ui-kit';
import { SECTION_IDS } from '../../content/section-ids';
import { AnchorLink } from '../../shared/anchor-link/anchor-link';
import { HeroContent } from './hero-content';

/**
 * Hero: título, subtítulo, palabras clave y CTA sobre fondo crema, con
 * ilustraciones decorativas a los lados que se extienden sobre la franja azul
 * de la sección siguiente.
 */
@Component({
  selector: 'pub-hero',
  imports: [Button, AnchorLink],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  readonly content = input.required<HeroContent>();

  protected readonly sectionId = SECTION_IDS.hero;
}
