import { ContactProjectType, ContactService, ContactStatus, ContactSubject } from 'data-access';

// Los mensajes ya traen `statusLabel`, `subjectLabel` y `originLabel` de la API;
// estas etiquetas son para los filtros y el cambio de estado.

export const CONTACT_STATUS_LABELS: Readonly<Record<ContactStatus, string>> = {
  NEW: 'Nuevo',
  IN_PROGRESS: 'En proceso',
  ANSWERED: 'Respondido',
  ARCHIVED: 'Archivado',
};

/** Tono de la insignia de cada estado (`adm-badge--…`; archivado, neutra). */
export const CONTACT_STATUS_TONES: Readonly<Record<ContactStatus, string>> = {
  NEW: 'pending',
  IN_PROGRESS: 'info',
  ANSWERED: 'success',
  ARCHIVED: 'neutral',
};

export const CONTACT_SUBJECT_LABELS: Readonly<Record<ContactSubject, string>> = {
  SCHOOL: 'Escuela Itinerante del Agua',
  DESIGN_CONSULTING: 'Diseño y consultoría',
  REGENERATIVE_TECH_HAWA: 'Tecnologías regenerativas (HAWA)',
  SCHOLARSHIPS_CALLS: 'Becas y convocatorias',
  OTHER: 'Otro',
};

/** Como en el formulario de la landing. */
export const CONTACT_PROJECT_TYPE_LABELS: Readonly<Record<ContactProjectType, string>> = {
  HOUSEHOLD: 'Vivienda',
  COMMERCIAL: 'Comercial',
  COLLECTIVE: 'Colectivo o comunitario',
  PRODUCTIVE: 'Productivo',
  OTHER: 'Otro',
};

/** Como en el formulario de la landing. */
export const CONTACT_SERVICE_LABELS: Readonly<Record<ContactService, string>> = {
  WASTEWATER_TREATMENT_DESIGN: 'Diseño de tratamiento de aguas residuales',
  RAINWATER_HARVESTING_DESIGN: 'Diseño de captación de agua de lluvia',
  INFILTRATION_REHYDRATION_DESIGN: 'Diseño de infiltración y rehidratación',
  WATER_RESILIENCE_DIAGNOSTICS: 'Diagnóstico de resiliencia hídrica',
  TECHNOLOGY_IMPLEMENTATION_ADVICE: 'Asesoría para implementar tecnologías',
  NOT_SURE: 'Aún no lo sé',
};
