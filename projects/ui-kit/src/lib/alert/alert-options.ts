import { InjectionToken } from '@angular/core';

/** Tipo de alerta: define el color, la ilustración y el rol accesible. */
export type AlertVariant = 'error' | 'warning' | 'success' | 'info' | 'network';

export interface AlertOptions {
  readonly variant?: AlertVariant;
  readonly title: string;
  readonly message: string;
  /** Lista de detalles (p. ej. errores por campo). */
  readonly details?: readonly string[];
  /** Código de referencia para soporte (p. ej. `requestId`). */
  readonly reference?: string | null;
  /** Texto del botón principal (por defecto, "Entendido"). */
  readonly confirmLabel?: string;
  /** Si se indica, la alerta pide confirmación y muestra este botón de cancelar. */
  readonly cancelLabel?: string;
  /** Ilustración propia (ruta); por defecto, la del tipo. */
  readonly illustration?: string;
}

/** Ruta de la ilustración de cada tipo de alerta. */
export const ALERT_ILLUSTRATIONS = new InjectionToken<Readonly<Record<AlertVariant, string>>>(
  'ALERT_ILLUSTRATIONS',
  {
    factory: () => ({
      error: 'assets/illustrations/alert-error.webp',
      warning: 'assets/illustrations/alert-warning.webp',
      success: 'assets/illustrations/alert-success.webp',
      info: 'assets/illustrations/alert-info.webp',
      network: 'assets/illustrations/alert-network.webp',
    }),
  },
);
