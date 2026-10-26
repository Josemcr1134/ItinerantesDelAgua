import { Component, computed, inject, input } from '@angular/core';
import { ClassroomsApi, MaterialModuleDto, MaterialResourceDto } from 'data-access';
import { dateIn } from '../../../shared/applications/application-format';
import { tabOpener } from '../../../shared/open-in-tab';
import { MODULE_STATUS_LABELS, RECORDING_LABELS, fileSize, sessionWhen } from '../classroom-format';

type Group = 'presentation' | 'readings' | 'activities' | 'recordings';

/**
 * Módulos y materiales (HU-08): cada módulo se despliega con sus cuatro
 * grupos en orden (presentación, lecturas previas, actividades y
 * grabaciones). Los archivos se abren con una URL temporal; los enlaces, tal
 * cual. Abierto de inicio: el módulo en curso (o el primero).
 */
@Component({
  selector: 'portal-module-materials',
  templateUrl: './module-materials.html',
  styleUrls: ['./module-materials.scss', './module-resources.scss'],
})
export class ModuleMaterials {
  private readonly api = inject(ClassroomsApi);
  private readonly open = tabOpener();

  readonly offerId = input.required<string>();
  readonly modules = input.required<readonly MaterialModuleDto[]>();
  readonly timezone = input.required<string>();

  protected readonly statuses = MODULE_STATUS_LABELS;
  protected readonly recordingLabels = RECORDING_LABELS;
  protected readonly size = fileSize;
  /** Módulo abierto al cargar. */
  protected readonly openId = computed(() => {
    const modules = this.modules();
    return (modules.find((m) => m.status === 'IN_PROGRESS') ?? modules[0])?.id ?? null;
  });

  protected counts(module: MaterialModuleDto): string {
    const parts: [number, string, string][] = [
      [module.presentation ? 1 : 0, 'presentación', 'presentaciones'],
      [module.preReadings.length, 'lectura', 'lecturas'],
      [module.activities.length, 'actividad', 'actividades'],
      [module.recordings.filter((r) => r.state === 'AVAILABLE').length, 'grabación', 'grabaciones'],
    ];
    const text = parts
      .filter(([n]) => n > 0)
      .map(([n, one, many]) => `${n} ${n === 1 ? one : many}`)
      .join(' · ');
    return text || 'Aún sin materiales';
  }

  protected isEmpty(module: MaterialModuleDto): boolean {
    return (
      !module.presentation &&
      !module.preReadings.length &&
      !module.activities.length &&
      !module.recordings.length
    );
  }

  protected groups(
    module: MaterialModuleDto,
  ): { key: Group; title: string; items: readonly MaterialResourceDto[] }[] {
    return [
      {
        key: 'presentation' as const,
        title: 'Presentación del módulo',
        items: module.presentation ? [module.presentation] : [],
      },
      { key: 'readings' as const, title: 'Lecturas previas', items: module.preReadings },
      { key: 'activities' as const, title: 'Actividades', items: module.activities },
    ].filter((group) => group.items.length);
  }

  protected date(iso: string): string {
    return dateIn(iso, this.timezone());
  }

  protected when(recording: { startsAt: string; endsAt: string }): string {
    return sessionWhen(recording, this.timezone());
  }

  protected openFile(resource: MaterialResourceDto): Promise<void> {
    return this.open(
      this.api.resourceAccess(this.offerId(), resource.id),
      'No se pudo abrir el material',
    );
  }
}
