import { computed, inject, Injectable } from '@angular/core';
import { AdminContactApi, ContactInboxSummaryDto, ContactStatus, requestState } from 'data-access';
import { AdminAccess } from '../../core/access/admin-access';

/**
 * Contadores de la bandeja de Contacto: sin leer (menú lateral) y total por
 * estado (pestañas). Se refresca al entrar al panel y tras cada cambio.
 */
@Injectable({ providedIn: 'root' })
export class ContactInbox {
  private readonly api = inject(AdminContactApi);
  private readonly access = inject(AdminAccess);
  private readonly request = requestState<ContactInboxSummaryDto>();

  readonly summary = this.request.data;
  /** Mensajes nuevos (`NEW`). */
  readonly unread = computed(() => this.summary()?.unread ?? 0);

  count(status: ContactStatus): number {
    return this.summary()?.byStatus.find((s) => s.status === status)?.count ?? 0;
  }

  /** Solo con `contact.read`; un fallo deja el último valor (el contador no es crítico). */
  refresh(): void {
    if (this.access.can('contact.read')) {
      void this.request.run(this.api.summary());
    }
  }
}
