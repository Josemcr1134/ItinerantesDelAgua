import { Component, computed, input, linkedSignal } from '@angular/core';
import { Button, CardPanel, ExpandableCardGroup } from 'ui-kit';
import { SECTION_IDS } from '../../content/section-ids';
import { AreasContent } from './areas-content';

/**
 * "Itinerantes del Agua": Escuela / Diseño y Asesoría / Innovación, con un
 * panel por área y un botón bajo el panel que depende del área activa.
 */
@Component({
  selector: 'pub-areas',
  imports: [ExpandableCardGroup, CardPanel, Button],
  templateUrl: './areas.html',
  styleUrl: './areas.scss',
})
export class Areas {
  readonly content = input.required<AreasContent>();

  protected readonly sectionId = SECTION_IDS.areas;
  protected readonly activeId = linkedSignal<string | null>(
    () => this.content().initialItemId ?? null,
  );
  protected readonly activeCta = computed(
    () => this.content().items.find((item) => item.id === this.activeId())?.cta ?? null,
  );
}
