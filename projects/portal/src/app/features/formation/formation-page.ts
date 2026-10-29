import { Component, computed, effect, inject, input, linkedSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { EnrollmentsApi, toApiError } from 'data-access';
import { usePageHeading } from '../../core/page-heading/page-heading';
import { MoodleAccess } from '../moodle-access/moodle-access';
import {
  FORMATION_PHASES,
  FORMATION_TYPES,
  FormationPhaseSlug,
  isFormationSlug,
  isPhaseSlug,
} from './formation-options';
import { FORMATION_COVERS, FormationTile } from './formation-tile/formation-tile';

/** Tarjetas por tanda ("Ver más" pide la siguiente). */
const BATCH = 12;

/**
 * Mi formación (HU-07, Figma): diplomados, cursos, talleres o eventos inscritos según
 * el sub-ítem del menú, con las pestañas Activos / Completados / Todos.
 * Al final, "¿No ves tu formación?" para activar el acceso de Moodle (HU-25).
 */
@Component({
  selector: 'portal-formation-page',
  imports: [RouterLink, FormationTile, MoodleAccess],
  templateUrl: './formation-page.html',
  styleUrl: './formation-page.scss',
})
export default class FormationPage {
  private readonly api = inject(EnrollmentsApi);
  private readonly heading = usePageHeading();

  /** Sub-ítem (`/formacion/:tipo`). */
  readonly tipo = input.required<string>();
  /** Pestaña (`?estado=`); por defecto, Activos. */
  readonly estado = input<string>();

  protected readonly phases = Object.entries(FORMATION_PHASES) as [
    FormationPhaseSlug,
    (typeof FORMATION_PHASES)[FormationPhaseSlug],
  ][];
  protected readonly covers = FORMATION_COVERS;

  protected readonly kind = computed(() => {
    const slug = this.tipo();
    return isFormationSlug(slug) ? FORMATION_TYPES[slug] : FORMATION_TYPES.diplomados;
  });
  protected readonly phase = computed<FormationPhaseSlug>(() => {
    const value = this.estado();
    return isPhaseSlug(value) ? value : 'activos';
  });
  /** Cuántas se piden; vuelve a una tanda al cambiar de tipo o pestaña. */
  private readonly limit = linkedSignal({
    source: () => [this.kind(), this.phase()] as const,
    computation: () => BATCH,
  });

  protected readonly formations = rxResource({
    params: () => ({
      type: [this.kind().type],
      phase: FORMATION_PHASES[this.phase()].phase,
      page: 1,
      pageSize: this.limit(),
    }),
    stream: ({ params }) => this.api.mine(params),
  });
  protected readonly items = computed(() => this.formations.value()?.data ?? []);
  protected readonly hasMore = computed(() => {
    const meta = this.formations.value()?.meta;
    return !!meta && meta.total > this.items().length && this.limit() < 100;
  });
  protected readonly loadError = computed(() => {
    const error = this.formations.error();
    return error ? toApiError(error).message : null;
  });

  /** "No tienes diplomados activos", "No tienes cursos completados"… */
  protected readonly emptyText = computed(() => {
    const label = this.kind().label.toLowerCase();
    const phase = this.phase();
    return phase === 'todos'
      ? `Aún no tienes ${label}.`
      : `No tienes ${label} ${phase === 'activos' ? 'activos' : 'completados'}.`;
  });

  constructor() {
    effect(() =>
      this.heading.set({
        title: 'Formación',
        subtitle: `${this.kind().label} en los que estoy inscrito`,
      }),
    );
  }

  protected showMore(): void {
    this.limit.update((value) => Math.min(value + BATCH, 100));
  }
}
