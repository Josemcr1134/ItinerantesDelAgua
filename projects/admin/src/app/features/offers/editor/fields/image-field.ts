import { Component, inject, input, model, signal } from '@angular/core';
import { AdminImageDto, ImageUploadPurpose } from 'data-access';
import { ImageUpload } from './image-upload';

let nextImageFieldId = 0;

/** Imagen única (portada): vista previa, subir, cambiar y quitar. */
@Component({
  selector: 'adm-image-field',
  template: `
    <div class="image-field">
      <span class="adm-field__label" [id]="id + '-label'">{{ label() }}</span>
      <div class="image-field__box" [class.image-field__box--empty]="!image()">
        @if (image(); as img) {
          <img class="image-field__preview" [src]="img.url" alt="" />
        } @else {
          <span class="image-field__placeholder">Sin imagen</span>
        }
      </div>
      @if (!disabled()) {
        <div class="image-field__actions">
          <label class="adm-action image-field__pick" [class.is-busy]="uploading()">
            <input
              class="visually-hidden"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              [disabled]="uploading()"
              [attr.aria-describedby]="id + '-hint'"
              [attr.aria-labelledby]="id + '-label ' + id + '-pick'"
              (change)="pick($event)"
            />
            <span [id]="id + '-pick'">{{
              uploading() ? 'Subiendo…' : image() ? 'Cambiar imagen' : 'Subir imagen'
            }}</span>
          </label>
          @if (image() && !uploading()) {
            <button type="button" class="adm-action adm-action--danger" (click)="image.set(null)">
              Quitar
            </button>
          }
        </div>
        <p class="adm-field__hint" [id]="id + '-hint'">{{ hint() }}</p>
      }
      @if (error() || issue()) {
        <p class="adm-field__error" role="alert">{{ error() ?? issue() }}</p>
      }
    </div>
  `,
  styleUrl: './image-field.scss',
})
export class ImageField {
  readonly image = model<AdminImageDto | null>(null);
  readonly label = input.required<string>();
  readonly purpose = input.required<ImageUploadPurpose>();
  readonly offerId = input.required<string>();
  readonly disabled = input(false);
  readonly hint = input('JPG, PNG o WebP de hasta 5 MB.');
  /** Problema reportado por la API para este campo. */
  readonly issue = input<string | null>(null);

  private readonly uploader = inject(ImageUpload);
  protected readonly id = `adm-image-${nextImageFieldId++}`;
  protected readonly uploading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected async pick(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const invalid = this.uploader.validate(file);
    this.error.set(invalid);
    if (invalid) return;
    this.uploading.set(true);
    const uploaded = await this.uploader.upload(file, this.purpose(), this.offerId());
    this.uploading.set(false);
    if (uploaded) this.image.set(uploaded);
  }
}
