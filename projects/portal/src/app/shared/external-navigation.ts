import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { DownloadedFile } from 'data-access';

/**
 * Salidas fuera del Portal: ir a otra página (p. ej. el checkout de Stripe)
 * y guardar un archivo descargado. En un servicio para poder simularlas en
 * las pruebas.
 */
@Injectable({ providedIn: 'root' })
export class ExternalNavigation {
  private readonly document = inject(DOCUMENT);

  go(url: string): void {
    this.document.location.assign(url);
  }

  save(file: DownloadedFile): void {
    const url = URL.createObjectURL(file.blob);
    const link = this.document.createElement('a');
    link.href = url;
    link.download = file.fileName;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }
}
