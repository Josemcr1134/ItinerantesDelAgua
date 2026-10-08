import { Component, input } from '@angular/core';
import { FooterContent } from './footer-content';

/** Footer: logo, lema y redes sociales sobre el fondo verde. */
@Component({
  selector: 'pub-footer',
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  readonly content = input.required<FooterContent>();
}
