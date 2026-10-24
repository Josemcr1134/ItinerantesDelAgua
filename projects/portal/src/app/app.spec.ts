import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { LoadingService } from 'data-access';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('muestra el loader general mientras hay peticiones en curso', async () => {
    const fixture = TestBed.createComponent(App);
    const host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    expect(host.querySelector('[role="status"]')).toBeNull();

    TestBed.inject(LoadingService).start();
    await fixture.whenStable();
    expect(host.querySelector('[role="status"]')?.textContent).toContain('Cargando');
  });
});
