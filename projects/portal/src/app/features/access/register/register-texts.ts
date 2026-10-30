import { AUTH_TEXTS } from 'auth';

/**
 * Textos del registro (Figma HU-02). Las reglas de cada campo repiten las de
 * la API (RegisterRequestDto). TODO(contenido): confirmar los mensajes.
 */
export const REGISTER_TEXTS = {
  title: 'Crear cuenta en el Portal',
  fullName: 'Nombre Completo',
  username: 'Nombre de Usuario',
  email: 'Email',
  emailHint:
    'Aquí recibirás tu código, comprobantes y recordatorios de pago. Ten espacio en tu bandeja.',
  phone: 'Número de Teléfono',
  phoneCode: 'Indicativo del país',
  country: 'País',
  division: 'Estado / Departamento / Provincia',
  municipality: 'Municipio / Ciudad',
  timezone: 'Zona Horaria Detectada (Editable)',
  password: 'Contraseña',
  select: 'Seleccionar',
  submit: 'Crear Cuenta',
  submitting: 'Creando cuenta…',
  haveAccount: '¿Ya tienes una Cuenta?',
  login: 'Inicia Sesión',
  catalogError: 'No se pudo cargar la lista. Recarga la página para intentarlo de nuevo.',
  errors: {
    ...AUTH_TEXTS.errors,
    fullName: 'Solo letras (con tildes o ñ) y espacios.',
    username: 'De 3 a 30 caracteres: letras, números, punto o guion bajo.',
    emailTaken: 'Este correo ya está registrado.',
    usernameTaken: 'Este nombre de usuario ya está registrado.',
    phoneDigits: 'Escribe solo números.',
    phoneLength: (min: number, max: number) =>
      min === max ? `El número debe tener ${min} dígitos.` : `De ${min} a ${max} dígitos.`,
  },
} as const;
