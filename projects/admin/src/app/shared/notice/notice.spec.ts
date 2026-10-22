import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Notice } from './notice';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

@Component({
  imports: [Notice],
  template: `<adm-notice [(message)]="notice" [duration]="duration" />`,
})
class Host {
  readonly notice = signal('');
  duration = 60;
}

describe('Notice', () => {
  async function setup() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const host = fixture.nativeElement as HTMLElement;
    const show = async (text: string) => {
      fixture.componentInstance.notice.set(text);
      await fixture.whenStable();
    };
    return { fixture, host, show };
  }

  it('mantiene la región role="status" aunque no haya aviso', async () => {
    const { host } = await setup();
    expect(host.querySelector('[role="status"]')).not.toBeNull();
    expect(host.querySelector('.notice')).toBeNull();
  });

  it('se cierra solo tras la duración', async () => {
    const { fixture, host, show } = await setup();
    await show('Se borró a Elena Cruz.');
    expect(host.querySelector('[role="status"]')?.textContent).toContain('Se borró a Elena Cruz.');
    await wait(120);
    await fixture.whenStable();
    expect(fixture.componentInstance.notice()).toBe('');
    expect(host.querySelector('.notice')).toBeNull();
  });

  it('se cierra con la X', async () => {
    const { fixture, host, show } = await setup();
    fixture.componentInstance.duration = 0;
    await show('Se guardaron los cambios.');
    host.querySelector<HTMLButtonElement>('button[aria-label="Cerrar aviso"]')!.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.notice()).toBe('');
  });

  it('no se cierra mientras el mouse está encima', async () => {
    const { fixture, host, show } = await setup();
    await show('Se registró a Sofía.');
    const notice = host.querySelector('.notice')!;
    notice.dispatchEvent(new Event('mouseenter'));
    await wait(120);
    expect(fixture.componentInstance.notice()).toBe('Se registró a Sofía.');
    notice.dispatchEvent(new Event('mouseleave'));
    await wait(120);
    expect(fixture.componentInstance.notice()).toBe('');
  });
});
