import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AdminSiteApi, AdminSiteMetricDto, requestState } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { rowActions } from '../../shared/list/row-actions';
import { Notice } from '../../shared/notice/notice';
import { PageHeader } from '../../shared/page-header/page-header';
import { RequestState } from '../../shared/request-state/request-state';
import { MetricFormDialog } from './metric-form-dialog';

/**
 * Página web: lo que el equipo edita de la landing. Por ahora, las cifras de
 * impacto (incluidas las ocultas). Requiere `site.write`.
 */
@Component({
  selector: 'adm-site-page',
  imports: [Notice, PageHeader, RequestState, MetricFormDialog],
  templateUrl: './site-page.html',
  styleUrl: './site-page.scss',
})
export default class SitePage implements OnInit {
  private readonly api = inject(AdminSiteApi);

  protected readonly metrics = requestState<AdminSiteMetricDto[]>();
  /** Copia local que se actualiza con cada edición, en el orden de la landing. */
  private readonly edited = signal<AdminSiteMetricDto[] | null>(null);
  protected readonly items = computed(() =>
    [...(this.edited() ?? this.metrics.data() ?? [])].sort((a, b) => a.sortOrder - b.sortOrder),
  );
  protected readonly rows = rowActions();
  protected readonly notice = signal('');
  protected readonly formOpen = signal(false);
  protected readonly editing = signal<AdminSiteMetricDto | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.edited.set(null);
    void this.metrics.run(this.api.metrics());
  }

  protected openForm(metric: AdminSiteMetricDto): void {
    this.editing.set(metric);
    this.formOpen.set(true);
  }

  protected onSaved(metric: AdminSiteMetricDto): void {
    this.replace(metric);
    this.notice.set(`Se guardó «${metric.label}». ${CACHE_NOTE}`);
  }

  protected async toggle(metric: AdminSiteMetricDto): Promise<void> {
    const visible = !metric.visible;
    const updated = await this.rows.run(metric.key, () =>
      firstValueFrom(this.api.updateMetric(metric.key, { visible })),
    );
    if (!updated) return;
    this.replace(updated);
    this.notice.set(
      `«${updated.label}» ${visible ? 'ya se muestra' : 'ya no se muestra'} en la página web. ${CACHE_NOTE}`,
    );
  }

  private replace(metric: AdminSiteMetricDto): void {
    const current = this.edited() ?? this.metrics.data() ?? [];
    this.edited.set(current.map((m) => (m.key === metric.key ? metric : m)));
  }
}

/** La landing guarda las cifras en caché unos minutos. */
const CACHE_NOTE = 'El cambio puede tardar unos minutos en verse en el sitio.';
