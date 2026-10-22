import { Component, inject, input, model, signal } from '@angular/core';
import { AdminImageDto, ImageUploadPurpose } from 'data-access';
import { ImageUpload } from '../../../../shared/image-field/image-upload';

/** Varias imágenes en orden (carrusel): agregar, mover y quitar. */
@Component({
  selector: 'adm-image-list-field',
  template: `
    <div class="list-field">
      <span class="adm-field__label">{{ label() }}</span>
      @if (images().length) {
        <ol class="images">
          @for (img of images(); track img.key; let i = $index, first = $first, last = $last) {
            <li class="image">
              <img [src]="img.url" alt="" class="image__thumb" />
              <span class="image__pos">Imagen {{ i + 1 }}</span>
              @if (!disabled()) {
                <div class="image__actions">
                  <button
                    type="button"
                    class="adm-action"
                    [disabled]="first"
                    (click)="move(i, -1)"
                    [attr.aria-label]="'Subir imagen ' + (i + 1)"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    class="adm-action"
                    [disabled]="last"
                    (click)="move(i, 1)"
                    [attr.aria-label]="'Bajar imagen ' + (i + 1)"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    class="adm-action adm-action--danger"
                    (click)="remove(i)"
                    [attr.aria-label]="'Quitar imagen ' + (i + 1)"
                  >
                    Quitar
                  </button>
                </div>
              }
            </li>
          }
        </ol>
      } @else {
        <p class="adm-field__hint">Sin imágenes.</p>
      }
      @if (!disabled()) {
        <label class="adm-action pick" [class.is-busy]="uploading()">
          <input
            class="visually-hidden"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            [disabled]="uploading()"
            (change)="pick($event)"
          />
          {{ uploading() ? 'Subiendo…' : 'Agregar imágenes' }}
        </label>
        <p class="adm-field__hint">JPG, PNG o WebP de hasta 5 MB cada una.</p>
      }
      @if (error()) {
        <p class="adm-field__error" role="alert">{{ error() }}</p>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .list-field {
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      align-items: flex-start;
    }
    .images {
      display: grid;
      gap: var(--space-2);
      width: 100%;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .image {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-2);
      border-radius: 14px;
      background: #fff;
    }
    .image__thumb {
      width: 96px;
      height: 54px;
      border-radius: 8px;
      object-fit: cover;
    }
    .image__pos {
      flex: 1;
      font-size: 0.875rem;
      font-weight: 600;
    }
    .image__actions {
      display: flex;
      gap: var(--space-1);
    }
    .pick {
      display: inline-flex;
      align-items: center;
      cursor: pointer;
    }
    .pick:has(input:focus-visible) {
      outline: 3px solid var(--color-accent);
      outline-offset: 2px;
    }
    .is-busy {
      cursor: progress;
      opacity: 0.6;
    }
  `,
})
export class ImageListField {
  readonly images = model<readonly AdminImageDto[]>([]);
  readonly label = input.required<string>();
  readonly purpose = input.required<ImageUploadPurpose>();
  readonly offerId = input.required<string>();
  readonly disabled = input(false);

  private readonly uploader = inject(ImageUpload);
  protected readonly uploading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected move(index: number, delta: number): void {
    this.images.update((list) => {
      const next = [...list];
      [next[index], next[index + delta]] = [next[index + delta], next[index]];
      return next;
    });
  }

  protected remove(index: number): void {
    this.images.update((list) => list.filter((_, i) => i !== index));
  }

  protected async pick(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = [...(input.files ?? [])];
    input.value = '';
    const invalid = files.map((f) => this.uploader.validate(f)).find(Boolean) ?? null;
    this.error.set(invalid);
    if (invalid || !files.length) return;
    this.uploading.set(true);
    for (const file of files) {
      const uploaded = await this.uploader.upload(file, this.purpose(), this.offerId());
      if (uploaded) this.images.update((list) => [...list, uploaded]);
    }
    this.uploading.set(false);
  }
}
