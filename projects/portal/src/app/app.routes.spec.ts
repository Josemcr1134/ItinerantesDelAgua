import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Route, Router } from '@angular/router';
import { routes } from './app.routes';

@Component({ template: '' })
class Stub {}

/** Redirecciones de las rutas que usan los correos y las notificaciones. */
describe('Rutas del backend (correos y notificaciones)', () => {
  async function go(url: string): Promise<string> {
    const shell = routes.find((r) => r.path === '' && r.children)!;
    const redirects = shell.children!.filter((r: Route) => r.redirectTo);
    TestBed.configureTestingModule({
      providers: [provideRouter([...redirects, { path: '**', component: Stub }])],
    });
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    return router.url;
  }

  it.each([
    ['/aula/o1', '/formacion/aula/o1'],
    ['/aula/o1?seccion=sesiones', '/formacion/aula/o1?seccion=sesiones'],
    ['/aula/o1/materiales', '/formacion/aula/o1'],
    ['/sesiones', '/calendario'],
    ['/mi-formacion', '/formacion'],
    ['/pagar/diplomado-eco', '/inscripcion/diplomado-eco?accion=ENROLL_AND_PAY'],
    ['/postulaciones/a1/pago', '/pago?postulacion=a1'],
    [
      '/perfil/pagos?planId=p1&cardUpdate=success',
      '/perfil?planId=p1&cardUpdate=success&pestana=pagos',
    ],
  ])('%s → %s', async (from, to) => {
    expect(await go(from)).toBe(to);
  });
});
