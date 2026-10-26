import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideAuth } from 'auth';
import { provideApi, SKIP_GLOBAL_LOADER } from 'data-access';
import { NotificationCenter } from '../../../core/notifications/notification-center';
import { NotificationBell } from './notification-bell';

const API = 'https://api.test/api/v1';

describe('NotificationBell', () => {
  async function render() {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideApi({ baseUrl: 'https://api.test' }),
        provideAuth({ platformName: 'Portal' }),
      ],
    });
    TestBed.inject(NotificationCenter).unread.set(3);
    const fixture = TestBed.createComponent(NotificationBell);
    fixture.componentRef.setInput('timezone', 'America/Mexico_City');
    await fixture.whenStable();
    return {
      fixture,
      host: fixture.nativeElement as HTMLElement,
      http: TestBed.inject(HttpTestingController),
    };
  }

  it('muestra el contador y, al abrir, las últimas sin el loader general', async () => {
    const { fixture, host, http } = await render();
    const bell = host.querySelector<HTMLButtonElement>('.bell')!;
    expect(bell.getAttribute('aria-label')).toBe('Notificaciones, 3 sin leer');
    expect(host.querySelector('.bell__count')?.textContent?.trim()).toBe('3');

    bell.click();
    TestBed.tick();
    http.expectOne(`${API}/me/notifications/unread-count`).flush({ unread: 3, pinned: 0 });
    const list = http.expectOne(`${API}/me/notifications?pageSize=5`);
    expect(list.request.context.get(SKIP_GLOBAL_LOADER)).toBe(true);
    list.flush({ data: [], meta: { page: 1, pageSize: 5, total: 0, totalPages: 0 } });
    await fixture.whenStable();
    expect(bell.getAttribute('aria-expanded')).toBe('true');
    expect(host.querySelector('.panel__empty')?.textContent).toContain('Todo en calma');
  });

  it('[Marcar todas como leídas] pone el contador en cero', async () => {
    const { fixture, host, http } = await render();
    host.querySelector<HTMLButtonElement>('.bell')!.click();
    TestBed.tick();
    http.expectOne(`${API}/me/notifications/unread-count`).flush({ unread: 3, pinned: 0 });
    http.expectOne(`${API}/me/notifications?pageSize=5`).flush({ data: [], meta: { total: 0 } });
    await fixture.whenStable();

    host.querySelector<HTMLButtonElement>('.panel__mark')!.click();
    http.expectOne(`${API}/me/notifications/read-all`).flush({ updated: 3 });
    await new Promise((r) => setTimeout(r));
    http.expectOne(`${API}/me/notifications/unread-count`).flush({ unread: 0, pinned: 0 });
    await fixture.whenStable();
    expect(host.querySelector('.bell__count')).toBeNull();
    expect(host.querySelector('.bell')?.getAttribute('aria-label')).toBe('Notificaciones');
  });
});
