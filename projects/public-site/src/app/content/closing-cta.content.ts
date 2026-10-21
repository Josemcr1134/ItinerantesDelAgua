import { ClosingCtaContent } from '../sections/closing-cta/closing-cta-content';

const img = (name: string) => ({ src: `assets/images/${name}`, alt: '' });

// Copy tomado del Figma aprobado (Landing Desktop, componente "Contacto").
export const CLOSING_CTA_CONTENT: ClosingCtaContent = {
  heading: 'Territorios que cuidan\ny aprenden',
  paragraph:
    'Creemos en el conocimiento que nace del\nterritorio, en la colaboración y en las soluciones\nque regeneran la vida.',
  ctaLabel: 'Hablemos',
  form: {
    // Del Figma: "Correo", "Mensaje", "Enviar" y "Volver".
    // TODO(contenido/diseño): el resto de campos los exige la API de contacto y
    // no están en el Figma; confirmar textos y opciones.
    optionalLabel: '(opcional)',
    name: { label: 'Nombre', placeholder: 'Escribe tu nombre' },
    email: { label: 'Correo', placeholder: 'Escribe tu correo' },
    organization: { label: 'Organización', placeholder: 'Nombre de tu organización' },
    phone: {
      label: 'Teléfono / WhatsApp',
      countryCodeLabel: 'Indicativo',
      countryCodePlaceholder: '+52',
      numberLabel: 'Número',
      numberPlaceholder: 'Número sin indicativo',
    },
    subject: {
      label: 'Asunto',
      placeholder: 'Selecciona un asunto',
      options: {
        SCHOOL: 'Escuela Itinerante del Agua',
        DESIGN_CONSULTING: 'Diseño y consultoría',
        REGENERATIVE_TECH_HAWA: 'Tecnologías regenerativas (HAWA)',
        SCHOLARSHIPS_CALLS: 'Becas y convocatorias',
        OTHER: 'Otro',
      },
    },
    projectType: {
      label: 'Tipo de proyecto',
      placeholder: 'Selecciona el tipo de proyecto',
      options: {
        HOUSEHOLD: 'Vivienda',
        COMMERCIAL: 'Comercial',
        COLLECTIVE: 'Colectivo o comunitario',
        PRODUCTIVE: 'Productivo',
        OTHER: 'Otro',
      },
    },
    projectLocation: {
      label: 'Ubicación del proyecto',
      placeholder: 'Municipio, estado y país',
    },
    service: {
      label: 'Servicio de interés',
      placeholder: 'Selecciona un servicio',
      options: {
        WASTEWATER_TREATMENT_DESIGN: 'Diseño de tratamiento de aguas residuales',
        RAINWATER_HARVESTING_DESIGN: 'Diseño de captación de agua de lluvia',
        INFILTRATION_REHYDRATION_DESIGN: 'Diseño de infiltración y rehidratación',
        WATER_RESILIENCE_DIAGNOSTICS: 'Diagnóstico de resiliencia hídrica',
        TECHNOLOGY_IMPLEMENTATION_ADVICE: 'Asesoría para implementar tecnologías',
        NOT_SURE: 'Aún no lo sé',
      },
    },
    message: {
      label: 'Mensaje',
      placeholder: 'Escribe tu mensaje aquí',
      counter: (length, max) => `${length} / ${max}`,
    },
    privacy: {
      label: 'Acepto la política de tratamiento de datos personales.',
      // TODO(contenido): enlazar la política cuando exista.
      policyUrl: null,
      policyLinkLabel: 'Leer la política',
    },
    honeypotLabel: 'No llenes este campo',
    submitLabel: 'Enviar',
    backLabel: 'Volver',
    sendingLabel: 'Enviando…',
    errors: {
      required: 'Este campo es obligatorio.',
      nameMinLength: (min) => `Escribe al menos ${min} caracteres.`,
      emailInvalid: 'Escribe un correo válido, por ejemplo nombre@dominio.com.',
      countryCodeInvalid: 'Usa el formato +52.',
      phoneNumberInvalid: 'Escribe solo números (entre 6 y 15 dígitos).',
      phoneIncomplete: 'Completa el indicativo y el número, o deja ambos vacíos.',
      messageLength: (min, max) => `Escribe entre ${min} y ${max} caracteres.`,
      privacyRequired: 'Debes aceptar la política de datos para enviar tu mensaje.',
      reviewFields: 'Revisa los campos marcados.',
    },
    successMessage: '¡Gracias! Recibimos tu mensaje y te responderemos pronto.',
    failureMessage: 'No pudimos enviar tu mensaje. Inténtalo de nuevo más tarde.',
  },
  divider: img('blueLine.svg'),
  background: img('contactBackground.svg'),
  illustrations: { left: img('footerLeft.webp'), right: img('footerRight.webp') },
};
