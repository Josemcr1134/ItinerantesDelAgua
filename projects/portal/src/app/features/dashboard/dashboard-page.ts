import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { SessionStore } from 'auth';
import { DashboardApi, DashboardBlock, LibraryApi, LibraryItemDto, toApiError } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { AlertService } from 'ui-kit';
import { APPLICATION_STATUS_LABELS, browserTimezone } from './dashboard-format';
import { FALLBACK_COVERS, FormationCard } from './formation-card/formation-card';
import { NextActivity } from './next-activity/next-activity';
import { DashboardWidget } from './widget/dashboard-widget';

/**
 * Dashboard del participante (HU-06, Figma): próxima actividad, formación
 * activa con su progreso y accesos a Calendario, Convocatorias, Becas y
 * Biblioteca. Cada bloque es independiente: el que no llega muestra su
 * aviso con "Reintentar" y los demás se ven igual.
 */
@Component({
  selector: 'portal-dashboard-page',
  imports: [NgTemplateOutlet, RouterLink, NextActivity, FormationCard, DashboardWidget],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export default class DashboardPage {
  private readonly api = inject(DashboardApi);
  private readonly library = inject(LibraryApi);
  private readonly alerts = inject(AlertService);
  private readonly user = inject(SessionStore).user;

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

  /**
   * Abre un recurso de la biblioteca en otra pestaña. La pestaña se abre
   * antes de pedir la URL firmada para que el navegador no la bloquee.
   */
  protected async openResource(item: LibraryItemDto): Promise<void> {
    const tab = window.open('', '_blank');
    try {
      const access = await firstValueFrom(this.library.access(item.id));
      if (tab) {
        tab.opener = null;
        tab.location.href = access.url;
      } else {
        window.location.href = access.url;
      }
    } catch (error) {
      tab?.close();
      await this.alerts.error('No se pudo abrir el recurso', toApiError(error).message);
    }
  }
}
