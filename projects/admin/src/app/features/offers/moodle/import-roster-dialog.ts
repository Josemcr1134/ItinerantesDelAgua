import { Component, effect, inject, input, model, output, signal, untracked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminMoodleApi, RosterImportResultDto } from 'data-access';
import { firstValueFrom } from 'rxjs';
import { Button, Dialog, DialogActions } from 'ui-kit';
import { ErrorPresenter } from '../../../core/error-presenter';

/** Tamaño máximo del CSV que se lee en el navegador. */
const MAX_CSV_BYTES = 2 * 1024 * 1024;

/**
 * Cargar correos de un curso de Moodle: un CSV (columna `email`/`correo`) o
 * correos pegados, uno por línea. Es idempotente y muestra el resultado
 * (agregados, repetidos, inválidos y personas vinculadas al momento).
 */
@Component({
  selector: 'adm-import-roster-dialog',
  imports: [FormsModule, Button, Dialog, DialogActions],
  templateUrl: './import-roster-dialog.html',
  styleUrl: './moodle-dialogs.scss',
})
export class ImportRosterDialog {
  readonly open = model(false);
  readonly offerId = input.required<string>();
  readonly imported = output<RosterImportResultDto>();

  private readonly api = inject(AdminMoodleApi);
  private readonly errors = inject(ErrorPresenter);

  protected readonly text = signal('');
  protected readonly fileName = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly busy = signal(false);
  protected readonly result = signal<RosterImportResultDto | null>(null);

  constructor() {
    effect(() => {
      if (!this.open()) return;
      untracked(() => {
        this.text.set('');
        this.fileName.set(null);
        this.error.set(null);
        this.result.set(null);
      });
    });
  }

  /** Lee el CSV elegido y lo deja en el área de texto (se puede revisar antes de cargar). */
  protected async pick(input: HTMLInputElement): Promise<void> {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (file.size > MAX_CSV_BYTES) {
      this.error.set('El archivo pesa más de 2 MB. Divídelo en partes.');
      return;
    }
    this.error.set(null);
    this.fileName.set(file.name);
    this.text.set(await file.text());
  }

  protected async submit(): Promise<void> {
    const csv = this.text().trim();
    if (!csv) {
      this.error.set('Elige un CSV o pega al menos un correo.');
      return;
    }
    this.error.set(null);
    this.busy.set(true);
    try {
      const result = await firstValueFrom(this.api.importRoster(this.offerId(), { csv }));
      this.result.set(result);
      this.imported.emit(result);
    } catch (error) {
      void this.errors.present(error);
    } finally {
      this.busy.set(false);
    }
  }
}
