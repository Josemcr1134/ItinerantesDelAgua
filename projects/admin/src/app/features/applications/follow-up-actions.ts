import { inject, Injectable } from '@angular/core';
import { AdminFollowUpApi } from 'data-access';
import { firstValueFrom } from 'rxjs';

/**
 * Contactar a una persona aprobada (HU-32), desde su postulación o desde la
 * lista de seguimiento. Cada acción devuelve el aviso para mostrar y lanza el
 * error de la API si falla (quien llama lo presenta).
 */
@Injectable({ providedIn: 'root' })
export class FollowUpActions {
  private readonly api = inject(AdminFollowUpApi);

  /** Correo de recordatorio (máx. uno cada 24 h); deja una nota automática. */
  async remind(applicationId: string): Promise<string> {
    const result = await firstValueFrom(this.api.remind(applicationId));
    return result.emailStatus === 'FAILED'
      ? 'Se registró el recordatorio, pero el correo no se envió.'
      : 'Se envió el recordatorio por correo.';
  }

  /**
   * Abre WhatsApp con el mensaje prellenado y registra el contacto. La pestaña
   * se abre antes de esperar a la API (si no, el navegador la bloquea): hay
   * que llamarlo directamente desde el clic.
   */
  async whatsapp(applicationId: string): Promise<string> {
    const tab = window.open('', '_blank');
    try {
      const result = await firstValueFrom(this.api.whatsapp(applicationId));
      if (tab) {
        tab.opener = null;
        tab.location.href = result.url;
      } else {
        window.open(result.url, '_blank', 'noopener');
      }
      return 'Se abrió WhatsApp con el mensaje y se registró el contacto.';
    } catch (error) {
      tab?.close();
      throw error;
    }
  }
}
