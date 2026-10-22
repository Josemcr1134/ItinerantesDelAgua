import { Component, computed, effect, forwardRef, inject, signal, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  AdminImageDto,
  AdminOfferDetailDto,
  AdminTeacherRefDto,
  OFFER_MODALITY_VALUES,
  OFFER_TOPIC_VALUES,
  OFFER_TYPE_VALUES,
  OfferModality,
  OfferTopic,
  OfferType,
  UpdateGeneralStepDto,
} from 'data-access';
import { OFFER_MODALITY_LABELS, OFFER_TOPIC_LABELS, OFFER_TYPE_LABELS } from '../../offer-labels';
import { ImageField } from '../fields/image-field';
import { ImageListField } from '../fields/image-list-field';
import { TeacherPicker } from '../fields/teacher-picker';
import { formDirty } from './form-dirty';
import { OfferStep, orNull } from './offer-step';

/** Paso 1 — Datos e imágenes. */
@Component({
  selector: 'adm-general-step',
  imports: [ReactiveFormsModule, ImageField, ImageListField, TeacherPicker],
  providers: [{ provide: OfferStep, useExisting: forwardRef(() => GeneralStep) }],
  templateUrl: './general-step.html',
})
export class GeneralStep extends OfferStep {
  readonly slug = 'general' as const;

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly types = OFFER_TYPE_VALUES;
  protected readonly modalities = OFFER_MODALITY_VALUES;
  protected readonly topics = OFFER_TOPIC_VALUES;
  protected readonly typeLabels = OFFER_TYPE_LABELS;
  protected readonly modalityLabels = OFFER_MODALITY_LABELS;
  protected readonly topicLabels = OFFER_TOPIC_LABELS;

  protected readonly form = this.fb.group({
    name: [''],
    type: this.fb.control<OfferType>('DIPLOMA'),
    modality: this.fb.control<OfferModality>('ONLINE_LIVE'),
    cohortLabel: [''],
    summary: [''],
    publicTopic: this.fb.control<OfferTopic | ''>(''),
    capacity: this.fb.control<number | null>(null),
    venueName: [''],
    venueAddress: [''],
    venueCity: [''],
    venueMapsUrl: [''],
  });

  // Campos fuera del formulario (imágenes y docentes).
  protected readonly cover = signal<AdminImageDto | null>(null);
  protected readonly carousel = signal<readonly AdminImageDto[]>([]);
  protected readonly teachers = signal<readonly AdminTeacherRefDto[]>([]);
  private readonly snapshot = signal('');

  private readonly formIsDirty = formDirty(this.form);
  readonly dirty = computed(() => this.formIsDirty() || this.extrasKey() !== this.snapshot());
  private readonly extrasKey = computed(() =>
    JSON.stringify([
      this.cover()?.key ?? null,
      this.carousel().map((i) => i.key),
      this.teachers().map((t) => t.id),
    ]),
  );

  protected readonly modality = signal<OfferModality>('ONLINE_LIVE');
  protected readonly locked = computed(() => this.offer().hasEnrollments || this.readonly());

  constructor() {
    super();
    effect(() => {
      const offer = this.offer();
      untracked(() => this.reset(offer));
    });
    this.form.controls.modality.valueChanges.subscribe((m) => this.modality.set(m));
  }

  async save(): Promise<AdminOfferDetailDto | null> {
    const v = this.form.getRawValue();
    const body: UpdateGeneralStepDto = {
      name: v.name.trim(),
      ...(this.offer().hasEnrollments ? {} : { type: v.type, modality: v.modality }),
      cohortLabel: orNull(v.cohortLabel),
      summary: v.summary.trim(),
      coverImageKey: this.cover()?.key ?? null,
      carouselImageKeys: this.carousel().map((i) => i.key),
      publicTopic: v.publicTopic || null,
      teacherIds: this.teachers().map((t) => t.id),
      venueName: orNull(v.venueName),
      venueAddress: orNull(v.venueAddress),
      venueCity: orNull(v.venueCity),
      venueMapsUrl: orNull(v.venueMapsUrl),
      capacity: v.capacity ?? null,
    };
    return this.patch('general', body);
  }

  private reset(offer: AdminOfferDetailDto): void {
    const g = offer.general;
    this.form.reset({
      name: offer.name,
      type: offer.type,
      modality: offer.modality,
      cohortLabel: g.cohortLabel ?? '',
      summary: g.summary,
      publicTopic: g.publicTopic ?? '',
      capacity: g.capacity,
      venueName: g.venue.name ?? '',
      venueAddress: g.venue.address ?? '',
      venueCity: g.venue.city ?? '',
      venueMapsUrl: g.venue.mapsUrl ?? '',
    });
    this.modality.set(offer.modality);
    this.cover.set(g.coverImage);
    this.carousel.set(g.carouselImages);
    this.teachers.set(g.teachers);
    this.snapshot.set(this.extrasKey());
    this.applyReadonly(this.form);
    // Tipo y modalidad quedan fijos con inscritos.
    if (offer.hasEnrollments) {
      this.form.controls.type.disable({ emitEvent: false });
      this.form.controls.modality.disable({ emitEvent: false });
    }
  }
}
