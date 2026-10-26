import { CalendarCategory, CalendarItemKind } from 'data-access';

/** Categorías del Figma (HU-10) con su color de chip y de evento. */
export const CALENDAR_CATEGORIES: readonly {
  readonly value: CalendarCategory;
  readonly label: string;
  readonly color: string;
}[] = [
  { value: 'TRAINING', label: 'Formación', color: '#3f5644' },
  { value: 'TERRITORY', label: 'Territorio', color: '#00a81c' },
  { value: 'COMMUNITY', label: 'Comunidad', color: '#db6e00' },
  { value: 'EVENTS', label: 'Eventos', color: '#ca0089' },
  { value: 'IMPORTANT_DATES', label: 'Importante', color: '#e2271f' },
];

export const CATEGORY_BY_VALUE = new Map(CALENDAR_CATEGORIES.map((c) => [c.value, c]));

/** Vistas (`?vista=`). */
export const CALENDAR_VIEWS = [
  { value: 'mes', label: 'Mes' },
  { value: 'semana', label: 'Semana' },
  { value: 'dia', label: 'Día' },
  { value: 'lista', label: 'Lista' },
] as const;
export type CalendarView = (typeof CALENDAR_VIEWS)[number]['value'];

export const isCalendarView = (value: string | undefined): value is CalendarView =>
  CALENDAR_VIEWS.some((view) => view.value === value);

/** Tipo de actividad. TODO(contenido): validar con el equipo (mismos textos que el admin). */
export const KIND_LABELS: Readonly<Record<CalendarItemKind, string>> = {
  SESSION: 'Sesión',
  ACTIVITY_DUE: 'Entrega de actividad',
  INTERVIEW: 'Entrevista',
  MANUAL: 'Evento',
  ENROLLMENT_OPENS: 'Apertura de inscripciones',
  ENROLLMENT_CLOSES: 'Cierre de inscripciones',
  OFFER_STARTS: 'Inicio de clases',
  SCHOLARSHIP_DEADLINE: 'Cierre de becas',
  FINAL_PROJECT: 'Entrega del proyecto final',
};

/** Encabezados de la cuadrícula (empieza en domingo, como el Figma). */
export const WEEKDAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
