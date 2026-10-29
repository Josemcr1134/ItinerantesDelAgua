import { CanMatchFn, UrlSegment } from '@angular/router';
import { OfferType } from 'data-access';

/** Sub-ítems de "Formación" (ruta → tipo de oferta de la API). */
export const FORMATION_TYPES = {
  diplomados: { type: 'DIPLOMA', label: 'Diplomados' },
  cursos: { type: 'COURSE', label: 'Cursos' },
  talleres: { type: 'WORKSHOP', label: 'Talleres' },
  eventos: { type: 'EVENT', label: 'Eventos' },
} as const satisfies Record<string, { type: OfferType; label: string }>;
export type FormationSlug = keyof typeof FORMATION_TYPES;

/** Pestañas (`?estado=`) → `phase` de la API. */
export const FORMATION_PHASES = {
  activos: { phase: 'ACTIVE', label: 'Activos' },
  completados: { phase: 'COMPLETED', label: 'Completados' },
  todos: { phase: 'ALL', label: 'Todos' },
} as const;
export type FormationPhaseSlug = keyof typeof FORMATION_PHASES;

export const isFormationSlug = (value: string): value is FormationSlug =>
  Object.hasOwn(FORMATION_TYPES, value);

export const isPhaseSlug = (value: string | undefined): value is FormationPhaseSlug =>
  !!value && Object.hasOwn(FORMATION_PHASES, value);

/** Ruta del sub-ítem de una oferta (los programas por convocatoria caen en Diplomados). */
export function formationPath(type: OfferType): string {
  const slug = (Object.keys(FORMATION_TYPES) as FormationSlug[]).find(
    (key) => FORMATION_TYPES[key].type === type,
  );
  return `/formacion/${slug ?? 'diplomados'}`;
}

/** Solo /formacion/diplomados, /cursos, /talleres y /eventos. */
export const formationTypeMatch: CanMatchFn = (_route, segments: UrlSegment[]) =>
  isFormationSlug(segments[0]?.path ?? '');
