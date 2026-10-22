import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminModuleDto, AdminResourceDto, MaterialResourceType } from 'data-access';
import { Button } from 'ui-kit';
import { AdminAccess } from '../../../core/access/admin-access';
import { Notice } from '../../../shared/notice/notice';
import { PageHeader } from '../../../shared/page-header/page-header';
import { RequestState } from '../../../shared/request-state/request-state';
import { RECORDING_STATE_LABELS } from './content-labels';
import { ContentStore } from './content-store';
import { ModuleCard, ResourceRequest } from './module-card';
import { ModuleFormDialog } from './module-form-dialog';
import { ResourceFormDialog } from './resource-form-dialog';

const dateTime = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Mexico_City',
});

/**
 * Contenido del aula de una oferta (HU-28): módulos con sus secciones
 * (presentación, lecturas previas, actividades y grabaciones). Ver requiere
 * `offers.read`; agregar, editar, ordenar, publicar y borrar, `offers.write`.
 */
@Component({
  selector: 'adm-content-page',
  imports: [
    RouterLink,
    Button,
    Notice,
    PageHeader,
    RequestState,
    ModuleCard,
    ModuleFormDialog,
    ResourceFormDialog,
  ],
  providers: [ContentStore],
  templateUrl: './content-page.html',
  styleUrl: './content-page.scss',
})
export default class ContentPage {
  /** Id de la oferta (`/ofertas/:id/contenido`). */
  readonly id = input.required<string>();

  protected readonly store = inject(ContentStore);
  private readonly access = inject(AdminAccess);
  protected readonly canWrite = computed(() => this.access.permissions().has('offers.write'));
  protected readonly recordingLabels = RECORDING_STATE_LABELS;
  protected readonly formatDateTime = (iso: string) => dateTime.format(new Date(iso));

  /** Módulos desplegados (por id). */
  protected readonly expanded = signal<ReadonlySet<string>>(new Set());
  protected readonly allExpanded = computed(
    () =>
      this.store.modules().length > 0 &&
      this.store.modules().every((m) => this.expanded().has(m.id)),
  );

  // Diálogos
  protected readonly moduleOpen = signal(false);
  protected readonly editingModule = signal<AdminModuleDto | null>(null);
  protected readonly resourceOpen = signal(false);
  protected readonly resourceModule = signal<AdminModuleDto | null>(null);
  protected readonly resourceType = signal<MaterialResourceType>('PRE_READING');
  protected readonly editingResource = signal<AdminResourceDto | null>(null);

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(async () => {
        await this.store.load(id);
        // Con pocos módulos, se abren todos.
        const modules = this.store.modules();
        if (modules.length <= 2) this.expanded.set(new Set(modules.map((m) => m.id)));
      });
    });
  }

  protected isExpanded(module: AdminModuleDto): boolean {
    return this.expanded().has(module.id);
  }

  protected setExpanded(module: AdminModuleDto, open: boolean): void {
    this.expanded.update((set) => {
      const next = new Set(set);
      if (open) next.add(module.id);
      else next.delete(module.id);
      return next;
    });
  }

  protected toggleAll(): void {
    this.expanded.set(
      this.allExpanded() ? new Set() : new Set(this.store.modules().map((m) => m.id)),
    );
  }

  protected openModule(module: AdminModuleDto | null): void {
    this.editingModule.set(module);
    this.moduleOpen.set(true);
  }

  protected openResource(request: ResourceRequest): void {
    this.resourceModule.set(request.module);
    this.resourceType.set(request.type);
    this.editingResource.set(request.resource);
    this.resourceOpen.set(true);
    this.setExpanded(request.module, true);
  }
}
