import { Component, computed, effect, forwardRef, inject, signal, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  AdminOfferDetailDto,
  OFFER_ORIGIN_VALUES,
  OfferOrigin,
  SCHOLARSHIP_LEVEL_VALUES,
  ScholarshipLevel,
  UpdateOriginPricingStepDto,
} from 'data-access';
import { OFFER_ORIGIN_LABELS, SCHOLARSHIP_LEVEL_LABELS } from '../../offer-labels';
import { isoToZonedInput, zonedInputToIso } from '../../shared/zoned-time';
import { formDirty } from './form-dirty';
import { OfferStep, orNull } from './offer-step';

/** Precio en unidades (1500.50) ↔ centavos (150050), como los guarda la API. */
const toCents = (value: number | null): number | null =>
  value === null || Number.isNaN(value) ? null : Math.round(value * 100);
const fromCents = (cents: number | null): number | null => (cents === null ? null : cents / 100);

/** Paso 4 — Origen y precio (NAS/Moodle, precio, cuotas y beca). */
@Component({
  selector: 'adm-pricing-step',
  imports: [ReactiveFormsModule],
  providers: [{ provide: OfferStep, useExisting: forwardRef(() => PricingStep) }],
  templateUrl: './pricing-step.html',
  styles: `
    .choices {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2);
      margin: var(--space-2) 0 0;
      padding: 0;
      border: 0;
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
    .choice:has(input:disabled) {
      cursor: not-allowed;
      opacity: 0.6;
    }
    .choice input {
      accent-color: var(--color-primary);
    }
    .money {
      position: relative;
    }
    .money__prefix {
      position: absolute;
      left: var(--space-3);
      top: 50%;
      translate: 0 -50%;
      color: color-mix(in srgb, var(--color-raisin-black) 60%, transparent);
      pointer-events: none;
    }
    .money input {
      padding-left: 2rem;
    }
    .rule {
      margin-top: var(--space-3);
    }
    .levels-field {
      margin: 0;
      padding: 0;
      border: 0;
    }
    .levels {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2) var(--space-4);
      margin: var(--space-2) 0 0;
      padding: 0;
      border: 0;
    }
  `,
})
export class PricingStep extends OfferStep {
  readonly slug = 'origin-pricing' as const;

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly origins = OFFER_ORIGIN_VALUES;
  protected readonly originLabels = OFFER_ORIGIN_LABELS;
  protected readonly levels = SCHOLARSHIP_LEVEL_VALUES;
  protected readonly levelLabels = SCHOLARSHIP_LEVEL_LABELS;

  protected readonly form = this.fb.group({
    origin: this.fb.control<OfferOrigin>('NAS'),
    moodleCourseUrl: [''],
    isFree: [false],
    priceMxn: this.fb.control<number | null>(null),
    priceUsd: this.fb.control<number | null>(null),
    installmentsEnabled: [false],
    installmentsMax: this.fb.control<number | null>(null),
    scholarshipEnabled: [false],
    scholarshipOpensAt: [''],
    scholarshipClosesAt: [''],
  });
  protected readonly scholarshipLevels = signal<readonly ScholarshipLevel[]>([]);
  private readonly snapshot = signal('');
  private readonly formIsDirty = formDirty(this.form);
  readonly dirty = computed(
    () => this.formIsDirty() || JSON.stringify(this.scholarshipLevels()) !== this.snapshot(),
  );

  // Valores que muestran u ocultan secciones.
  protected readonly origin = signal<OfferOrigin>('NAS');
  protected readonly isFree = signal(false);
  protected readonly installments = signal(false);
  protected readonly scholarship = signal(false);
  /** La beca solo existe en diplomados NAS. */
  protected readonly scholarshipAvailable = computed(
    () => this.offer().type === 'DIPLOMA' && this.origin() === 'NAS',
  );
  protected readonly timezone = computed(() => this.offer().schedule.timezone);

  constructor() {
    super();
    effect(() => {
      const offer = this.offer();
      untracked(() => this.reset(offer));
    });
    const c = this.form.controls;
    c.origin.valueChanges.subscribe((v) => this.origin.set(v));
    c.isFree.valueChanges.subscribe((v) => this.isFree.set(v));
    c.installmentsEnabled.valueChanges.subscribe((v) => this.installments.set(v));
    c.scholarshipEnabled.valueChanges.subscribe((v) => this.scholarship.set(v));
  }

  protected toggleLevel(level: ScholarshipLevel, checked: boolean): void {
    this.scholarshipLevels.update((list) =>
      checked ? [...list, level] : list.filter((l) => l !== level),
    );
  }

  async save(): Promise<AdminOfferDetailDto | null> {
    const v = this.form.getRawValue();
    const tz = this.timezone();
    const nas = v.origin === 'NAS';
    const paid = nas && !v.isFree;
    const withScholarship = this.scholarshipAvailable() && v.scholarshipEnabled;
    const body: UpdateOriginPricingStepDto = {
      ...(this.offer().hasEnrollments ? {} : { origin: v.origin }),
      moodleCourseUrl: nas ? null : orNull(v.moodleCourseUrl),
      isFree: nas ? v.isFree : false,
      priceMxnCents: paid ? toCents(v.priceMxn) : null,
      priceUsdCents: paid ? toCents(v.priceUsd) : null,
      installmentsEnabled: paid && v.installmentsEnabled,
      installmentsMax: paid && v.installmentsEnabled ? v.installmentsMax : null,
      scholarshipEnabled: withScholarship,
      scholarshipLevels: withScholarship ? [...this.scholarshipLevels()] : [],
      scholarshipOpensAt: withScholarship ? zonedInputToIso(v.scholarshipOpensAt, tz) : null,
      scholarshipClosesAt: withScholarship ? zonedInputToIso(v.scholarshipClosesAt, tz) : null,
    };
    return this.patch('origin-pricing', body);
  }

  private reset(offer: AdminOfferDetailDto): void {
    const p = offer.originPricing;
    const tz = offer.schedule.timezone;
    this.form.reset({
      origin: p.origin,
      moodleCourseUrl: p.moodleCourseUrl ?? '',
      isFree: p.isFree,
      priceMxn: fromCents(p.priceMxnCents),
      priceUsd: fromCents(p.priceUsdCents),
      installmentsEnabled: p.installmentsEnabled,
      installmentsMax: p.installmentsMax,
      scholarshipEnabled: p.scholarshipEnabled,
      scholarshipOpensAt: isoToZonedInput(p.scholarshipOpensAt, tz),
      scholarshipClosesAt: isoToZonedInput(p.scholarshipClosesAt, tz),
    });
    this.origin.set(p.origin);
    this.isFree.set(p.isFree);
    this.installments.set(p.installmentsEnabled);
    this.scholarship.set(p.scholarshipEnabled);
    this.scholarshipLevels.set(p.scholarshipLevels);
    this.snapshot.set(JSON.stringify(p.scholarshipLevels));
    this.applyReadonly(this.form);
    if (offer.hasEnrollments) {
      this.form.controls.origin.disable({ emitEvent: false });
    }
  }
}
