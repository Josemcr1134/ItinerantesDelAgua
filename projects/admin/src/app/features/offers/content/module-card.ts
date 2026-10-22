import { Component, computed, inject, input, model, output } from '@angular/core';
import {
  AdminModuleDto,
  AdminRecordingRowDto,
  AdminResourceDto,
  MATERIAL_RESOURCE_TYPE_VALUES,
  MaterialResourceType,
} from 'data-access';
import { AlertService } from 'ui-kit';
import { RowMenu } from '../../../shared/row-menu/row-menu';
import { formatOfferDate } from '../shared/zoned-time';
import {
  formatBytes,
  publicationState,
  RECORDING_STATE_LABELS,
  RESOURCE_NOUN,
  SECTION_LABELS,
} from './content-labels';
import { ContentStore, sectionResources } from './content-store';

/** Pedido de abrir el formulario de un recurso. */
export interface ResourceRequest {
  readonly module: AdminModuleDto;
  readonly type: MaterialResourceType;
  readonly resource: AdminResourceDto | null;
}

const dateTime = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Mexico_City',
});

/**
 * Un módulo del aula con sus cuatro secciones. Las acciones rápidas
 * (publicar/ocultar, mover, borrar) van al store; editar o agregar abre los
 * diálogos de la página (`editModule`, `editResource`).
 */
@Component({
  selector: 'adm-module-card',
  imports: [RowMenu],
  templateUrl: './module-card.html',
  styleUrl: './module-card.scss',
})
export class ModuleCard {
  readonly module = input.required<AdminModuleDto>();
  readonly first = input(false);
  readonly last = input(false);
  readonly canWrite = input(false);
  readonly expanded = model(false);
  readonly editModule = output<AdminModuleDto>();
  readonly editResource = output<ResourceRequest>();

  protected readonly store = inject(ContentStore);
  private readonly alerts = inject(AlertService);

  protected readonly sections = MATERIAL_RESOURCE_TYPE_VALUES;
  protected readonly sectionLabels = SECTION_LABELS;
  protected readonly nouns = RESOURCE_NOUN;
  protected readonly recordingLabels = RECORDING_STATE_LABELS;
  protected readonly publicationState = publicationState;
  protected readonly formatBytes = formatBytes;
  protected readonly formatDate = formatOfferDate;
  protected readonly formatDateTime = (iso: string) => dateTime.format(new Date(iso));
  protected readonly sectionResources = sectionResources;

  protected readonly state = computed(() => publicationState(this.module()));
  protected readonly busy = computed(() => this.store.busyId() === this.module().id);
  protected readonly bodyId = computed(() => `module-${this.module().id}`);
  protected readonly counts = computed(() => {
    const s = this.module().sections;
    const pending = s.recordings.filter((r) => r.pending).length;
    return {
      resources: (s.presentation ? 1 : 0) + s.preReadings.length + s.activities.length,
      recordings: s.recordings.length,
      pending,
    };
  });

  protected isBusy(resource: AdminResourceDto): boolean {
    return this.store.busyId() === resource.id;
  }

  protected recordingDate(row: AdminRecordingRowDto): string {
    return this.formatDateTime(row.startsAt);
  }

  // --- Módulo ---

  protected async toggleModule(): Promise<void> {
    const module = this.module();
    const publishing = module.visibility === 'HIDDEN';
    if (
      publishing &&
      !(await this.confirmPublish(`el «Módulo ${module.number}»`, module.notifyEnrollees))
    )
      return;
    await this.store.updateModule(
      module,
      { visibility: publishing ? 'PUBLISHED' : 'HIDDEN' },
      publishing
        ? `Se publicó el «Módulo ${module.number}».`
        : `Se ocultó el «Módulo ${module.number}».`,
    );
  }

  protected async removeModule(): Promise<void> {
    const module = this.module();
    const total = this.counts().resources;
    const confirmed = await this.alerts.confirm(
      `¿Borrar el «Módulo ${module.number}: ${module.title}»?`,
      (total ? `Se borran también sus ${total} ${total === 1 ? 'recurso' : 'recursos'}. ` : '') +
        'Sus sesiones quedan sin módulo. Esta acción no se puede deshacer.',
      { confirmLabel: 'Borrar módulo', variant: 'error' },
    );
    if (confirmed) await this.store.deleteModule(module);
  }

  // --- Recursos ---

  protected async toggleResource(resource: AdminResourceDto): Promise<void> {
    const publishing = resource.visibility === 'HIDDEN';
    if (publishing && !(await this.confirmPublish(`«${resource.title}»`, resource.notifyEnrollees)))
      return;
    await this.store.updateResource(
      this.module(),
      resource,
      { visibility: publishing ? 'PUBLISHED' : 'HIDDEN' },
      publishing ? `Se publicó «${resource.title}».` : `Se ocultó «${resource.title}».`,
    );
  }

  protected async removeResource(resource: AdminResourceDto): Promise<void> {
    const confirmed = await this.alerts.confirm(
      `¿Borrar «${resource.title}»?`,
      'Se quita del módulo. Esta acción no se puede deshacer.',
      { confirmLabel: 'Borrar', variant: 'error' },
    );
    if (confirmed) await this.store.deleteResource(this.module(), resource);
  }

  /** Antes de publicar, recuerda a cuántos inscritos se avisará. */
  private confirmPublish(what: string, notify: boolean): Promise<boolean> {
    const enrollees = this.store.content()?.activeEnrollees ?? 0;
    return this.alerts.confirm(
      `¿Publicar ${what}?`,
      notify && enrollees
        ? `Se avisará a ${enrollees} ${enrollees === 1 ? 'inscrito' : 'inscritos'} por el portal y por correo (una sola vez).`
        : 'Quedará visible para las personas inscritas.',
      { confirmLabel: 'Publicar', variant: 'info' },
    );
  }
}
