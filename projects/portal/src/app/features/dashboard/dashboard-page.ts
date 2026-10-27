import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { SessionStore } from 'auth';
import { DashboardApi, DashboardBlock, toApiError } from 'data-access';
import { resourceOpener } from '../library/open-resource';
import { APPLICATION_STATUS_LABELS } from '../../shared/applications/application-labels';
import { browserTimezone } from './dashboard-format';
import { FALLBACK_COVERS, FormationCard } from './formation-card/formation-card';
import { NextActivity } from './next-activity/next-activity';
import { PaymentNotices } from './payment-notices/payment-notices';
import { DashboardWidget } from './widget/dashboard-widget';

/**
 * Dashboard del participante (HU-06, Figma): próxima actividad, formación
 * activa con su progreso y accesos a Calendario, Convocatorias, Becas y
 * Biblioteca, con los avisos de pago arriba. Cada bloque es independiente: el que no llega muestra su
 * aviso con "Reintentar" y los demás se ven igual.
 */
@Component({
  selector: 'portal-dashboard-page',
  imports: [
    NgTemplateOutlet,
    RouterLink,
    NextActivity,
    FormationCard,
    DashboardWidget,
    PaymentNotices,
  ],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export default class DashboardPage {
  private readonly api = inject(DashboardApi);
  private readonly user = inject(SessionStore).user;
  /** Abre un recurso recomendado en otra pestaña (URL firmada). */
  protected readonly openResource = resourceOpener();

  protected readonly dashboard = rxResource({ stream: () => this.api.get() });
  protected readonly statusLabels = APPLICATION_STATUS_LABELS;
  protected readonly covers = FALLBACK_COVERS;

  /** Zona del perfil (HU-11) o, si no hay, la del navegador. */
  protected readonly timezone = computed(() => this.user()?.timezone ?? browserTimezone());
  private readonly failed = computed(
    () => new Set<DashboardBlock>(this.dashboard.value()?.failedBlocks ?? []),
  );
  protected readonly loadError = computed(() => {
    const error = this.dashboard.error();
    return error ? toApiError(error).message : null;
  });

  protected isFailed(block: DashboardBlock): boolean {
    return this.failed().has(block);
  }

  protected reload(): void {
    this.dashboard.reload();
  }
}
