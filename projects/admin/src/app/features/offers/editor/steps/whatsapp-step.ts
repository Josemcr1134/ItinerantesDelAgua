import { Component, computed, effect, forwardRef, inject, untracked } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminOfferDetailDto } from 'data-access';
import { isoToZonedInput, zonedInputToIso } from '../../shared/zoned-time';
import { formDirty } from './form-dirty';
import { OfferStep, orNull } from './offer-step';

const WHATSAPP_GROUP = /^https:\/\/chat\.whatsapp\.com\/\S+$/;

/** Paso 7 — Grupo de WhatsApp (solo lo ven las personas inscritas). */
@Component({
  selector: 'adm-whatsapp-step',
  imports: [ReactiveFormsModule],
  providers: [{ provide: OfferStep, useExisting: forwardRef(() => WhatsappStep) }],
  template: `
    <form [formGroup]="form" (submit)="$event.preventDefault()">
      <section class="adm-section" aria-labelledby="whatsapp-title">
        <h2 id="whatsapp-title" class="adm-section__title">Grupo de WhatsApp</h2>
        <p class="adm-section__lead">Solo lo ven las personas inscritas, en su aula.</p>
        <div class="adm-grid">
          <div class="adm-field adm-grid__full">
            <label class="adm-field__label" for="w-url">Enlace del grupo</label>
            <input
              id="w-url"
              class="adm-field__input"
              type="url"
              formControlName="url"
              placeholder="https://chat.whatsapp.com/…"
              [attr.aria-invalid]="form.controls.url.invalid || !!issue('whatsappGroupUrl')"
            />
            @if (form.controls.url.invalid) {
              <p class="adm-field__error">
                Usa un enlace de invitación de WhatsApp (https://chat.whatsapp.com/…).
              </p>
            } @else if (issue('whatsappGroupUrl')) {
              <p class="adm-field__error">{{ issue('whatsappGroupUrl') }}</p>
            }
          </div>
          <div class="adm-field">
            <label class="adm-field__label" for="w-from"
              >Visible desde <span class="adm-field__hint">(hora CDMX)</span></label
            >
            <input
              id="w-from"
              class="adm-field__input"
              type="datetime-local"
              formControlName="visibleFrom"
              aria-describedby="w-from-hint"
            />
            <p id="w-from-hint" class="adm-field__hint">Vacío: desde que la persona se inscribe.</p>
          </div>
        </div>
      </section>
    </form>
  `,
})
export class WhatsappStep extends OfferStep {
  readonly slug = 'whatsapp' as const;

  protected readonly form = inject(NonNullableFormBuilder).group({
    url: ['', Validators.pattern(WHATSAPP_GROUP)],
    visibleFrom: [''],
  });
  readonly dirty = formDirty(this.form);
  private readonly timezone = computed(() => this.offer().schedule.timezone);

  constructor() {
    super();
    effect(() => {
      const offer = this.offer();
      untracked(() => {
        this.form.reset({
          url: offer.whatsapp.whatsappGroupUrl ?? '',
          visibleFrom: isoToZonedInput(offer.whatsapp.whatsappVisibleFrom, offer.schedule.timezone),
        });
        this.applyReadonly(this.form);
      });
    });
  }

  async save(): Promise<AdminOfferDetailDto | null> {
    if (this.form.invalid) return null;
    const v = this.form.getRawValue();
    return this.patch('whatsapp', {
      whatsappGroupUrl: orNull(v.url),
      whatsappVisibleFrom: zonedInputToIso(v.visibleFrom, this.timezone()),
    });
  }
}
