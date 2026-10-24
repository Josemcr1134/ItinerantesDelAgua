import {
  AdminOfferStatus,
  CalendarCategory,
  OfferModality,
  OfferOrigin,
  OfferTopic,
  OfferType,
} from 'data-access';

/** Textos visibles de los enums de ofertas. TODO(contenido): validar con el equipo. */
export const OFFER_TYPE_LABELS: Readonly<Record<OfferType, string>> = {
  DIPLOMA: 'Diplomado',
  COURSE: 'Curso',
  WORKSHOP: 'Taller',
  EVENT: 'Evento',
  OPEN_CALL: 'Convocatoria',
};

export const OFFER_MODALITY_LABELS: Readonly<Record<OfferModality, string>> = {
  ONLINE_LIVE: 'En línea (en vivo)',
  IN_PERSON: 'Presencial',
};

export const OFFER_ORIGIN_LABELS: Readonly<Record<OfferOrigin, string>> = {
  NAS: 'Plataforma propia (NAS)',
  MOODLE: 'Moodle',
};

/** Estado del listado (HU-27). */
export const OFFER_STATUS_LABELS: Readonly<Record<AdminOfferStatus, string>> = {
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  ENROLLMENT_CLOSED: 'Inscripciones cerradas',
  FINISHED: 'Finalizado',
  ARCHIVED: 'Archivado',
};

/** Temáticas públicas (HU-34): mismos nombres que la landing ("Nuestros caminos"). */
export const OFFER_TOPIC_LABELS: Readonly<Record<OfferTopic, string>> = {
  ECOTECH_WATER_DIPLOMA: 'Diplomado en Ecotecnologías del Agua',
  ECOPEDAGOGIES_DIPLOMA: 'Diplomado de Ecopedagogías',
  WATER_APPRENTICES_SCHOOL: 'Escuela de Aprendices del Agua',
  WATER_TREATMENT_SYSTEMS_INTRO: 'Introducción a los sistemas de tratamiento de aguas',
  CONSTRUCTED_WETLANDS: 'Humedales construidos',
  DRY_TOILETS: 'Baños secos',
  WATER_HARVESTING: 'Captación y cosecha de agua',
  TRAVELING_WATER_LABS: 'Laboratorios Itinerantes del agua',
  TERRITORIAL_PRACTICES: 'Prácticas territoriales',
  FIELD_VISITS: 'Visitas y experiencias de campo',
};

export const CALENDAR_CATEGORY_LABELS: Readonly<Record<CalendarCategory, string>> = {
  TRAINING: 'Formación',
  TERRITORY: 'Territorio',
  COMMUNITY: 'Comunidad',
  EVENTS: 'Eventos',
  IMPORTANT_DATES: 'Fechas importantes',
};

/** Días ISO (1 = lunes … 7 = domingo). */
export const WEEKDAYS: readonly {
  readonly value: number;
  readonly short: string;
  readonly label: string;
}[] = [
  { value: 1, short: 'Lu', label: 'Lunes' },
  { value: 2, short: 'Ma', label: 'Martes' },
  { value: 3, short: 'Mi', label: 'Miércoles' },
  { value: 4, short: 'Ju', label: 'Jueves' },
  { value: 5, short: 'Vi', label: 'Viernes' },
  { value: 6, short: 'Sá', label: 'Sábado' },
  { value: 7, short: 'Do', label: 'Domingo' },
];
