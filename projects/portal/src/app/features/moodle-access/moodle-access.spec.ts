import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { apiErrorInterceptor, FormationCardDto, provideApi } from 'data-access';
import { MoodleAccess, normalizeMoodleCode } from './moodle-access';

const API = 'https://api.test/api/v1';
const card = (id: string, name: string, canContinue = true) =>
  ({ enrollmentId: 'e-' + id, canContinue, offer: { id, name } }) as unknown as FormationCardDto;

describe('MoodleAccess', () => {
  function render() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
      ],
    });
    const fixture = TestBed.createComponent(MoodleAccess);
    const linked: (readonly FormationCardDto[])[] = [];
    fixture.componentInstance.linked.subscribe((value) => linked.push(value));
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const http = TestBed.inject(HttpTestingController);
    const settle = async () => {
      await new Promise((r) => setTimeout(r));
      await fixture.whenStable();
    };
    const typeCode = (value: string) => {
      const input = host.querySelector<HTMLInputElement>('#moodle-code')!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
      host.querySelector<HTMLFormElement>('form.code')!.dispatchEvent(new Event('submit'));
    };
    return { fixture, host, http, linked, settle, typeCode };
  }

  it('normaliza el código: mayúsculas, sin espacios y con guion', () => {
    expect(normalizeMoodleCode(' k7qm 3xpa ')).toBe('K7QM-3XPA');
    expect(normalizeMoodleCode('K7QM-3XPA')).toBe('K7QM-3XPA');
    expect(normalizeMoodleCode('K7Q')).toBe('K7Q');
  });

  it('buscar por correo: muestra lo vinculado con el enlace al aula y lo avisa', async () => {
    const { host, http, linked, settle } = render();
    host.querySelector<HTMLButtonElement>('.moodle__actions .button')!.click();
    http.expectOne(`${API}/me/moodle-access/link`).flush({
      found: true,
      linked: [card('o1', 'Diplomado Moodle'), card('o2', 'Taller', false)],
    });
    await settle();
    expect(host.textContent).toContain('vinculamos 2 formaciones');
    expect(host.querySelector('a[href="/formacion/aula/o1"]')).not.toBeNull();
    expect(host.textContent).toContain('Acceso suspendido');
    expect(linked).toHaveLength(1);
  });

  it('correo encontrado sin nada nuevo: ya están en Mi formación', async () => {
    const { host, http, linked, settle } = render();
    host.querySelector<HTMLButtonElement>('.moodle__actions .button')!.click();
    http.expectOne(`${API}/me/moodle-access/link`).flush({ found: true, linked: [] });
    await settle();
    expect(host.textContent).toContain('ya están en Mi formación');
    expect(linked).toHaveLength(0);
  });

  it('correo no encontrado: ofrece el código y el contacto', async () => {
    const { host, http, settle } = render();
    expect(host.querySelector('#moodle-code')).toBeNull();
    host.querySelector<HTMLButtonElement>('.moodle__actions .button')!.click();
    http.expectOne(`${API}/me/moodle-access/link`).flush({ found: false, linked: [] });
    await settle();
    expect(host.textContent).toContain('No encontramos una inscripción asociada a tu correo');
    expect(host.querySelector('#moodle-code')).not.toBeNull();
    expect(host.querySelector('a[href$="/#contacto"]')).not.toBeNull();
  });

  it('código incompleto: no lo envía', async () => {
    const { host, http, settle, typeCode } = render();
    host.querySelector<HTMLButtonElement>('.link')!.click();
    await settle();
    typeCode('K7Q');
    await settle();
    expect(host.textContent).toContain('Escribe el código completo');
    http.expectNone(`${API}/me/moodle-access/redeem`);
  });

  it('código usado o ya inscrito: muestra el error de la API o el enlace a Mi formación', async () => {
    const { host, http, settle, typeCode } = render();
    host.querySelector<HTMLButtonElement>('.link')!.click();
    await settle();
    typeCode('K7QM3XPA');
    http.expectOne(`${API}/me/moodle-access/redeem`).flush(
      {
        statusCode: 409,
        code: 'MOODLE_CODE_USED',
        message: 'Este código de acceso ya fue usado.',
      },
      { status: 409, statusText: 'Conflict' },
    );
    await settle();
    expect(host.querySelector('[role="alert"]')?.textContent).toContain('ya fue usado');

    typeCode('K7QM-3XPA');
    http
      .expectOne(`${API}/me/moodle-access/redeem`)
      .flush(
        { statusCode: 409, code: 'ENROLLMENT_ALREADY_EXISTS', message: 'Ya estás inscrito.' },
        { status: 409, statusText: 'Conflict' },
      );
    await settle();
    expect(host.textContent).toContain('Ya estás inscrito en esta formación');
    expect(host.querySelector('a[href="/formacion"]')).not.toBeNull();
  });
});
