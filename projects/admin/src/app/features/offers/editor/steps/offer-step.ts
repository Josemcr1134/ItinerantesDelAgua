import { computed, DestroyRef, Directive, inject, input, Signal, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { AdminOfferDetailDto, AdminOffersApi, OfferStepBodies, OfferStepSlug } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { ErrorPresenter } from '../../../../core/error-presenter';

/**
 * Base de cada paso del asistente. El paso recibe la oferta, reconstruye su
 * formulario cuando cambia (al cargar o tras guardar), indica si tiene cambios
 * sin guardar y los guarda con `PATCH /admin/offers/{id}/steps/{slug}`.
 *
 * Cada paso se registra como `{ provide: OfferStep, useExisting: … }` para que
 * la página pueda guardarlo al cambiar de paso.
 */
@Directive()
export abstract class OfferStep {
  readonly offer = input.required<AdminOfferDetailDto>();
  /** Sin `offers.write`: solo lectura. */
  readonly readonly = input(false);

  private readonly api = inject(AdminOffersApi);
  private readonly errors = inject(ErrorPresenter);
  protected readonly destroyRef = inject(DestroyRef);

  /** Segmento del paso en la API (`null`: el paso no se edita aquí). */
  abstract readonly slug: OfferStepSlug | null;
  /** Hay cambios sin guardar. */
  abstract readonly dirty: Signal<boolean>;
  /** Guarda el paso; devuelve la oferta actualizada o `null` si falló. */
  abstract save(): Promise<AdminOfferDetailDto | null>;

  protected readonly saving = signal(false);

  /** Problemas del paso según la API (`wizard.steps[n].issues`), por campo. */
  private readonly issues = computed(() => {
    const step = this.offer().wizard.steps.find((s) => s.slug === this.slug);
    return new Map((step?.issues ?? []).map((issue) => [fieldName(issue.field), issue.message]));
  });

  /** Mensaje de la API para un campo (o `null`). */
  protected issue(field: string): string | null {
    return this.issues().get(field) ?? null;
  }

  protected async patch<S extends OfferStepSlug>(
    step: S,
    body: OfferStepBodies[S],
  ): Promise<AdminOfferDetailDto | null> {
    this.saving.set(true);
    try {
      return await firstValueFrom(this.api.updateStep(this.offer().id, step, body));
    } catch (error) {
      void this.errors.present(error);
      return null;
    } finally {
      this.saving.set(false);
    }
  }

  /** Activa o desactiva los controles según el modo lectura. */
  protected applyReadonly(control: AbstractControl): void {
    if (this.readonly()) {
      control.disable({ emitEvent: false });
    } else {
      control.enable({ emitEvent: false });
    }
  }
}

/** "general.summary" o "summary" → "summary". */
const fieldName = (field: string) => field.slice(field.lastIndexOf('.') + 1);

/** Texto vacío → `null` (la API usa `null` para "sin valor"). */
export const orNull = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};
