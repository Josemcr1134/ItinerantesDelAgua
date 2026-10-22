import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  AdminModuleDto,
  AdminModulesDto,
  AdminResourceDto,
  apiErrorInterceptor,
  provideApi,
} from 'data-access';
import { AlertService } from 'ui-kit';
import { offerFixture } from '../testing/offer-fixture';
import { ContentStore } from './content-store';
import { ModuleCard } from './module-card';
import { publicationError } from './publication';

const API = 'https://api.test/api/v1/admin';
const tick = () => new Promise((r) => setTimeout(r));

const resource = (id: string, type: AdminResourceDto['type']): AdminResourceDto => ({
  id,
  type,
  title: id,
  description: null,
  source: 'URL',
  file: null,
  url: 'https://x.org',
  library: null,
  activityDueAt: null,
  position: 0,
  visibility: 'PUBLISHED',
  publishAt: null,
  visibleNow: true,
  notifyEnrollees: true,
  notifiedAt: null,
  updatedAt: '2026-10-22T12:00:00.000Z',
});

const module: AdminModuleDto = {
  id: 'm1',
  number: 1,
  title: 'Fundamentos',
  description: null,
  teacher: null,
  visibility: 'HIDDEN',
  publishAt: null,
  visibleNow: false,
  notifyEnrollees: true,
  notifiedAt: null,
  sections: {
    presentation: resource('p1', 'PRESENTATION'),
    preReadings: [resource('l1', 'PRE_READING'), resource('l2', 'PRE_READING')],
    activities: [resource('a1', 'ACTIVITY')],
    recordings: [
      {
        sessionId: 's1',
        startsAt: '2026-10-01T16:00:00.000Z',
        endsAt: '2026-10-01T18:00:00.000Z',
        status: 'SCHEDULED',
        recordingUrl: null,
        recordingPublishedAt: null,
        state: 'PENDING',
        pending: true,
      },
    ],
  },
};

const content: AdminModulesDto = {
  offerId: 'o1',
  offerName: 'Diplomado',
  modules: [module],
  unassignedRecordings: [],
  activeEnrollees: 34,
};

@Component({
  imports: [ModuleCard],
  providers: [ContentStore],
  template: `
    @if (store.modules()[0]; as m) {
      <adm-module-card [module]="m" [canWrite]="canWrite" [expanded]="true" />
    }
  `,
})
class Host {
  readonly store = inject(ContentStore);
  canWrite = true;
}

describe('Contenido del aula', () => {
  async function setup(canWrite = true) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        {
          provide: AlertService,
          useValue: { confirm: () => Promise.resolve(true), open: () => Promise.resolve(true) },
        },
      ],
    });
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.canWrite = canWrite;
    const store = fixture.componentInstance.store;
    const http = TestBed.inject(HttpTestingController);
    const loaded = store.load('o1');
    http.expectOne(`${API}/offers/o1/modules`).flush(content);
    http.expectOne(`${API}/offers/o1`).flush(offerFixture());
    await loaded;
    await fixture.whenStable();
    return { fixture, store, http, host: fixture.nativeElement as HTMLElement };
  }

  it('reordena un recurso dentro de su sección enviando el orden completo del módulo', async () => {
    const { store, http } = await setup();
    const moved = store.moveResource(module, module.sections.preReadings[1], -1);
    await tick();
    const req = http.expectOne(`${API}/modules/m1/resources/order`);
    expect(req.request.body).toEqual({ resourceIds: ['p1', 'l2', 'l1', 'a1'] });
    req.flush({
      ...module,
      sections: {
        ...module.sections,
        preReadings: [resource('l2', 'PRE_READING'), resource('l1', 'PRE_READING')],
      },
    });
    await moved;
    expect(store.modules()[0].sections.preReadings.map((r) => r.id)).toEqual(['l2', 'l1']);
  });

  it('crea un módulo y, si se pidió, lo publica y anuncia a cuántos se notificó', async () => {
    const { store, http } = await setup();
    const created = store.createModule(
      { title: 'Humedales' },
      { visibility: 'PUBLISHED', publishAt: null, notifyEnrollees: true },
    );
    await tick();
    const fresh = {
      ...module,
      id: 'm2',
      number: 2,
      title: 'Humedales',
      sections: { presentation: null, preReadings: [], activities: [], recordings: [] },
    };
    http.expectOne(`${API}/offers/o1/modules`).flush({ module: fresh, notifiedCount: 0 });
    await tick();
    const patch = http.expectOne(`${API}/modules/m2`);
    expect(patch.request.body).toEqual({
      visibility: 'PUBLISHED',
      publishAt: null,
      notifyEnrollees: true,
    });
    patch.flush({
      module: { ...fresh, visibility: 'PUBLISHED', visibleNow: true },
      notifiedCount: 34,
    });
    await created;
    expect(store.modules().map((m) => m.number)).toEqual([1, 2]);
    expect(store.notice()).toBe('Se agregó el «Módulo 2: Humedales». Se notificó a 34 inscritos.');
  });

  it('la tarjeta resalta la grabación pendiente y sin offers.write no ofrece acciones', async () => {
    const { host } = await setup(false);
    expect(host.querySelectorAll('.resource--pending').length).toBe(1);
    expect(host.textContent).toContain('1 grabación pendiente');
    expect(host.querySelector('adm-row-menu')).toBeNull();
    expect(host.textContent).not.toContain('Agregar');
  });

  it('la publicación programada debe tener fecha futura', () => {
    const base = { visibility: 'PUBLISHED' as const, scheduled: true, notifyEnrollees: true };
    expect(publicationError({ ...base, publishAt: '' }, 'America/Mexico_City')).toContain('fecha');
    expect(
      publicationError({ ...base, publishAt: '2020-01-01T10:00' }, 'America/Mexico_City'),
    ).toContain('futuro');
    expect(
      publicationError({ ...base, publishAt: '2099-01-01T10:00' }, 'America/Mexico_City'),
    ).toBeNull();
    expect(
      publicationError({ ...base, visibility: 'HIDDEN', publishAt: '' }, 'America/Mexico_City'),
    ).toBeNull();
  });
});
