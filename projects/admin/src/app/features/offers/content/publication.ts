import { isoToZonedInput, zonedInputToIso } from '../shared/zoned-time';
import { Publishable } from './content-labels';
import { PublicationValue } from './publication-fields';

/** Valores del formulario a partir de un módulo o recurso (o los de uno nuevo). */
export function publicationFrom(
  item: (Publishable & { readonly notifyEnrollees: boolean }) | null,
  timezone: string,
): PublicationValue {
  const future = !!item?.publishAt && Date.parse(item.publishAt) > Date.now();
  return {
    visibility: item?.visibility ?? 'HIDDEN',
    scheduled: future,
    publishAt: future ? isoToZonedInput(item!.publishAt, timezone) : '',
    notifyEnrollees: item?.notifyEnrollees ?? true,
  };
}

/** Campos de publicación para la API (`publishAt` null = inmediata). */
export function publicationBody(value: PublicationValue, timezone: string) {
  return {
    visibility: value.visibility,
    publishAt:
      value.visibility === 'PUBLISHED' && value.scheduled
        ? zonedInputToIso(value.publishAt, timezone)
        : null,
    notifyEnrollees: value.notifyEnrollees,
  };
}

/** Mensaje si la programación no es válida (sin fecha o en el pasado). */
export function publicationError(value: PublicationValue, timezone: string): string | null {
  if (value.visibility !== 'PUBLISHED' || !value.scheduled) return null;
  const iso = zonedInputToIso(value.publishAt, timezone);
  if (!iso) return 'Indica la fecha y hora de publicación.';
  return Date.parse(iso) <= Date.now() ? 'La publicación programada debe ser en el futuro.' : null;
}
