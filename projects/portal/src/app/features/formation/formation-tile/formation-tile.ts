import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormationCardDto } from 'data-access';
import { Button } from 'ui-kit';

/** Ilustraciones del Figma para las ofertas que aún no tienen portada. */
export const FORMATION_COVERS = [
  'assets/formation/cover-corn.webp',
  'assets/formation/cover-river.webp',
  'assets/formation/cover-pot.webp',
] as const;

/**
 * Tarjeta de una formación inscrita (Figma HU-07): portada, nombre, progreso
 * y [Continuar] hacia el aula (deshabilitado si el acceso está suspendido).
 */
@Component({
  selector: 'portal-formation-tile',
  imports: [RouterLink, Button],
  template: `
    @let f = formation();
    <article class="frame" [attr.aria-labelledby]="'formation-' + f.enrollmentId">
      <div class="card">
        <img
          class="card__cover"
          [src]="f.offer.coverImageUrl ?? fallbackCover()"
          alt=""
          width="287"
          height="174"
          loading="lazy"
        />
        <div class="card__body">
          <h2 class="card__title" [id]="'formation-' + f.enrollmentId">{{ f.offer.name }}</h2>
          @if (note(); as text) {
            <p class="card__note">{{ text }}</p>
          }
          <!-- Mismas pastillas que en el Dashboard: sesiones asistidas ÷ programadas. -->
          <p class="progress">
            <span class="progress__label">Progreso</span>
            <span class="progress__value">{{ f.progress.percent }}%</span>
          </p>
        </div>
        @if (f.canContinue) {
          <a
            uiButton
            variant="secondary"
            class="card__action"
            [routerLink]="['/formacion/aula', f.offer.id]"
            [attr.aria-label]="'Continuar ' + f.offer.name"
          >
            Continuar
          </a>
        } @else {
          <button uiButton variant="secondary" class="card__action" type="button" disabled>
            Continuar
          </button>
        }
      </div>
    </article>
  `,
  styleUrl: './formation-tile.scss',
})
export class FormationTile {
  readonly formation = input.required<FormationCardDto>();
  readonly fallbackCover = input<string>(FORMATION_COVERS[0]);

  /** Aviso bajo el nombre: suspendida, terminada o vía Moodle. */
  protected readonly note = computed(() => {
    const f = this.formation();
    if (f.status === 'SUSPENDED') return 'Acceso suspendido';
    if (f.phase === 'COMPLETED') return 'Completado';
    if (f.origin === 'MOODLE') return 'Vía Moodle';
    return null;
  });
}
