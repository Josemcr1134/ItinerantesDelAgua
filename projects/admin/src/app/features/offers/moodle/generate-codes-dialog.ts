import { Component, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminMoodleApi, GeneratedCodesDto } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { Button, Dialog, DialogActions } from 'ui-kit';
import { saveFile } from '../../../core/download';
import { ErrorPresenter } from '../../../core/error-presenter';
import { formatOfferDate } from '../shared/zoned-time';

const MAX_CODES = 200;

/**
 * Generar códigos de acceso de un solo uso (1–200). La API los devuelve en
 * claro una sola vez: se muestran para copiarlos o descargarlos, y el
 * diálogo no se cierra con la X ni con Escape hasta hacerlo.
 */
@Component({
  selector: 'adm-generate-codes-dialog',
  imports: [FormsModule, Button, Dialog, DialogActions],
  templateUrl: './generate-codes-dialog.html',
  styleUrl: './moodle-dialogs.scss',
})
export class GenerateCodesDialog {
  readonly open = model(false);
  readonly offerId = input.required<string>();
  /** Nombre de la oferta (para el archivo descargado). */
  readonly offerName = input('');
  readonly generated = output<GeneratedCodesDto>();

  private readonly api = inject(AdminMoodleApi);
  private readonly errors = inject(ErrorPresenter);
  protected readonly maxCodes = MAX_CODES;
  protected readonly formatDate = formatOfferDate;

  protected readonly count = signal<number | null>(20);
  protected readonly error = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly result = signal<GeneratedCodesDto | null>(null);
  protected readonly copied = signal(false);
  /** Ya se copiaron o descargaron (hasta entonces, la X y Escape no cierran). */
  protected readonly kept = signal(false);

  constructor() {
    effect(() => {
      if (!this.open()) return;
      untracked(() => {
        this.count.set(20);
        this.error.set(null);
        this.result.set(null);
        this.copied.set(false);
        this.kept.set(false);
      });
    });
  }

  protected async submit(): Promise<void> {
    const count = this.count() ?? 0;
    if (!Number.isInteger(count) || count < 1 || count > MAX_CODES) {
      this.error.set(`Escribe un número entero entre 1 y ${MAX_CODES}.`);
      return;
    }
    this.error.set(null);
    this.busy.set(true);
    try {
      const result = await firstValueFrom(this.api.generateCodes(this.offerId(), { count }));
      this.result.set(result);
      this.generated.emit(result);
    } catch (error) {
      void this.errors.present(error);
    } finally {
      this.busy.set(false);
    }
  }

  protected async copy(): Promise<void> {
    const codes = this.result()?.codes ?? [];
    try {
      await navigator.clipboard.writeText(codes.join('\n'));
      this.copied.set(true);
      this.kept.set(true);
    } catch {
      this.error.set('No se pudo copiar; descárgalos o selecciónalos a mano.');
    }
  }

  protected download(): void {
    const codes = this.result()?.codes ?? [];
    const slug = this.offerName()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[^\w]+/g, '-')
      .replace(/^-|-$/g, '');
    this.kept.set(true);
    saveFile(
      new Blob([`codigo\n${codes.join('\n')}\n`], { type: 'text/csv' }),
      `codigos-${slug || 'moodle'}.csv`,
    );
  }
}
