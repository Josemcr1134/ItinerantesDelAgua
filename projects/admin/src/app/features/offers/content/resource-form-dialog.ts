import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
} from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  AdminModuleDto,
  AdminResourceDto,
  ApiBody,
  LibraryApi,
  MaterialResourceType,
  RESOURCE_UPLOAD_RULES,
} from 'data-access';
import { Dialog, DialogActions } from 'ui-kit';
import { FormActions } from '../../../shared/form-actions/form-actions';
import { remoteSearch } from '../../../shared/list/remote-search';
import { formatOfferDate, isoToZonedInput, zonedInputToIso } from '../shared/zoned-time';
import { formatBytes, RESOURCE_NOUN } from './content-labels';
import { ContentStore } from './content-store';
import { PublicationFields, PublicationValue } from './publication-fields';
import { publicationBody, publicationError, publicationFrom } from './publication';

type Source = 'FILE' | 'URL' | 'LIBRARY' | 'NONE';

const HTTPS_URL = /^https:\/\/\S+$/;
const TITLE_MAX = 200;

/** Extensiones visibles por sección (las reglas de tipo están en data-access). */
const ACCEPT_HINT: Readonly<Record<MaterialResourceType, string>> = {
  PRESENTATION: 'PDF o PPTX',
  PRE_READING: 'PDF, DOCX o EPUB',
  ACTIVITY: 'PDF, PPTX, DOCX o EPUB',
};

/**
 * Agregar o editar un recurso de una sección del módulo: presentación,
 * lectura previa (archivo, enlace o Biblioteca) o actividad (con fecha de
 * entrega). El archivo se sube al elegirlo; su `key` se guarda al confirmar.
 */
@Component({
  selector: 'adm-resource-form-dialog',
  imports: [ReactiveFormsModule, Dialog, DialogActions, FormActions, PublicationFields],
  templateUrl: './resource-form-dialog.html',
  styles: `
    .form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }
    .sources {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2) var(--space-4);
      margin: var(--space-2) 0 0;
      padding: 0;
      border: 0;
    }
    .file {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-2) var(--space-3);
      padding: var(--space-3);
      border-radius: 14px;
      background: #fff;
    }
    .file__name {
      font-weight: 600;
      overflow-wrap: anywhere;
    }
    .pick {
      align-self: flex-start;
      display: inline-flex;
      align-items: center;
      cursor: pointer;
    }
    .is-busy {
      cursor: progress;
      opacity: 0.6;
    }
    .pick:has(input:focus-visible) {
      outline: 3px solid var(--color-accent);
      outline-offset: 2px;
    }
    .results {
      display: grid;
      gap: 0;
      margin: var(--space-2) 0 0;
      padding: var(--space-1);
      border-radius: 12px;
      background: #fff;
      list-style: none;
    }
    .chosen {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      border-radius: 12px;
      background: #fff;
      font-weight: 600;
    }
  `,
})
export class ResourceFormDialog {
  readonly open = model(false);
  readonly module = input.required<AdminModuleDto | null>();
  readonly type = input.required<MaterialResourceType>();
  /** Recurso a editar (`null`: agregar uno nuevo). */
  readonly resource = input<AdminResourceDto | null>(null);

  protected readonly store = inject(ContentStore);
  private readonly library = inject(LibraryApi);

  protected readonly titleMax = TITLE_MAX;
  protected readonly noun = computed(() => RESOURCE_NOUN[this.type()]);
  protected readonly acceptHint = computed(() => ACCEPT_HINT[this.type()]);
  protected readonly accept = computed(() =>
    RESOURCE_UPLOAD_RULES.contentTypes[this.type()].join(','),
  );
  protected readonly formatBytes = formatBytes;

  protected readonly saving = signal(false);
  protected readonly uploading = signal(false);
  protected readonly submitted = signal(false);
  protected readonly source = signal<Source>('FILE');
  /** Archivo elegido: el actual del recurso o uno recién subido. */
  protected readonly file = signal<{
    key: string;
    name: string;
    size: number | null;
    changed: boolean;
  } | null>(null);
  protected readonly fileError = signal<string | null>(null);
  protected readonly libraryItem = signal<{ id: string; title: string } | null>(null);
  protected readonly publication = signal<PublicationValue>(publicationFrom(null, ''));
  protected readonly libraryResults = remoteSearch({
    fetch: (q) => this.library.list({ q, pageSize: 8 }),
    minLength: 2,
  });

  private readonly timezone = computed(
    () => this.store.offer()?.schedule.timezone ?? 'America/Mexico_City',
  );
  /** Periodo de la oferta (las actividades deben vencer dentro). */
  protected readonly period = computed(() => {
    const o = this.store.offer();
    return o?.startsAt && o.endsAt
      ? `${formatOfferDate(o.startsAt)} – ${formatOfferDate(o.endsAt)}`
      : null;
  });
  protected readonly pubError = computed(() =>
    publicationError(this.publication(), this.timezone()),
  );
  protected readonly sourceError = computed(() => {
    const source = this.source();
    if (source === 'FILE' && !this.file()) return 'Sube el archivo.';
    if (source === 'LIBRARY' && !this.libraryItem()) return 'Elige un recurso de la Biblioteca.';
    return null;
  });

  protected readonly form = inject(NonNullableFormBuilder).group({
    title: ['', [Validators.required, Validators.maxLength(TITLE_MAX)]],
    description: [''],
    url: ['', Validators.pattern(HTTPS_URL)],
    dueAt: [''],
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const resource = this.resource();
      untracked(() => this.reset(resource));
    });
  }

  protected showError(name: 'title' | 'url'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }

  protected chooseLibrary(item: { id: string; title: string }): void {
    this.libraryItem.set(item);
    this.libraryResults.reset();
    if (!this.form.controls.title.value) this.form.controls.title.setValue(item.title);
  }

  protected async pickFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const picked = input.files?.[0];
    input.value = '';
    const module = this.module();
    if (!picked || !module) return;
    const allowed = RESOURCE_UPLOAD_RULES.contentTypes[this.type()];
    if (!allowed.includes(picked.type)) {
      this.fileError.set(`Usa un archivo ${this.acceptHint()}.`);
      return;
    }
    if (picked.size > RESOURCE_UPLOAD_RULES.maxBytes) {
      this.fileError.set('El archivo pesa más de 50 MB.');
      return;
    }
    this.fileError.set(null);
    this.uploading.set(true);
    const key = await this.store.uploadFile(module, this.type(), picked);
    this.uploading.set(false);
    if (key) {
      this.file.set({ key, name: picked.name, size: picked.size, changed: true });
      if (!this.form.controls.title.value)
        this.form.controls.title.setValue(picked.name.replace(/\.[^.]+$/, ''));
    }
  }

  protected async save(): Promise<void> {
    this.submitted.set(true);
    if (this.form.invalid || this.sourceError() || this.pubError() || this.uploading()) return;
    const module = this.module();
    if (!module) return;
    const v = this.form.getRawValue();
    const body: ApiBody<'AdminContent_createResource'> = {
      type: this.type(),
      title: v.title.trim(),
      description: v.description.trim() || null,
      ...this.sourceBody(),
      ...(this.type() === 'ACTIVITY' && {
        activityDueAt: zonedInputToIso(v.dueAt, this.timezone()),
      }),
      ...publicationBody(this.publication(), this.timezone()),
    };
    this.saving.set(true);
    const saved = await this.store.saveResource(module, this.resource(), body);
    this.saving.set(false);
    if (saved) this.open.set(false);
  }

  /** Fuente para la API: solo se envía si cambió (al enviar una, la API limpia las otras). */
  private sourceBody(): Partial<ApiBody<'AdminContent_createResource'>> {
    const existing = this.resource();
    const v = this.form.getRawValue();
    switch (this.source()) {
      case 'FILE': {
        const file = this.file()!;
        return !existing || file.changed ? { fileKey: file.key, fileName: file.name } : {};
      }
      case 'URL':
        return existing?.source === 'URL' && existing.url === v.url.trim()
          ? {}
          : { url: v.url.trim() };
      case 'LIBRARY': {
        const item = this.libraryItem()!;
        return existing?.library?.id === item.id ? {} : { libraryResourceId: item.id };
      }
      default:
        return existing && existing.source !== 'NONE'
          ? { fileKey: null, url: null, libraryResourceId: null }
          : {};
    }
  }

  private reset(resource: AdminResourceDto | null): void {
    this.submitted.set(false);
    this.fileError.set(null);
    this.libraryResults.reset();
    this.form.reset({
      title: resource?.title ?? '',
      description: resource?.description ?? '',
      url: resource?.url ?? '',
      dueAt: isoToZonedInput(resource?.activityDueAt, this.timezone()),
    });
    const source = resource?.source;
    this.source.set(
      source === 'URL'
        ? 'URL'
        : source === 'LIBRARY'
          ? 'LIBRARY'
          : source === 'NONE'
            ? 'NONE'
            : 'FILE',
    );
    this.file.set(
      resource?.file
        ? {
            key: resource.file.key,
            name: resource.file.fileName ?? resource.title,
            size: resource.file.sizeBytes,
            changed: false,
          }
        : null,
    );
    this.libraryItem.set(resource?.library ?? null);
    this.publication.set(publicationFrom(resource, this.timezone()));
  }
}
