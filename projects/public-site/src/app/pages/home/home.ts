import { Component } from '@angular/core';
import { AREAS_CONTENT } from '../../content/areas.content';
import { HERO_CONTENT } from '../../content/hero.content';
import { IMPACT_STATS_CONTENT } from '../../content/impact-stats.content';
import { TRAJECTORY_CONTENT } from '../../content/trajectory.content';
import { Areas } from '../../sections/areas/areas';
import { Hero } from '../../sections/hero/hero';
import { ImpactStats } from '../../sections/impact-stats/impact-stats';
import { Trajectory } from '../../sections/trajectory/trajectory';

/** Landing de una sola página: compone las secciones en orden de scroll. */
@Component({
  selector: 'pub-home',
  imports: [Hero, ImpactStats, Trajectory, Areas],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly hero = HERO_CONTENT;
  protected readonly impactStats = IMPACT_STATS_CONTENT;
  protected readonly trajectory = TRAJECTORY_CONTENT;
  protected readonly areas = AREAS_CONTENT;
}
