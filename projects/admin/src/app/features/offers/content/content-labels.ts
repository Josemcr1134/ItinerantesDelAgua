import { MaterialResourceType, RecordingState, Visibility } from 'data-access';
import { formatOfferDate } from '../shared/zoned-time';

/** Secciones fijas de cada módulo (HU-28). */
export const SECTION_LABELS: Readonly<Record<MaterialResourceType, string>> = {
  PRESENTATION: 'Presentación',
  PRE_READING: 'Lecturas previas',
  ACTIVITY: 'Actividades',
};

/** Nombre de un recurso de la sección ("Agregar lectura previa"). */
export const RESOURCE_NOUN: Readonly<Record<MaterialResourceType, string>> = {
  PRESENTATION: 'presentación',
  PRE_READING: 'lectura previa',
  ACTIVITY: 'actividad',
};

export const RECORDING_STATE_LABELS: Readonly<Record<RecordingState, string>> = {
  AVAILABLE: 'Grabación disponible',
  AFTER_SESSION: 'Disponible tras la sesión',
  PENDING: 'Grabación pendiente',
  NOT_APPLICABLE: 'Sin grabación',
};

/** Lo que importa de un elemento publicable para describir su estado. */
export interface Publishable {
  readonly visibility: Visibility;
  readonly publishAt: string | null;
  readonly visibleNow: boolean;
}

export type PublicationTone = 'hidden' | 'scheduled' | 'published' | 'blocked';

/**
 * Estado visible de un módulo o recurso: Oculto, Programado (con fecha),
 * Publicado, o publicado pero aún no visible porque su módulo está oculto.
 */
export function publicationState(item: Publishable): { label: string; tone: PublicationTone } {
  if (item.visibility === 'HIDDEN') return { label: 'Oculto', tone: 'hidden' };
  if (item.visibleNow) return { label: 'Publicado', tone: 'published' };
  if (item.publishAt && Date.parse(item.publishAt) > Date.now()) {
    return { label: `Programado · ${formatOfferDate(item.publishAt)}`, tone: 'scheduled' };
  }
  return { label: 'Publicado (módulo oculto)', tone: 'blocked' };
}

const sizeFormat = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 });

/** Tamaño legible ("2.3 MB"). */
export function formatBytes(bytes: number | null): string | null {
  if (bytes === null) return null;
  if (bytes < 1024 * 1024) return `${sizeFormat.format(bytes / 1024)} KB`;
  return `${sizeFormat.format(bytes / (1024 * 1024))} MB`;
}
