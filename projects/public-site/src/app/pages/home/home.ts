import { Component } from '@angular/core';
import { HERO_CONTENT } from '../../content/hero.content';
import { IMPACT_STATS_CONTENT } from '../../content/impact-stats.content';
import { Hero } from '../../sections/hero/hero';
import { ImpactStats } from '../../sections/impact-stats/impact-stats';

/** Landing de una sola página: compone las secciones en orden de scroll. */
@Component({
  selector: 'pub-home',
  imports: [Hero, ImpactStats],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly hero = HERO_CONTENT;
  protected readonly impactStats = IMPACT_STATS_CONTENT;
}
