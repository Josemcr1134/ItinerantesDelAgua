import { ContactProjectType, ContactService, ContactSubject } from 'data-access';

/** Etiqueta y texto de ayuda de un campo. */
export interface FieldText {
  readonly label: string;
  readonly placeholder?: string;
}

export interface ContactFormContent {
  readonly name: FieldText;
  readonly email: FieldText;
  readonly subject: FieldText & { readonly options: Readonly<Record<ContactSubject, string>> };
  /** Campos extra cuando el asunto es "Diseño y consultoría". */
  readonly projectType: FieldText & {
    readonly options: Readonly<Record<ContactProjectType, string>>;
  };
  readonly projectLocation: FieldText;
  readonly service: FieldText & { readonly options: Readonly<Record<ContactService, string>> };
  readonly message: FieldText & {
    /** Contador de caracteres ("120 / 2000"). */
    readonly counter: (length: number, max: number) => string;
  };
  readonly privacy: {
    readonly label: string;
    /** URL de la política de datos; `null` mientras no exista. */
    readonly policyUrl: string | null;
    readonly policyLinkLabel: string;
  };
  /** Campo trampa para bots (oculto): etiqueta para el árbol accesible. */
  readonly honeypotLabel: string;
  readonly submitLabel: string;
  readonly sendingLabel: string;
  readonly backLabel: string;
  readonly errors: {
    readonly required: string;
    readonly nameMinLength: (min: number) => string;
    readonly emailInvalid: string;
    readonly messageLength: (min: number, max: number) => string;
    readonly privacyRequired: string;
    /** Mensaje de la alerta cuando la API rechaza algún campo. */
    readonly reviewFields: string;
  };
  /** Mensaje de la alerta de éxito. */
  readonly successMessage: string;
  /** Mensaje si la API no explica el error. */
  readonly failureMessage: string;
  /** Títulos de las alertas que informan el resultado del envío. */
  readonly alerts: {
    readonly successTitle: string;
    readonly reviewTitle: string;
    readonly rateLimitedTitle: string;
    readonly networkTitle: string;
    readonly errorTitle: string;
    readonly confirmLabel: string;
  };
}
