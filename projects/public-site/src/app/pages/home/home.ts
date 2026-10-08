import { Component } from '@angular/core';
import { HERO_CONTENT } from '../../content/hero.content';
import { Hero } from '../../sections/hero/hero';

/** Landing de una sola página: compone las secciones en orden de scroll. */
@Component({
  selector: 'pub-home',
  imports: [Hero],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly hero = HERO_CONTENT;
}
