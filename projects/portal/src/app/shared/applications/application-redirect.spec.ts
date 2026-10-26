import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  convertToParamMap,
  provideRouter,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { provideApi } from 'data-access';
import { firstValueFrom, isObservable } from 'rxjs';
import { applicationRedirect } from './application-redirect';

const API = 'https://api.test/api/v1';

describe('applicationRedirect', () => {
  function run(id: string) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
      ],
    });
    const route = { paramMap: convertToParamMap({ id }) } as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() =>
      applicationRedirect(route, {} as RouterStateSnapshot),
    );
    if (!isObservable(result)) throw new Error('Se esperaba un observable');
    const url = firstValueFrom(result).then((tree) => (tree as UrlTree).toString());
    return { url, http: TestBed.inject(HttpTestingController) };
  }

  it('una beca va a /becas/:id', async () => {
    const { url, http } = run('b1');
    http.expectOne(`${API}/me/applications/b1`).flush({ id: 'b1', kind: 'SCHOLARSHIP' });
    expect(await url).toBe('/becas/b1');
  });

  it('una convocatoria se abre en Mis Postulaciones', async () => {
    const { url, http } = run('c1');
    http.expectOne(`${API}/me/applications/c1`).flush({ id: 'c1', kind: 'OPEN_CALL' });
    expect(await url).toBe('/convocatorias?pestana=postulaciones&postulacion=c1');
  });

  it('si no existe, va a Mis Postulaciones', async () => {
    const { url, http } = run('x');
    http
      .expectOne(`${API}/me/applications/x`)
      .flush({ message: 'No existe' }, { status: 404, statusText: 'Not Found' });
    expect(await url).toBe('/convocatorias?pestana=postulaciones');
  });
});
