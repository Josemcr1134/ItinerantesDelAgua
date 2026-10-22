import { computed, inject, Injectable, signal } from '@angular/core';
import {
  AdminContentApi,
  AdminModuleDto,
  AdminModulesDto,
  AdminOfferDetailDto,
  AdminOffersApi,
  AdminResourceDto,
  ApiBody,
  MaterialResourceType,
  requestState,
} from 'data-access';
import { firstValueFrom, forkJoin } from 'rxjs';
import { ErrorPresenter } from '../../../core/error-presenter';

/** Orden de las secciones en la lista completa de recursos de un módulo. */
const SECTION_ORDER: readonly MaterialResourceType[] = ['PRESENTATION', 'PRE_READING', 'ACTIVITY'];

/** Recursos de un módulo por sección (la presentación es única). */
export function sectionResources(
  module: AdminModuleDto,
  type: MaterialResourceType,
): readonly AdminResourceDto[] {
  const s = module.sections;
  if (type === 'PRESENTATION') return s.presentation ? [s.presentation] : [];
  return type === 'PRE_READING' ? s.preReadings : s.activities;
}

/**
 * Estado y operaciones de "Contenido del aula" de una oferta. Se provee en la
 * página: las tarjetas de módulo y los diálogos lo inyectan. Cada operación
 * actualiza el estado local con la respuesta de la API, presenta el error si
 * falla y devuelve `null` en ese caso.
 */
@Injectable()
export class ContentStore {
  private readonly api = inject(AdminContentApi);
  private readonly offersApi = inject(AdminOffersApi);
  private readonly errors = inject(ErrorPresenter);

  private readonly request = requestState<[AdminModulesDto, AdminOfferDetailDto]>();
  private readonly contentState = signal<AdminModulesDto | null>(null);

  readonly content = this.contentState.asReadonly();
  /** Oferta: docentes, periodo y zona horaria (para fechas y docente del módulo). */
  readonly offer = computed(() => this.request.data()?.[1] ?? null);
  readonly modules = computed(() => this.contentState()?.modules ?? []);
  readonly loaded = computed(() => this.contentState() !== null);
  readonly error = computed(() => this.request.error());
  /** Mensaje del resultado de la última acción. */
  readonly notice = signal('');
  /** Elemento (módulo o recurso) con una acción en curso. */
  readonly busyId = signal<string | null>(null);

  private offerId = '';

  async load(offerId: string): Promise<void> {
    this.offerId = offerId;
    const result = await this.request.run(
      forkJoin([this.api.list(offerId), this.offersApi.detail(offerId)]),
    );
    if (result) this.contentState.set(result[0]);
  }

  reload(): Promise<void> {
    return this.load(this.offerId);
  }

  // --- Módulos ---

  async createModule(
    body: ApiBody<'AdminContent_createModule'>,
    publication: ApiBody<'AdminContent_updateModule'> | null,
  ): Promise<AdminModuleDto | null> {
    return this.run('new-module', async () => {
      let { module, notifiedCount } = await firstValueFrom(
        this.api.createModule(this.offerId, body),
      );
      // Se crea oculto: si se pidió publicarlo, se aplica enseguida.
      if (publication) {
        ({ module, notifiedCount } = await firstValueFrom(
          this.api.updateModule(module.id, publication),
        ));
      }
      this.patchModules((list) => [...list, module]);
      this.announce(`Se agregó el «Módulo ${module.number}: ${module.title}».`, notifiedCount);
      return module;
    });
  }

  async updateModule(
    module: AdminModuleDto,
    body: ApiBody<'AdminContent_updateModule'>,
    message: string,
  ): Promise<AdminModuleDto | null> {
    return this.run(module.id, async () => {
      const result = await firstValueFrom(this.api.updateModule(module.id, body));
      this.replaceModule(result.module);
      this.announce(message, result.notifiedCount);
      return result.module;
    });
  }

  async deleteModule(module: AdminModuleDto): Promise<boolean> {
    const done = await this.run(module.id, async () => {
      await firstValueFrom(this.api.deleteModule(module.id), { defaultValue: undefined });
      return true;
    });
    if (done) {
      // La numeración y las sesiones sin módulo cambian: se recarga.
      await this.reload();
      this.notice.set(`Se borró el «Módulo ${module.number}: ${module.title}».`);
    }
    return !!done;
  }

  async moveModule(module: AdminModuleDto, delta: number): Promise<void> {
    const ids = this.modules().map((m) => m.id);
    const index = ids.indexOf(module.id);
    const target = index + delta;
    if (target < 0 || target >= ids.length) return;
    [ids[index], ids[target]] = [ids[target], ids[index]];
    await this.run(module.id, async () => {
      const content = await firstValueFrom(
        this.api.reorderModules(this.offerId, { moduleIds: ids }),
      );
      this.contentState.set(content);
      this.notice.set(`«${module.title}» ahora es el módulo ${target + 1}.`);
      return true;
    });
  }

  // --- Recursos ---

  async saveResource(
    module: AdminModuleDto,
    existing: AdminResourceDto | null,
    body: ApiBody<'AdminContent_createResource'>,
  ): Promise<AdminResourceDto | null> {
    return this.run(existing?.id ?? `new-${module.id}`, async () => {
      const result = existing
        ? await firstValueFrom(this.api.updateResource(existing.id, withoutType(body)))
        : await firstValueFrom(this.api.createResource(module.id, body));
      await this.refreshModule(module.id);
      const verb = existing ? 'Se guardó' : 'Se agregó';
      const replaced = result.replacedResourceId ? ' (reemplaza la anterior)' : '';
      this.announce(`${verb} «${result.resource.title}»${replaced}.`, result.notifiedCount);
      return result.resource;
    });
  }

  async updateResource(
    module: AdminModuleDto,
    resource: AdminResourceDto,
    body: ApiBody<'AdminContent_updateResource'>,
    message: string,
  ): Promise<AdminResourceDto | null> {
    return this.run(resource.id, async () => {
      const result = await firstValueFrom(this.api.updateResource(resource.id, body));
      await this.refreshModule(module.id);
      this.announce(message, result.notifiedCount);
      return result.resource;
    });
  }

  async deleteResource(module: AdminModuleDto, resource: AdminResourceDto): Promise<boolean> {
    const done = await this.run(resource.id, async () => {
      await firstValueFrom(this.api.deleteResource(resource.id), { defaultValue: undefined });
      await this.refreshModule(module.id);
      this.notice.set(`Se borró «${resource.title}».`);
      return true;
    });
    return !!done;
  }

  /** Mueve un recurso dentro de su sección (la API recibe el orden completo del módulo). */
  async moveResource(
    module: AdminModuleDto,
    resource: AdminResourceDto,
    delta: number,
  ): Promise<void> {
    const section = [...sectionResources(module, resource.type)];
    const index = section.findIndex((r) => r.id === resource.id);
    const target = index + delta;
    if (target < 0 || target >= section.length) return;
    [section[index], section[target]] = [section[target], section[index]];
    const ids = SECTION_ORDER.flatMap((type) =>
      (type === resource.type ? section : sectionResources(module, type)).map((r) => r.id),
    );
    await this.run(resource.id, async () => {
      const updated = await firstValueFrom(
        this.api.reorderResources(module.id, { resourceIds: ids }),
      );
      this.replaceModule(updated);
      return true;
    });
  }

  /** Sube el archivo de un recurso (la `key` va luego en el recurso). */
  uploadFile(
    module: AdminModuleDto,
    type: MaterialResourceType,
    file: File,
  ): Promise<string | null> {
    return this.run(`upload-${module.id}`, () =>
      firstValueFrom(this.api.uploadResourceFile(module.id, type, file)),
    );
  }

  // --- Internos ---

  /** Vuelve a pedir el contenido y toma el módulo actualizado (secciones y orden). */
  private async refreshModule(moduleId: string): Promise<void> {
    const content = await firstValueFrom(this.api.list(this.offerId));
    const module = content.modules.find((m) => m.id === moduleId);
    if (module) this.replaceModule(module);
    else this.contentState.set(content);
  }

  private replaceModule(module: AdminModuleDto): void {
    this.patchModules((list) => list.map((m) => (m.id === module.id ? module : m)));
  }

  private patchModules(update: (list: readonly AdminModuleDto[]) => AdminModuleDto[]): void {
    const current = this.contentState();
    if (current) this.contentState.set({ ...current, modules: update(current.modules) });
  }

  private announce(message: string, notifiedCount: number): void {
    const notified =
      notifiedCount > 0
        ? ` Se notificó a ${notifiedCount} ${notifiedCount === 1 ? 'inscrito' : 'inscritos'}.`
        : '';
    this.notice.set(message + notified);
  }

  private async run<T>(id: string, task: () => Promise<T>): Promise<T | null> {
    this.busyId.set(id);
    try {
      return await task();
    } catch (error) {
      void this.errors.present(error);
      return null;
    } finally {
      this.busyId.set(null);
    }
  }
}

/** El tipo de un recurso no se cambia al editarlo. */
function withoutType(
  body: ApiBody<'AdminContent_createResource'>,
): ApiBody<'AdminContent_updateResource'> {
  const { type: _type, ...rest } = body;
  return rest;
}
