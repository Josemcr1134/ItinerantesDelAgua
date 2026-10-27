import { OfferAvailability, OfferModality, OfferType } from 'data-access';

const img = (name: string) => `assets/images/${name}`;

/** Filtro de tipo (`?tipo=`) → tipo de la API. */
export const CATALOG_TYPES = [
  { slug: 'diplomados', type: 'DIPLOMA', label: 'Diplomados' },
  { slug: 'cursos', type: 'COURSE', label: 'Cursos' },
  { slug: 'talleres', type: 'WORKSHOP', label: 'Talleres' },
  { slug: 'eventos', type: 'EVENT', label: 'Eventos' },
  { slug: 'convocatorias', type: 'OPEN_CALL', label: 'Programas por convocatoria' },
] as const satisfies readonly { slug: string; type: OfferType; label: string }[];

/** Filtro de modalidad (`?modalidad=`). */
export const CATALOG_MODALITIES = [
  { slug: 'en-linea', modality: 'ONLINE_LIVE', label: 'En línea' },
  { slug: 'presencial', modality: 'IN_PERSON', label: 'Presencial' },
] as const satisfies readonly { slug: string; modality: OfferModality; label: string }[];

/** Filtro de estado (`?estado=`); por defecto, abiertas y próximas (como la API). */
export const CATALOG_STATUSES = [
  { slug: 'abiertas', statuses: ['ENROLLMENT_OPEN', 'UPCOMING'], label: 'Abiertas + Próximamente' },
  {
    slug: 'inscripciones-abiertas',
    statuses: ['ENROLLMENT_OPEN'],
    label: 'Inscripciones abiertas',
  },
  { slug: 'proximamente', statuses: ['UPCOMING'], label: 'Próximamente' },
  { slug: 'cerradas', statuses: ['ENROLLMENT_CLOSED'], label: 'Inscripciones cerradas' },
  { slug: 'finalizadas', statuses: ['FINISHED'], label: 'Finalizadas' },
  {
    slug: 'todas',
    statuses: ['ENROLLMENT_OPEN', 'UPCOMING', 'ENROLLMENT_CLOSED', 'FINISHED'],
    label: 'Todas',
  },
] as const satisfies readonly {
  slug: string;
  statuses: readonly OfferAvailability[];
  label: string;
}[];

// Copy del Figma (Oferta formativa, nodo 336-12646).
export const CATALOG_CONTENT = {
  divider: { src: img('blueLine.svg'), alt: '' },
  heading: 'Oferta formativa',
  subtitle:
    'Diplomados, cursos, talleres, eventos y programas por convocatoria de la Escuela Itinerante del Agua.',
  allTypes: 'Todos',
  filtersLabel: 'Filtrar la oferta',
  modality: { label: 'Modalidad', all: 'Todas' },
  status: { label: 'Estado' },
  scholarship: 'Con beca disponible',
  search: { label: 'Buscar', placeholder: 'Nombre de la oferta o docente…' },
  loadMore: 'Cargar más',
  // TODO(contenido): confirmar los textos sin resultados y de error.
  empty: 'No encontramos ofertas con estos filtros.',
  clearFilters: 'Limpiar filtros',
  error: 'No pudimos cargar la oferta formativa.',
  retry: 'Reintentar',
  searchHint: 'Escribe al menos 3 letras.',
} as const;

/** Textos de cada tarjeta e ilustración por tipo (si la oferta no tiene portada). */
export const OFFER_CARD_CONTENT = {
  typeLabels: {
    DIPLOMA: 'Diplomado',
    COURSE: 'Curso',
    WORKSHOP: 'Taller',
    EVENT: 'Evento',
    OPEN_CALL: 'Programa por convocatoria',
  } satisfies Record<OfferType, string>,
  availabilityLabels: {
    ENROLLMENT_OPEN: 'Inscripciones abiertas',
    UPCOMING: 'Próximamente',
    ENROLLMENT_CLOSED: 'Inscripciones cerradas',
    FINISHED: 'Finalizado',
  } satisfies Record<OfferAvailability, string>,
  /** Sin portada: ilustración de la landing según el tipo. */
  fallbackImages: {
    DIPLOMA: img('ecoBath.webp'),
    COURSE: img('ladyOnTheRock.webp'),
    WORKSHOP: img('sculpture.webp'),
    EVENT: img('ladyAndFlowers.webp'),
    OPEN_CALL: img('flowerpotAndFlowers.webp'),
  } satisfies Record<OfferType, string>,
  viewDetail: 'Ver detalle',
  free: 'Gratuito',
  external: 'Inscripción externa',
  priceToConfirm: 'Costo por confirmar',
  installments: (n: number) => `hasta ${n} cuotas`,
  scholarship: (range: string) => `Beca disponible · ${range}`,
  cdmx: 'hora CDMX',
  yourTime: 'tu hora',
  inPerson: 'Presencial',
  venueToConfirm: 'Lugar por definir',
  datesToConfirm: 'Fechas por definir',
  // TODO(contenido): confirmar las notas de inscripción.
  opensOn: (date: string) => `Inscripciones abren el ${date}`,
  closesOn: (date: string) => `Inscripciones cierran el ${date}`,
  callClosesOn: (date: string) => `Convocatoria cierra el ${date}`,
} as const;
