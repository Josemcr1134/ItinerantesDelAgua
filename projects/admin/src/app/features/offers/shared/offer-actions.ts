import { inject, Injectable } from '@angular/core';
import { AdminOfferDetailDto, AdminOfferListItemDto, AdminOffersApi } from 'data-access';
import { AlertService } from 'ui-kit';
import { firstValueFrom, Observable } from 'rxjs';
import { ErrorPresenter } from '../../../core/error-presenter';

type OfferRef = Pick<AdminOfferListItemDto, 'id' | 'name' | 'adminStatus' | 'publicationStatus'>;

/**
 * Cambios de estado de una oferta con su confirmación y manejo de errores
 * (los usan el listado y el asistente). Devuelven la oferta actualizada, o
 * `null` si se canceló o falló.
 */
@Injectable({ providedIn: 'root' })
export class OfferActions {
  private readonly api = inject(AdminOffersApi);
  private readonly alerts = inject(AlertService);
  private readonly errors = inject(ErrorPresenter);

  async publish(offer: OfferRef): Promise<AdminOfferDetailDto | null> {
    const confirmed = await this.alerts.confirm(
      `¿Publicar «${offer.name}»?`,
      'Aparecerá en el catálogo del sitio y las personas podrán inscribirse según sus fechas.',
      { confirmLabel: 'Publicar', variant: 'info' },
    );
    if (!confirmed) return null;
    const updated = await this.run(this.api.publish(offer.id));
    if (updated?.sessionPreview.available) {
      void this.alerts.info(
        'Oferta publicada',
        'Ya tiene fechas y regla de horario: el siguiente paso es generar sus sesiones (módulo de sesiones).',
      );
    }
    return updated;
  }

  async unpublish(offer: OfferRef): Promise<AdminOfferDetailDto | null> {
    const confirmed = await this.alerts.confirm(
      `¿Despublicar «${offer.name}»?`,
      'Vuelve a borrador y sale del catálogo. Las personas inscritas conservan su aula.',
      { confirmLabel: 'Despublicar' },
    );
    return confirmed ? this.run(this.api.unpublish(offer.id)) : null;
  }

  async archive(offer: OfferRef): Promise<AdminOfferDetailDto | null> {
    const confirmed = await this.alerts.confirm(
      `¿Archivar «${offer.name}»?`,
      'Sale del catálogo y de su ficha pública. Puedes volver a dejarla en borrador después.',
      { confirmLabel: 'Archivar' },
    );
    return confirmed ? this.run(this.api.archive(offer.id)) : null;
  }

  /** Nueva cohorte en borrador ("<nombre> (copia)"). */
  async duplicate(offer: OfferRef): Promise<AdminOfferDetailDto | null> {
    const confirmed = await this.alerts.confirm(
      `¿Duplicar «${offer.name}»?`,
      'Se crea un borrador con su contenido, precio, horario y docentes, sin fechas, sesiones ni inscripciones.',
      { confirmLabel: 'Duplicar', variant: 'info' },
    );
    return confirmed ? this.run(this.api.duplicate(offer.id)) : null;
  }

  /** Solo borradores sin inscripciones; devuelve `true` si se borró. */
  async remove(offer: OfferRef): Promise<boolean> {
    const confirmed = await this.alerts.confirm(
      `¿Borrar «${offer.name}»?`,
      'El borrador se elimina definitivamente. Esta acción no se puede deshacer.',
      { confirmLabel: 'Borrar', variant: 'error' },
    );
    if (!confirmed) return false;
    try {
      await firstValueFrom(this.api.remove(offer.id), { defaultValue: undefined });
      return true;
    } catch (error) {
      void this.errors.present(error);
      return false;
    }
  }

  private async run(request: Observable<AdminOfferDetailDto>): Promise<AdminOfferDetailDto | null> {
    try {
      return await firstValueFrom(request);
    } catch (error) {
      void this.errors.present(error);
      return null;
    }
  }
}
