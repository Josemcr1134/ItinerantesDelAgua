import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AdminUserDto, provideApi } from 'data-access';
import { AlertService } from 'ui-kit';
import { EditRolesDialog } from './edit-roles-dialog';

const laura: AdminUserDto = {
  id: 'u2',
  fullName: 'Laura',
  email: 'laura@x.org',
  username: 'laura',
  roles: ['PARTICIPANT', 'FINANCE'],
  permissions: [],
  status: 'ACTIVE',
  countryCode: 'MX',
  lastLoginAt: null,
  createdAt: '2026-10-01T12:00:00.000Z',
};

describe('EditRolesDialog', () => {
  async function setup() {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        { provide: AlertService, useValue: { open: () => Promise.resolve(true) } },
      ],
    });
    const fixture = TestBed.createComponent(EditRolesDialog);
    fixture.componentRef.setInput('roles', [
      { role: 'FINANCE', label: 'Finanzas', permissions: [] },
      { role: 'FOLLOW_UP', label: 'Seguimiento', permissions: [] },
    ]);
    fixture.componentRef.setInput('user', laura);
    fixture.componentRef.setInput('open', true);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const saved: AdminUserDto[] = [];
    const removed: AdminUserDto[] = [];
    fixture.componentInstance.saved.subscribe((u) => saved.push(u));
    fixture.componentInstance.removeRequested.subscribe((u) => removed.push(u));
    const checkbox = (i: number) =>
      host.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')[i];
    const save = async () => {
      [...host.querySelectorAll<HTMLButtonElement>('button')]
        .find((b) => b.textContent?.includes('Guardar roles'))!
        .click();
      await fixture.whenStable();
    };
    return { fixture, host, checkbox, save, saved, removed };
  }

  it('guarda los roles elegidos', async () => {
    const { checkbox, save, saved, fixture } = await setup();
    expect(checkbox(0).checked).toBe(true);
    checkbox(1).click();
    await save();
    const req = TestBed.inject(HttpTestingController).expectOne(
      'https://api.test/api/v1/admin/users/u2/roles',
    );
    expect(req.request.body).toEqual({ roles: ['FINANCE', 'FOLLOW_UP'] });
    req.flush({ ...laura, roles: ['PARTICIPANT', 'FINANCE', 'FOLLOW_UP'] });
    await new Promise((r) => setTimeout(r));
    await fixture.whenStable();
    expect(saved.map((u) => u.roles)).toEqual([['PARTICIPANT', 'FINANCE', 'FOLLOW_UP']]);
  });

  it('sin roles no guarda: pide quitar del equipo', async () => {
    const { checkbox, save, removed } = await setup();
    checkbox(0).click();
    await save();
    TestBed.inject(HttpTestingController).expectNone(
      'https://api.test/api/v1/admin/users/u2/roles',
    );
    expect(removed.map((u) => u.id)).toEqual(['u2']);
  });
});
