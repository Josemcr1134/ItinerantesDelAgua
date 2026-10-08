import { Component, input } from '@angular/core';
import { FooterContent } from './footer-content';

/** Footer: logo, tagline y redes sociales. */
@Component({
  selector: 'pub-footer',
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  readonly content = input.required<FooterContent>();
}
