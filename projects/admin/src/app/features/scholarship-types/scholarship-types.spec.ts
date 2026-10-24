import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SessionStore } from 'auth';
import {
  AdminScholarshipTypeDto,
  apiErrorInterceptor,
  Permission,
  provideApi,
  UserProfileDto,
} from 'data-access';
import { AlertService } from 'ui-kit';
import { AdminAccess } from '../../core/access/admin-access';
import {
  OfferScholarshipChoice,
  ScholarshipTypesField,
} from '../offers/editor/fields/scholarship-types-field';
import ScholarshipTypesPage from './scholarship-types-page';

const API = 'https://api.test/api/v1/admin';
const tick = () => new Promise((r) => setTimeout(r));

const type = (id: string, name: string, extra: Partial<AdminScholarshipTypeDto> = {}) =>
  ({
    id,
    key: name.toUpperCase().replace(/\W+/g, '_'),
    name,
    minPercent: 50,
    maxPercent: 50,
    requiresInterview: false,
    description: null,
    sortOrder: 1,
    availableRecipients: null,
    isFull: false,
    maxRecipients: null,
    usedRecipients: 0,
    active: true,
    usage: { offers: 0, applications: 0, evaluations: 0 },
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    ...extra,
  }) satisfies AdminScholarshipTypeDto;

describe('ScholarshipTypesPage', () => {
  let warnings: string[];

  async function setup(permissions: Permission[], data: AdminScholarshipTypeDto[]) {
    warnings = [];
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        {
          provide: AlertService,
          useValue: {
            open: () => Promise.resolve(true),
            confirm: () => Promise.resolve(true),
            warning: (title: string) => (warnings.push(title), Promise.resolve(true)),
          },
        },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    TestBed.inject(SessionStore).setUser({ id: 'me', roles: [] } as unknown as UserProfileDto);
    const loaded = TestBed.inject(AdminAccess).load();
    http
      .expectOne(`${API}/me`)
      .flush({ user: { id: 'me', email: '', fullName: 'Ana' }, roles: [], permissions });
    await loaded;
    http.expectOne(`${API}/roles`).flush({ data: [] });
    const fixture = TestBed.createComponent(ScholarshipTypesPage);
    await fixture.whenStable();
    http.expectOne(`${API}/scholarship-types`).flush({ data });
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const settle = async () => {
      await tick();
      await fixture.whenStable();
    };
    const button = (text: string, root: ParentNode = document) =>
      [...root.querySelectorAll<HTMLButtonElement>('button')].find((b) =>
        b.textContent?.trim().startsWith(text),
      );
    return { fixture, http, host, settle, button };
  }

  it('muestra rango, cupo y uso; sin `scholarship_types.write` es solo lectura', async () => {
    const { host } = await setup(
      ['admin.access', 'offers.read'],
      [
        type('t1', 'Cenotes Vivos', {
          maxRecipients: 5,
          usedRecipients: 5,
          availableRecipients: 0,
          isFull: true,
          usage: { offers: 2, applications: 6, evaluations: 0 },
        }),
        type('t2', 'Beca especial', { minPercent: 71, maxPercent: 80, requiresInterview: true }),
      ],
    );
    const rows = host.querySelectorAll('tbody tr');
    expect(rows[0].textContent).toContain('5 / 5');
    expect(rows[0].textContent).toContain('Agotado');
    expect(rows[0].textContent).toContain('2 ofertas · 6 postulaciones');
    expect(rows[1].textContent).toContain('71–80%');
    expect(rows[1].textContent).toContain('requiere entrevista');
    expect(host.textContent).not.toContain('Nuevo tipo de beca');
    expect(host.querySelector('tbody button')).toBeNull();
  });

  it('no intenta borrar un tipo en uso: sugiere desactivarlo', async () => {
    const { http, host, settle, button } = await setup(
      ['admin.access', 'offers.read', 'scholarship_types.write'],
      [type('t1', 'Agua Viva', { usage: { offers: 1, applications: 0, evaluations: 0 } })],
    );
    button('Borrar', host)!.click();
    await settle();
    expect(warnings).toEqual(['«Agua Viva» no se puede borrar']);
    http.expectNone(`${API}/scholarship-types/t1`);
  });

  it('al editar envía solo lo que cambió (cupo sin límite = null)', async () => {
    const { http, host, settle, button } = await setup(
      ['admin.access', 'offers.read', 'scholarship_types.write'],
      [
        type('t1', 'Aguas Libres', {
          maxRecipients: 20,
          usedRecipients: 3,
          availableRecipients: 17,
        }),
      ],
    );
    button('Editar', host)!.click();
    await settle();
    expect(document.querySelector<HTMLInputElement>('#st-key')!.disabled).toBe(true);
    const cap = document.querySelector<HTMLInputElement>('#st-cap')!;
    cap.value = '';
    cap.dispatchEvent(new Event('input'));
    await settle();
    document.querySelector<HTMLFormElement>('#scholarship-type-form')!.requestSubmit();
    await settle();
    const patch = http.expectOne(`${API}/scholarship-types/t1`);
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual({ maxRecipients: null });
  });
});

@Component({
  imports: [ScholarshipTypesField],
  template: `<adm-scholarship-types-field [(value)]="value" [catalog]="catalog" />`,
})
class FieldHost {
  readonly value = signal<readonly OfferScholarshipChoice[]>([]);
  readonly catalog = [
    type('t1', 'Agua Viva', { minPercent: 25, maxPercent: 25 }),
    type('t2', 'Beca especial', { minPercent: 71, maxPercent: 80 }),
    type('t3', 'Antigua', { active: false }),
  ];
}

describe('ScholarshipTypesField', () => {
  it('habilita tipos activos y ajusta el rango y el tope solo para la oferta', async () => {
    const fixture = TestBed.createComponent(FieldHost);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    // Los inactivos que la oferta no tenía no se ofrecen.
    expect(host.querySelectorAll('.type').length).toBe(2);

    host.querySelectorAll<HTMLInputElement>('.type input[type=checkbox]')[1].click();
    await fixture.whenStable();
    const set = (selector: string, value: string) => {
      const el = host.querySelector<HTMLInputElement>(selector)!;
      el.value = value;
      el.dispatchEvent(new Event('input'));
    };
    set('#sch-min-t2', '75');
    set('#sch-cap-t2', '10');
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toEqual([
      { scholarshipTypeId: 't2', minPercent: 75, maxPercent: null, maxRecipients: 10 },
    ]);

    set('#sch-min-t2', '90');
    await fixture.whenStable();
    expect(host.textContent).toContain('El % mínimo no puede ser mayor que el máximo.');
  });
});
