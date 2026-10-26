import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormationCardDto } from 'data-access';

/** Ilustraciones del Figma para las ofertas que aún no tienen portada. */
export const FALLBACK_COVERS = [
  'assets/dashboard/cover-snake.webp',
  'assets/dashboard/cover-plant.webp',
  'assets/dashboard/cover-pot.webp',
] as const;

/** Tarjeta de una formación activa con su progreso (HU-06 → HU-07). */
@Component({
  selector: 'portal-formation-card',
  imports: [RouterLink],
  template: `
    @let f = formation();
    <a
      class="card"
      routerLink="/formacion"
      [attr.aria-label]="f.offer.name + ', progreso ' + f.progress.percent + '%'"
    >
      <img
        class="card__cover"
        [src]="f.offer.coverImageUrl ?? fallbackCover()"
        alt=""
        width="135"
        height="142"
        loading="lazy"
      />
      <span class="card__body">
        <span class="card__title">{{ f.offer.name }}</span>
        @if (f.status === 'SUSPENDED') {
          <span class="card__note">Acceso suspendido</span>
        } @else if (f.origin === 'MOODLE') {
          <span class="card__note">Vía Moodle</span>
        }
        <span class="card__progress" aria-hidden="true">
          <span class="pill">Progreso</span>
          <span class="pill pill--filled">{{ f.progress.percent }}%</span>
        </span>
      </span>
    </a>
  `,
  styleUrl: './formation-card.scss',
})
export class FormationCard {
  readonly formation = input.required<FormationCardDto>();
  readonly fallbackCover = input<string>(FALLBACK_COVERS[0]);
}
