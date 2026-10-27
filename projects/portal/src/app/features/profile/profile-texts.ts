import { AUTH_TEXTS } from 'auth';
import { REGISTER_TEXTS } from '../access/register/register-texts';

/** Textos de Mi perfil (Figma HU-14). TODO(contenido): confirmar avisos y errores. */
export const PROFILE_TEXTS = {
  title: 'Mi perfil',
  tabs: {
    datos: 'Datos personales',
    zona: 'Zona horaria',
    seguridad: 'Seguridad',
    pagos: 'Mis pagos',
  },
  personal: {
    fullName: 'Nombre completo',
    username: 'Username',
    email: 'Correo electrónico',
    readOnly: 'Solo lectura',
    notEditable: 'No editable',
    country: 'País',
    division: 'Estado / Departamento / Provincia',
    municipality: 'Municipio / Ciudad',
    phone: 'Teléfono de contacto',
    phoneCode: 'Indicativo del país',
    select: 'Opción',
    save: 'Guardar cambios',
    saving: 'Guardando…',
    saved: 'Cambios guardados',
    currencyNote: (currency: string) => `Tus pagos nuevos se cobran en ${currency} según tu país.`,
    catalogError: REGISTER_TEXTS.catalogError,
  },
  timezone: {
    label: 'Zona horaria',
    hint: 'Las sesiones y fechas del portal se muestran en esta zona (y en hora CDMX como referencia).',
    now: (time: string) => `Ahora son las ${time} en esta zona.`,
    detected: (zone: string) => `Tu navegador está en ${zone}.`,
    useDetected: 'Usar la de mi navegador',
    save: 'Guardar zona horaria',
    saved: 'Zona horaria guardada',
  },
  security: {
    current: 'Contraseña actual',
    next: 'Nueva contraseña',
    confirm: 'Confirmar nueva contraseña',
    rules: 'Mínimo 8 caracteres, con al menos una letra y un número.',
    mismatch: 'Las contraseñas no coinciden.',
    currentInvalid: 'La contraseña actual no es correcta.',
    save: 'Cambiar contraseña',
    saving: 'Cambiando…',
    saved: 'Contraseña actualizada',
    savedText: 'Cerramos tus otras sesiones; esta sigue activa.',
  },
  errors: REGISTER_TEXTS.errors,
  authErrors: AUTH_TEXTS.errors,
} as const;
