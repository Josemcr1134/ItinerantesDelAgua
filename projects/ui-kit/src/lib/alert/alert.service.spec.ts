import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AlertService } from './alert.service';

const dialog = (): HTMLDialogElement | null => document.querySelector('ui-alert-dialog dialog');
const button = (text: string): HTMLButtonElement =>
  [...document.querySelectorAll<HTMLButtonElement>('ui-alert-dialog button')].find((b) =>
    b.textContent?.includes(text),
  )!;

describe('AlertService', () => {
  let alerts: AlertService;

  beforeEach(() => {
    alerts = TestBed.inject(AlertService);
  });

  it('muestra la alerta y resuelve true al confirmar', async () => {
    const result = alerts.error('Algo salió mal', 'Inténtalo de nuevo.', { reference: 'req-9' });
    await TestBed.inject(ApplicationRef).whenStable();

    expect(dialog()?.getAttribute('role')).toBe('alertdialog');
    expect(dialog()?.textContent).toContain('Algo salió mal');
    expect(dialog()?.textContent).toContain('req-9');

    button('Entendido').click();
    await expect(result).resolves.toBe(true);
    expect(dialog()).toBeNull();
  });

  it('confirm resuelve false al cancelar', async () => {
    const result = alerts.confirm('¿Eliminar?', 'No se puede deshacer.');
    await TestBed.inject(ApplicationRef).whenStable();

    button('Cancelar').click();
    await expect(result).resolves.toBe(false);
  });
});
