import { Component, computed, effect, forwardRef, inject, signal, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AdminOfferDetailDto, UpdateContentStepDto } from 'data-access';
import { CountryPicker } from '../fields/country-picker';
import { StringListField } from '../fields/string-list-field';
import { formDirty } from './form-dirty';
import { OfferStep, orNull } from './offer-step';

/** Paso 2 — Contenido. */
@Component({
  selector: 'adm-content-step',
  imports: [ReactiveFormsModule, StringListField, CountryPicker],
  providers: [{ provide: OfferStep, useExisting: forwardRef(() => ContentStep) }],
  template: `
    <form [formGroup]="form" (submit)="$event.preventDefault()">
      <section class="adm-section" aria-labelledby="content-public">
        <h2 id="content-public" class="adm-section__title">Ficha pública</h2>
        <div class="adm-grid">
          <div class="adm-field adm-grid__full">
            <label class="adm-field__label" for="c-description">Descripción</label>
            <textarea
              id="c-description"
              class="adm-field__input"
              rows="6"
              formControlName="description"
              [attr.aria-invalid]="!!issue('description')"
              [attr.aria-describedby]="issue('description') ? 'c-description-issue' : null"
            ></textarea>
            @if (issue('description')) {
              <p id="c-description-issue" class="adm-field__error">{{ issue('description') }}</p>
            }
          </div>
          <div class="adm-grid__full">
            <adm-string-list-field
              label="¿Qué aprenderás?"
              placeholder="Ej. Diseñar un humedal construido"
              [(items)]="outcomes"
              [disabled]="readonly()"
              [issue]="issue('learningOutcomes')"
            />
          </div>
          <div class="adm-field adm-grid__full">
            <label class="adm-field__label" for="c-requirements"
              >Requisitos <span class="adm-field__hint">(opcional)</span></label
            >
            <textarea
              id="c-requirements"
              class="adm-field__input"
              rows="3"
              formControlName="requirements"
            ></textarea>
          </div>
        </div>
      </section>

      @if (offer().type === 'OPEN_CALL') {
        <section class="adm-section" aria-labelledby="content-eligibility">
          <h2 id="content-eligibility" class="adm-section__title">Elegibilidad</h2>
          <div class="adm-grid">
            <div class="adm-field adm-grid__full">
              <label class="adm-field__label" for="c-eligibility">¿Quién puede postular?</label>
              <textarea
                id="c-eligibility"
                class="adm-field__input"
                rows="3"
                formControlName="eligibilityText"
                [attr.aria-invalid]="!!issue('eligibilityText')"
              ></textarea>
              @if (issue('eligibilityText')) {
                <p class="adm-field__error">{{ issue('eligibilityText') }}</p>
              }
            </div>
            <div class="adm-grid__full">
              <adm-country-picker [(codes)]="countries" [disabled]="readonly()" />
            </div>
            <label class="adm-check adm-grid__full">
              <input type="checkbox" formControlName="requiresTravel" />
              Requiere viajar (se avisa al postular)
            </label>
          </div>
        </section>
      }

      <section class="adm-section" aria-labelledby="content-classroom">
        <h2 id="content-classroom" class="adm-section__title">Aula</h2>
        <div class="adm-grid">
          <div class="adm-field adm-grid__full">
            <label class="adm-field__label" for="c-welcome"
              >Bienvenida del aula <span class="adm-field__hint">(opcional)</span></label
            >
            <textarea
              id="c-welcome"
              class="adm-field__input"
              rows="3"
              formControlName="classroomWelcome"
            ></textarea>
          </div>
          @if (offer().type === 'DIPLOMA') {
            <label class="adm-check adm-grid__full">
              <input type="checkbox" formControlName="finalProjectSubmissionEnabled" />
              Entrega del proyecto final por archivo
            </label>
            <div class="adm-field adm-grid__full">
              <label class="adm-field__label" for="c-guidelines"
                >Lineamientos del proyecto final</label
              >
              <textarea
                id="c-guidelines"
                class="adm-field__input"
                rows="3"
                formControlName="finalProjectGuidelines"
                [attr.aria-invalid]="!!issue('finalProjectGuidelines')"
              ></textarea>
              @if (issue('finalProjectGuidelines')) {
                <p class="adm-field__error">{{ issue('finalProjectGuidelines') }}</p>
              }
            </div>
          }
        </div>
      </section>
    </form>
  `,
})
export class ContentStep extends OfferStep {
  readonly slug = 'content' as const;

  protected readonly form = inject(NonNullableFormBuilder).group({
    description: [''],
    requirements: [''],
    eligibilityText: [''],
    requiresTravel: [false],
    classroomWelcome: [''],
    finalProjectSubmissionEnabled: [false],
    finalProjectGuidelines: [''],
  });
  protected readonly outcomes = signal<readonly string[]>([]);
  protected readonly countries = signal<readonly string[]>([]);
  private readonly snapshot = signal('');
  private readonly extrasKey = computed(() => JSON.stringify([this.outcomes(), this.countries()]));
  private readonly formIsDirty = formDirty(this.form);
  readonly dirty = computed(() => this.formIsDirty() || this.extrasKey() !== this.snapshot());

  constructor() {
    super();
    effect(() => {
      const offer = this.offer();
      untracked(() => this.reset(offer));
    });
  }

  async save(): Promise<AdminOfferDetailDto | null> {
    const v = this.form.getRawValue();
    const body: UpdateContentStepDto = {
      description: v.description.trim(),
      learningOutcomes: this.outcomes()
        .map((o) => o.trim())
        .filter(Boolean),
      requirements: orNull(v.requirements),
      eligibilityText: orNull(v.eligibilityText),
      eligibleCountryCodes: [...this.countries()],
      requiresTravel: v.requiresTravel,
      classroomWelcome: orNull(v.classroomWelcome),
      finalProjectSubmissionEnabled: v.finalProjectSubmissionEnabled,
      finalProjectGuidelines: orNull(v.finalProjectGuidelines),
    };
    return this.patch('content', body);
  }

  private reset(offer: AdminOfferDetailDto): void {
    const c = offer.content;
    this.form.reset({
      description: c.description,
      requirements: c.requirements ?? '',
      eligibilityText: c.eligibilityText ?? '',
      requiresTravel: c.requiresTravel,
      classroomWelcome: c.classroomWelcome ?? '',
      finalProjectSubmissionEnabled: c.finalProjectSubmissionEnabled,
      finalProjectGuidelines: c.finalProjectGuidelines ?? '',
    });
    this.outcomes.set(c.learningOutcomes);
    this.countries.set(c.eligibleCountryCodes);
    this.snapshot.set(this.extrasKey());
    this.applyReadonly(this.form);
  }
}
