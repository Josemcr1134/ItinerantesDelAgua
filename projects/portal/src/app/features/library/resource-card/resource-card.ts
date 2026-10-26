import { Component, computed, input, output } from '@angular/core';
import { LibraryItemDto } from 'data-access';
import { LIBRARY_COVERS, RESOURCE_TYPE_LABELS } from '../library-options';
import { ResourceIcon } from '../resource-icon';

/**
 * Tarjeta de un recurso (Figma HU-09): miniatura a la izquierda, título y el
 * tipo (ícono en círculo + pastilla). Toda la tarjeta abre el recurso.
 */
@Component({
  selector: 'portal-resource-card',
  imports: [ResourceIcon],
  template: `
    @let r = resource();
    <button type="button" class="card" [attr.aria-label]="label()" (click)="opened.emit(r)">
      <img
        class="card__cover"
        [src]="r.thumbnailUrl ?? fallbackCover()"
        alt=""
        width="135"
        height="142"
        loading="lazy"
      />
      <span class="card__body">
        <span class="card__title">{{ r.title }}</span>
        @if (r.audience === 'OFFER_ENROLLED' && r.offer) {
          <span class="card__note">Exclusivo de {{ r.offer.name }}</span>
        } @else if (r.author) {
          <span class="card__note">{{ r.author }}</span>
        }
        <span class="card__type" aria-hidden="true">
          <span class="card__icon"><portal-resource-icon [type]="r.type" /></span>
          <span class="card__pill">{{ typeLabel() }}</span>
        </span>
      </span>
    </button>
  `,
  styleUrl: './resource-card.scss',
})
export class ResourceCard {
  readonly resource = input.required<LibraryItemDto>();
  readonly fallbackCover = input<string>(LIBRARY_COVERS[0]);
  readonly opened = output<LibraryItemDto>();

  protected readonly typeLabel = computed(() => RESOURCE_TYPE_LABELS[this.resource().type]);
  protected readonly label = computed(() => `Abrir ${this.resource().title} (${this.typeLabel()})`);
}
