/**
 * Textos de las pantallas de acceso. Diseño provisional: TODO(diseño/contenido)
 * ajustar con el Figma.
 */
export const AUTH_TEXTS = {
  brandAlt: 'Itinerantes del Agua',
  email: { label: 'Correo electrónico', placeholder: 'tucorreo@ejemplo.com' },
  password: {
    label: 'Contraseña',
    placeholder: '•••••••••',
    show: 'Mostrar contraseña',
    hide: 'Ocultar contraseña',
  },
  errors: {
    required: 'Este campo es obligatorio.',
    email: 'Escribe un correo válido.',
    code: (length: number) => `Escribe los ${length} dígitos del código.`,
    passwordRules: 'Usa al menos 8 caracteres, con letras y números.',
    mismatch: 'Las contraseñas no coinciden.',
  },
  login: {
    title: 'Iniciar sesión',
    subtitle: 'Ingresa con tu correo y contraseña.',
    rememberMe: 'Recordarme',
    forgot: '¿Olvidaste tu contraseña?',
    submit: 'Ingresar',
    submitting: 'Ingresando…',
    /** Botón tras un intento fallido (portal). */
    retry: 'Reintentar',
    /** Credenciales incorrectas, en el portal (Figma HU-04). */
    invalidCredentials: 'Credenciales Inválidas',
    expired: 'Tu sesión expiró. Inicia sesión de nuevo para continuar.',
    lockedUntil: (time: string) => `Podrás intentarlo de nuevo a las ${time}.`,
  },
  forgot: {
    title: 'Recuperar contraseña',
    back: 'Volver a iniciar sesión',
    steps: ['Correo', 'Código', 'Nueva contraseña'],
    stepLabel: (current: number, total: number) => `Paso ${current} de ${total}`,
    email: {
      subtitle: 'Te enviaremos un código para crear una nueva contraseña.',
      submit: 'Enviar código',
      submitting: 'Enviando…',
    },
    code: {
      subtitle: (email: string) => `Escribe el código que enviamos a ${email}.`,
      label: 'Código de verificación',
      submit: 'Verificar código',
      submitting: 'Verificando…',
      resend: 'Reenviar código',
      resendIn: (time: string) => `Puedes pedir otro código en ${time}`,
      resent: 'Te enviamos un código nuevo.',
      changeEmail: 'Usar otro correo',
      attemptsRemaining: (n: number) =>
        n === 1 ? 'Te queda 1 intento.' : `Te quedan ${n} intentos.`,
      lockedUntil: (time: string) => `Podrás intentarlo de nuevo a las ${time}.`,
    },
    password: {
      subtitle: 'Crea tu nueva contraseña.',
      newLabel: 'Nueva contraseña',
      confirmLabel: 'Confirmar contraseña',
      hint: 'Mínimo 8 caracteres, con al menos una letra y un número.',
      submit: 'Guardar contraseña',
      submitting: 'Guardando…',
    },
    done: {
      title: 'Contraseña actualizada',
      message: 'Ya puedes iniciar sesión con tu nueva contraseña.',
      confirm: 'Ir a iniciar sesión',
    },
  },
  /** Cuenta sin verificar al iniciar sesión (HU-03). TODO(contenido): validar. */
  verify: {
    title: 'Verifica tu correo',
    back: 'Volver a iniciar sesión',
    sent: (email: string) =>
      `Tu cuenta aún no está verificada. Escribe el código que enviamos a ${email}.`,
    notSent: (email: string) =>
      `Tu cuenta aún no está verificada. Escribe el código que enviamos a ${email} o pide uno nuevo.`,
    submit: 'Verificar e ingresar',
    submitting: 'Verificando…',
  },
} as const;

const timeFormat = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' });

/** Hora local de una fecha ISO ("14:35"). */
export const formatTime = (iso: string): string => timeFormat.format(new Date(iso));

/** Segundos como "m:ss". */
export const formatSeconds = (total: number): string =>
  `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
