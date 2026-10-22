import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SiteApi } from 'data-access';
import { catchError, map, of } from 'rxjs';
import { AREAS_CONTENT } from '../../content/areas.content';
import { CLOSING_CTA_CONTENT } from '../../content/closing-cta.content';
import { HERO_CONTENT } from '../../content/hero.content';
import { IMPACT_STATS_CONTENT } from '../../content/impact-stats.content';
import { TRAJECTORY_CONTENT } from '../../content/trajectory.content';
import { Areas } from '../../sections/areas/areas';
import { ClosingCta } from '../../sections/closing-cta/closing-cta';
import { Hero } from '../../sections/hero/hero';
import { ImpactStats } from '../../sections/impact-stats/impact-stats';
import { applySiteMetrics } from '../../sections/impact-stats/site-metrics';
import { Trajectory } from '../../sections/trajectory/trajectory';

/** Landing de una sola página: compone las secciones en orden de scroll. */
@Component({
  selector: 'pub-home',
  imports: [Hero, ImpactStats, Trajectory, Areas, ClosingCta],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  protected readonly hero = HERO_CONTENT;
  /**
   * Cifras de impacto desde la API (caché de 1 h). Mientras llegan, o si la
   * API no responde, se muestran las del diseño.
   */
  private readonly metrics = toSignal(
    inject(SiteApi)
      .metrics()
      .pipe(
        map((response) => response.data),
        catchError(() => of(null)),
      ),
    { initialValue: null },
  );
  protected readonly impactStats = computed(() =>
    applySiteMetrics(IMPACT_STATS_CONTENT, this.metrics()),
  );
  protected readonly trajectory = TRAJECTORY_CONTENT;
  protected readonly areas = AREAS_CONTENT;
  protected readonly closingCta = CLOSING_CTA_CONTENT;
}
