import { DOCUMENT } from '@angular/common';
import {
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  inject,
  Injectable,
} from '@angular/core';
import { AlertDialog } from './alert-dialog';
import { AlertOptions } from './alert-options';

type Extra = Omit<AlertOptions, 'title' | 'message' | 'variant'>;

/**
 * Abre modales de alerta desde código. Cada llamada devuelve una promesa que
 * se resuelve al cerrar: `true` si se confirmó, `false` si se canceló.
 *
 * ```ts
 * await alerts.success('Guardado', 'Los cambios se guardaron.');
 * if (await alerts.confirm('¿Eliminar?', 'Esta acción no se puede deshacer.')) { … }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class AlertService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);
  private readonly document = inject(DOCUMENT);

  open(options: AlertOptions): Promise<boolean> {
    const ref = createComponent(AlertDialog, { environmentInjector: this.injector });
    ref.setInput('options', options);
    this.appRef.attachView(ref.hostView);
    this.document.body.appendChild(ref.location.nativeElement);

    return new Promise<boolean>((resolve) => {
      const subscription = ref.instance.closed.subscribe((result) => {
        subscription.unsubscribe();
        this.appRef.detachView(ref.hostView);
        ref.destroy();
        resolve(result);
      });
    });
  }

  error(title: string, message: string, extra: Extra = {}): Promise<boolean> {
    return this.open({ ...extra, variant: 'error', title, message });
  }

  warning(title: string, message: string, extra: Extra = {}): Promise<boolean> {
    return this.open({ ...extra, variant: 'warning', title, message });
  }

  success(title: string, message: string, extra: Extra = {}): Promise<boolean> {
    return this.open({ ...extra, variant: 'success', title, message });
  }

  info(title: string, message: string, extra: Extra = {}): Promise<boolean> {
    return this.open({ ...extra, variant: 'info', title, message });
  }

  /** Pide confirmación: resuelve `true` solo si se pulsa el botón principal. */
  confirm(
    title: string,
    message: string,
    extra: Extra & { readonly variant?: AlertOptions['variant'] } = {},
  ): Promise<boolean> {
    return this.open({
      confirmLabel: 'Confirmar',
      cancelLabel: 'Cancelar',
      variant: 'warning',
      ...extra,
      title,
      message,
    });
  }
}
