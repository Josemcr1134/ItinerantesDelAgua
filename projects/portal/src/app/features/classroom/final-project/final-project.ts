import { Component, computed, inject, input, output, signal } from '@angular/core';
import {
  ClassroomsApi,
  FINAL_PROJECT_CONTENT_TYPE_VALUES,
  FinalProjectContentType,
  FinalProjectDto,
  toApiError,
} from 'data-access';
import { firstValueFrom } from 'rxjs';
import { dateTimeIn } from '../../../shared/applications/application-format';
import { tabOpener } from '../../../shared/open-in-tab';
import { fileSize } from '../classroom-format';

/** Extensión → tipo que acepta la API (algunos navegadores mandan otro tipo para ZIP). */
const TYPE_BY_EXTENSION: Readonly<Record<string, FinalProjectContentType>> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  zip: 'application/zip',
};

/**
 * Proyecto final (HU-17, solo diplomados): lineamientos, fecha de entrega y
 * la entrega (subir o reemplazar hasta la fecha; después, solo descargar).
 */
@Component({
  selector: 'portal-final-project',
  templateUrl: './final-project.html',
  styleUrl: './final-project.scss',
})
export class FinalProject {
  private readonly api = inject(ClassroomsApi);
  private readonly open = tabOpener();

  readonly offerId = input.required<string>();
  readonly project = input.required<FinalProjectDto>();
  readonly timezone = input.required<string>();
  readonly changed = output<FinalProjectDto>();

  protected readonly uploading = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly size = fileSize;
  protected readonly accept =
    '.pdf,.docx,.pptx,.zip,' + FINAL_PROJECT_CONTENT_TYPE_VALUES.join(',');
  protected readonly maxLabel = computed(
    () => `${Math.round(this.project().maxBytes / 1_048_576)} MB`,
  );

  protected date(iso: string): string {
    return dateTimeIn(iso, this.timezone());
  }

  protected async upload(files: FileList | null): Promise<void> {
    const file = files?.[0];
    if (!file) return;
    this.error.set(null);
    const type = TYPE_BY_EXTENSION[file.name.split('.').pop()?.toLowerCase() ?? ''];
    if (!type) {
      this.error.set('Sube un archivo PDF, DOCX, PPTX o ZIP.');
      return;
    }
    if (file.size > this.project().maxBytes) {
      this.error.set(`El archivo pesa más de ${this.maxLabel()}.`);
      return;
    }
    this.uploading.set(file.name);
    try {
      const typed = file.type === type ? file : new File([file], file.name, { type });
      this.changed.emit(await firstValueFrom(this.api.uploadFinalProject(this.offerId(), typed)));
    } catch (error) {
      this.error.set(toApiError(error).message);
    } finally {
      this.uploading.set(null);
    }
  }

  protected download(): Promise<void> {
    return this.open(this.api.finalProjectDownload(this.offerId()), 'No se pudo abrir tu entrega');
  }
}
