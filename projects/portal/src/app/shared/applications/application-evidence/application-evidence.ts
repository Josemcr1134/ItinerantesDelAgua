import { Component, computed, inject, input, model, output, signal } from '@angular/core';
import {
  ApiError,
  ApplicationDetailDto,
  ApplicationsApi,
  FileLimitDto,
  toApiError,
} from 'data-access';
import { firstValueFrom } from 'rxjs';

/** "image/jpeg" → "JPG", "video/quicktime" → "MOV". */
const EXTENSIONS: Readonly<Record<string, string>> = { jpeg: 'JPG', quicktime: 'MOV' };
const extension = (mime: string) => {
  const subtype = mime.split('/')[1] ?? mime;
  return EXTENSIONS[subtype] ?? subtype.toUpperCase();
};
const limitLabel = (limit: FileLimitDto) =>
  `${limit.mimeTypes.map(extension).join('/')} hasta ${Math.round(limit.maxBytes / 1_048_576)} MB`;

/**
 * Evidencias de una postulación (Figma HU-20 y becas): archivos con subida
 * directa (arrastrar o elegir) y enlaces. Los archivos se guardan al subirlos
 * (`changed` trae la postulación actualizada); los enlaces son parte del
 * borrador (`links`) y se guardan con el formulario.
 */
@Component({
  selector: 'portal-application-evidence',
  template: `
    @let a = application();
    @if (a.editable) {
      <label
        class="drop"
        [class.drop--busy]="busy()"
        (dragover)="$event.preventDefault()"
        (drop)="$event.preventDefault(); upload($event.dataTransfer?.files ?? null)"
      >
        <input
          class="visually-hidden"
          type="file"
          multiple
          [accept]="accept()"
          [disabled]="busy() || a.documents.length >= limits().maxFiles"
          (change)="upload($any($event.target).files); $any($event.target).value = ''"
          [attr.aria-describedby]="describedBy()"
        />
        <svg
          aria-hidden="true"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 16V4M6 10l6-6 6 6M4 20h16" />
        </svg>
        @if (uploading(); as name) {
          <span>Subiendo {{ name }}…</span>
        } @else {
          <span>
            @if (dropPrefix()) {
              {{ dropPrefix() }} arrastra
            } @else {
              Arrastra
            }
            aquí o <strong class="drop__link">Seleccionar</strong>
          </span>
          <span class="drop__hint">{{ hint() }}</span>
        }
      </label>
    }
    @if (a.documents.length) {
      <ul class="files">
        @for (doc of a.documents; track doc.id) {
          <li class="files__item">
            <span class="files__name">{{ doc.fileName }}</span>
            <span class="files__size">{{ size(doc.sizeBytes) }}</span>
            @if (a.editable) {
              <button
                type="button"
                class="files__remove"
                [attr.aria-label]="'Quitar ' + doc.fileName"
                (click)="removeDocument(doc.id)"
              >
                ×
              </button>
            }
          </li>
        }
      </ul>
    }
    <div class="links">
      @for (link of links(); track $index; let i = $index) {
        <p class="links__item">
          <span class="links__url">{{ link }}</span>
          @if (a.editable) {
            <button
              type="button"
              class="files__remove"
              [attr.aria-label]="'Quitar ' + link"
              (click)="removeLink(i)"
            >
              ×
            </button>
          }
        </p>
      }
      @if (a.editable && links().length < limits().maxLinks) {
        <div class="links__add">
          <label class="visually-hidden" [for]="idPrefix() + '-link'">
            Enlace (YouTube, Vimeo, Drive, redes)
          </label>
          <input
            class="links__input"
            type="url"
            inputmode="url"
            [id]="idPrefix() + '-link'"
            [placeholder]="linkPlaceholder()"
            [value]="newLink()"
            (input)="newLink.set($any($event.target).value)"
            (keydown.enter)="$event.preventDefault(); addLink()"
          />
          <button type="button" class="links__button" (click)="addLink()">+ Agregar</button>
        </div>
      }
    </div>
  `,
  styleUrl: './application-evidence.scss',
})
export class ApplicationEvidence {
  private readonly api = inject(ApplicationsApi);

  readonly application = input.required<ApplicationDetailDto>();
  /** Enlaces del borrador (se guardan con el formulario). */
  readonly links = model.required<readonly string[]>();
  /** Hay una subida en curso (el formulario no se envía mientras tanto). */
  readonly busy = model(false);
  readonly idPrefix = input('app');
  /** Antes de "arrastra aquí" (p. ej. "Fotos o videos:"). */
  readonly dropPrefix = input('');
  readonly linkPlaceholder = input('https://… (YouTube, Drive, redes)');
  /** Id del texto que describe la zona (la etiqueta del campo). */
  readonly describedBy = input<string | null>(null);
  /** La postulación cambió (archivos subidos o quitados). */
  readonly changed = output<ApplicationDetailDto>();
  readonly failed = output<ApiError>();

  protected readonly uploading = signal<string | null>(null);
  protected readonly newLink = signal('');
  protected readonly limits = computed(() => this.application().form.limits);
  protected readonly accept = computed(() =>
    [...this.limits().image.mimeTypes, ...this.limits().video.mimeTypes].join(','),
  );
  protected readonly hint = computed(() => {
    const limits = this.limits();
    return `${limitLabel(limits.image)} · ${limitLabel(limits.video)} · máx. ${limits.maxFiles}`;
  });

  protected async upload(files: FileList | null): Promise<void> {
    if (!files?.length) return;
    const id = this.application().id;
    this.busy.set(true);
    for (const file of Array.from(files)) {
      this.uploading.set(file.name);
      try {
        await firstValueFrom(this.api.uploadDocument(id, file));
      } catch (error) {
        this.failed.emit(toApiError(error));
        break;
      }
    }
    this.uploading.set(null);
    await this.refresh();
    this.busy.set(false);
  }

  protected async removeDocument(documentId: string): Promise<void> {
    try {
      await firstValueFrom(this.api.deleteDocument(this.application().id, documentId));
      await this.refresh();
    } catch (error) {
      this.failed.emit(toApiError(error));
    }
  }

  protected addLink(): void {
    const url = this.newLink().trim();
    if (!url || this.links().length >= this.limits().maxLinks) return;
    this.links.update((list) => [...list, url]);
    this.newLink.set('');
  }

  protected removeLink(index: number): void {
    this.links.update((list) => list.filter((_, i) => i !== index));
  }

  protected size(bytes: number): string {
    return bytes >= 1_048_576
      ? `${(bytes / 1_048_576).toFixed(1)} MB`
      : `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  /** Vuelve a pedir la postulación (archivos nuevos o quitados). */
  private async refresh(): Promise<void> {
    try {
      this.changed.emit(await firstValueFrom(this.api.get(this.application().id)));
    } catch (error) {
      this.failed.emit(toApiError(error));
    }
  }
}
