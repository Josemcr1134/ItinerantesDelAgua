import { Component, inject, model, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AdminOffersApi,
  OFFER_MODALITY_VALUES,
  OFFER_TYPE_VALUES,
  OfferModality,
  OfferType,
} from 'data-access';
import { Button, Dialog, DialogActions } from 'ui-kit';
import { firstValueFrom } from 'rxjs';
import { ErrorPresenter } from '../../../core/error-presenter';
import { OFFER_MODALITY_LABELS, OFFER_TYPE_LABELS } from '../offer-labels';

/** "+ Nueva oferta": tipo, modalidad y nombre; crea el borrador y abre el asistente. */
@Component({
  selector: 'adm-new-offer-dialog',
  imports: [ReactiveFormsModule, Button, Dialog, DialogActions],
  template: `
    <ui-dialog [(open)]="open" title="Nueva oferta" [busy]="saving()" (closed)="form.reset()">
      <form id="new-offer-form" class="form" novalidate [formGroup]="form" (ngSubmit)="create()">
        <p class="lead">Empieza con lo básico; el resto lo completas en el asistente.</p>

        <fieldset class="choices">
          <legend class="adm-field__label">Tipo</legend>
          <div class="choices__list">
            @for (type of types; track type) {
              <label class="choice">
                <input type="radio" formControlName="type" [value]="type" />
                {{ typeLabels[type] }}
              </label>
            }
          </div>
        </fieldset>

        <fieldset class="choices">
          <legend class="adm-field__label">Modalidad</legend>
          <div class="choices__list">
            @for (modality of modalities; track modality) {
              <label class="choice">
                <input type="radio" formControlName="modality" [value]="modality" />
                {{ modalityLabels[modality] }}
              </label>
            }
          </div>
        </fieldset>

        <div class="adm-field">
          <label class="adm-field__label" for="new-offer-name">Nombre</label>
          <input
            id="new-offer-name"
            class="adm-field__input"
            formControlName="name"
            required
            placeholder="Ej. Diplomado en Ecotecnologías del Agua 2027"
            [attr.aria-invalid]="submitted() && form.controls.name.invalid"
            [attr.aria-describedby]="
              submitted() && form.controls.name.invalid ? 'new-offer-name-error' : null
            "
          />
          @if (submitted() && form.controls.name.invalid) {
            <p id="new-offer-name-error" class="adm-field__error">
              Escribe el nombre de la oferta.
            </p>
          }
        </div>
      </form>
      <div uiDialogActions>
        <button type="button" class="adm-link" [disabled]="saving()" (click)="open.set(false)">
          Cancelar
        </button>
        <button uiButton type="submit" form="new-offer-form" [disabled]="saving()">
          {{ saving() ? 'Creando…' : 'Crear borrador' }}
        </button>
      </div>
    </ui-dialog>
  `,
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    .lead {
      color: var(--color-primary);
    }
    .choices {
      margin: 0;
      padding: 0;
      border: 0;
    }
    .choices__list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin-top: var(--space-2);
    }
    .choice {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      min-height: 44px;
      padding: 0 var(--space-3);
      border: 1.5px solid #d9d2c1;
      border-radius: var(--radius-pill);
      background: #fff;
      cursor: pointer;
    }
    .choice:has(input:checked) {
      border-color: var(--color-primary);
      background: color-mix(in srgb, var(--color-primary) 8%, #fff);
      font-weight: 600;
    }
    .choice:has(input:focus-visible) {
      outline: 3px solid var(--color-accent);
      outline-offset: 2px;
    }
    .choice input {
      accent-color: var(--color-primary);
    }
  `,
})
export class NewOfferDialog {
  readonly open = model(false);

  private readonly api = inject(AdminOffersApi);
  private readonly errors = inject(ErrorPresenter);
  private readonly router = inject(Router);

  protected readonly types = OFFER_TYPE_VALUES;
  protected readonly modalities = OFFER_MODALITY_VALUES;
  protected readonly typeLabels = OFFER_TYPE_LABELS;
  protected readonly modalityLabels = OFFER_MODALITY_LABELS;
  protected readonly saving = signal(false);
  protected readonly submitted = signal(false);

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly form = this.fb.group({
    type: this.fb.control<OfferType>('DIPLOMA'),
    modality: this.fb.control<OfferModality>('ONLINE_LIVE'),
    name: ['', [Validators.required, Validators.maxLength(200)]],
  });

  protected async create(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid) return;
    const { type, modality, name } = this.form.getRawValue();
    this.saving.set(true);
    try {
      const offer = await firstValueFrom(this.api.create({ type, modality, name: name.trim() }));
      this.open.set(false);
      await this.router.navigate(['/ofertas', offer.id]);
    } catch (error) {
      void this.errors.present(error);
    } finally {
      this.saving.set(false);
    }
  }
}
