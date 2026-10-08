import { TestBed } from '@angular/core/testing';
import { StatCircle } from './stat-circle';

describe('StatCircle', () => {
  async function setup(progress?: number) {
    const fixture = TestBed.createComponent(StatCircle);
    fixture.componentRef.setInput('value', '12+');
    fixture.componentRef.setInput('label', 'Territorios\nacompañados');
    if (progress !== undefined) {
      fixture.componentRef.setInput('progress', progress);
    }
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const dashLength = (host: HTMLElement) =>
    Number(
      host.querySelector('.stat-circle__arc')!.getAttribute('stroke-dasharray')!.split(' ')[0],
    );

  it('muestra la cifra y la etiqueta; el anillo es decorativo', async () => {
    const host = await setup(0.5);
    expect(host.querySelector('.stat-circle__value')?.textContent?.trim()).toBe('12+');
    expect(host.querySelector('.stat-circle__label')?.textContent).toContain('Territorios');
    expect(host.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('el arco crece con el progreso y se limita entre 0 y 1', async () => {
    const half = dashLength(await setup(0.5));
    const almostFull = dashLength(await setup(0.95));
    expect(almostFull).toBeGreaterThan(half);
    expect(dashLength(await setup(-1))).toBe(0);
    expect(dashLength(await setup(2))).toBe(dashLength(await setup(1)));
  });
});
