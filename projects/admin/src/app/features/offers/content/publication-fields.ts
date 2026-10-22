import { Component, input, model } from '@angular/core';
import { Visibility } from 'data-access';

let nextId = 0;

/** Valores de publicación de un módulo o recurso (fecha en hora de la oferta). */
export interface PublicationValue {
  readonly visibility: Visibility;
  /** Programar la publicación para `publishAt`. */
  readonly scheduled: boolean;
  /** "YYYY-MM-DDTHH:mm" en la zona de la oferta. */
  readonly publishAt: string;
  readonly notifyEnrollees: boolean;
}

/**
 * Publicación de un módulo o recurso: oculto o publicado, programarlo para
 * una fecha y avisar a los inscritos cuando quede visible.
 */
@Component({
  selector: 'adm-publication-fields',
  template: `
    @let v = value();
    <fieldset class="pub" [disabled]="disabled()">
      <legend class="adm-field__label">Publicación</legend>
      <div class="pub__choices">
        <label class="adm-check">
          <input
            type="radio"
            [name]="id"
            value="HIDDEN"
            [checked]="v.visibility === 'HIDDEN'"
            (change)="set({ visibility: 'HIDDEN' })"
          />
          Oculto
        </label>
        <label class="adm-check">
          <input
            type="radio"
            [name]="id"
            value="PUBLISHED"
            [checked]="v.visibility === 'PUBLISHED'"
            (change)="set({ visibility: 'PUBLISHED' })"
          />
          Publicado
        </label>
      </div>

      @if (v.visibility === 'PUBLISHED') {
        <label class="adm-check">
          <input
            type="checkbox"
            [checked]="v.scheduled"
            (change)="set({ scheduled: $any($event.target).checked })"
          />
          Programar la publicación
        </label>
        @if (v.scheduled) {
          <div class="adm-field pub__date">
            <label class="adm-field__label" [for]="id + '-at'"
              >Se publica el <span class="adm-field__hint">(hora CDMX)</span></label
            >
            <input
              class="adm-field__input"
              type="datetime-local"
              [id]="id + '-at'"
              [value]="v.publishAt"
              (input)="set({ publishAt: $any($event.target).value })"
            />
          </div>
        }
        <label class="adm-check">
          <input
            type="checkbox"
            [checked]="v.notifyEnrollees"
            (change)="set({ notifyEnrollees: $any($event.target).checked })"
          />
          <span>
            Notificar a los inscritos al quedar visible
            <span class="adm-field__hint"
              >({{ enrollees() }} {{ enrollees() === 1 ? 'inscrito activo' : 'inscritos activos' }};
              se avisa una sola vez)</span
            >
          </span>
        </label>
      }
    </fieldset>
  `,
  styles: `
    .pub {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      margin: 0;
      padding: 0;
      border: 0;
    }
    .pub__choices {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2) var(--space-4);
    }
    .pub__date {
      max-width: 18rem;
    }
  `,
})
export class PublicationFields {
  readonly value = model.required<PublicationValue>();
  /** Inscritos activos que recibirían el aviso. */
  readonly enrollees = input(0);
  readonly disabled = input(false);

  protected readonly id = `adm-pub-${nextId++}`;

  protected set(patch: Partial<PublicationValue>): void {
    this.value.update((v) => ({ ...v, ...patch }));
  }
}
