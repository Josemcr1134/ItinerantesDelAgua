import { NgOptimizedImage } from '@angular/common';
import { Component, input } from '@angular/core';
import { Button } from 'ui-kit';
import { SECTION_IDS } from '../../content/section-ids';
import { AnchorLink } from '../../shared/anchor-link/anchor-link';
import { HeroContent } from './hero-content';

/** Hero a pantalla completa con ilustración de fondo recibida como asset. */
@Component({
  selector: 'pub-hero',
  imports: [NgOptimizedImage, Button, AnchorLink],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  readonly content = input.required<HeroContent>();

  protected readonly sectionId = SECTION_IDS.hero;
}
