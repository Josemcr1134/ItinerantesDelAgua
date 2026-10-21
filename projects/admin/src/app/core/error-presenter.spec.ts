import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ApiError } from 'data-access';
import { AlertOptions, AlertService } from 'ui-kit';
import { of, throwError } from 'rxjs';
import { ErrorPresenter } from './error-presenter';

describe('ErrorPresenter', () => {
  let opened: AlertOptions[];
  let presenter: ErrorPresenter;

  beforeEach(() => {
    opened = [];
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AlertService,
          useValue: { open: (o: AlertOptions) => (opened.push(o), Promise.resolve(true)) },
        },
      ],
    });
    presenter = TestBed.inject(ErrorPresenter);
  });

  it('presenta los errores de red con su ilustración', async () => {
    await presenter.present(new HttpErrorResponse({ status: 0 }));
    expect(opened[0]).toMatchObject({ variant: 'network', title: 'Sin conexión' });
  });

  it('usa el mensaje, los detalles y la referencia de la API', async () => {
    await presenter.present(
      new ApiError(
        'http',
        422,
        'VALIDATION_ERROR',
        'Datos inválidos',
        [{ field: 'email', code: 'INVALID_EMAIL', message: 'Correo inválido' }],
        'req-1',
      ),
    );
    expect(opened[0]).toMatchObject({
      variant: 'warning',
      title: 'Revisa los datos',
      message: 'Datos inválidos',
      details: ['Correo inválido'],
      reference: 'req-1',
    });
  });

  it('el operador presenta el error y completa sin propagarlo', () => {
    let completed = false;
    throwError(() => new HttpErrorResponse({ status: 500 }))
      .pipe(presenter.handle())
      .subscribe({ complete: () => (completed = true) });
    expect(completed).toBe(true);
    expect(opened[0]).toMatchObject({ variant: 'error', title: 'Algo salió mal' });

    let value = 0;
    of(1)
      .pipe(presenter.handle<number>())
      .subscribe((v) => (value = v));
    expect(value).toBe(1);
  });
});
