import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ApiError, LoadingService } from 'data-access';
import { AlertService, Button } from 'ui-kit';
import { ErrorPresenter } from '../../core/error-presenter';

/** Solo desarrollo: prueba visual de alertas y loader (`/ui`). */
@Component({
  selector: 'adm-ui-demo',
  imports: [Button],
  template: `
    <main class="demo">
      <h1>Componentes</h1>
      <div class="demo__actions">
        <button uiButton type="button" (click)="validation()">Error de validación</button>
        <button uiButton type="button" (click)="server()">Error del servidor</button>
        <button uiButton type="button" (click)="network()">Sin conexión</button>
        <button uiButton type="button" (click)="success()">Éxito</button>
        <button uiButton type="button" (click)="info()">Información</button>
        <button uiButton type="button" (click)="confirm()">Confirmación</button>
        <button uiButton type="button" (click)="load()">Loader (2 s)</button>
      </div>
      <p aria-live="polite">{{ result() }}</p>
    </main>
  `,
  styles: `
    .demo {
      display: grid;
      gap: var(--space-4);
      padding: var(--space-6) var(--space-3);
    }
    h1 {
      color: var(--color-primary);
      font-family: var(--font-family-display);
      font-size: 3rem;
    }
    .demo__actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
    }
  `,
})
export default class UiDemo {
  private readonly alerts = inject(AlertService);
  private readonly errors = inject(ErrorPresenter);
  private readonly loading = inject(LoadingService);
  protected readonly result = signal('');

  protected validation(): void {
    void this.errors.present(
      new ApiError(
        'http',
        422,
        'VALIDATION_ERROR',
        'Algunos campos no son válidos.',
        [
          {
            field: 'email',
            code: 'INVALID_EMAIL',
            message: 'El correo no tiene un formato válido.',
          },
          {
            field: 'phone.number',
            code: 'INVALID_LENGTH',
            message: 'El teléfono debe tener 10 dígitos.',
          },
        ],
        '3f9c1a7e-41b2-4d8a-9c0e-7b1d2a6f5e44',
      ),
    );
  }

  protected server(): void {
    void this.errors.present(new HttpErrorResponse({ status: 500 }));
  }

  protected network(): void {
    void this.errors.present(new HttpErrorResponse({ status: 0 }));
  }

  protected success(): void {
    void this.alerts.success('¡Listo!', 'Los cambios se guardaron correctamente.');
  }

  protected info(): void {
    void this.alerts.info('Información', 'Este es un mensaje informativo de ejemplo.');
  }

  protected async confirm(): Promise<void> {
    const ok = await this.alerts.confirm(
      '¿Eliminar el registro?',
      'Esta acción no se puede deshacer.',
      {
        confirmLabel: 'Eliminar',
        variant: 'error',
      },
    );
    this.result.set(ok ? 'Confirmado' : 'Cancelado');
  }

  protected load(): void {
    void this.loading.track(new Promise((resolve) => setTimeout(resolve, 2000)));
  }
}
