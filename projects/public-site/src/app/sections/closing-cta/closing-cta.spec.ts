import { TestBed } from '@angular/core/testing';
import { CLOSING_CTA_CONTENT } from '../../content/closing-cta.content';
import { ClosingCta } from './closing-cta';

describe('ClosingCta', () => {
  async function setup() {
    const fixture = TestBed.createComponent(ClosingCta);
    fixture.componentRef.setInput('content', CLOSING_CTA_CONTENT);
    await fixture.whenStable();
    return { fixture, host: fixture.nativeElement as HTMLElement };
  }

  it('sustituye el bloque por el formulario al pulsar Hablemos y lleva el foco', async () => {
    const { fixture, host } = await setup();
    host.querySelector<HTMLButtonElement>('.closing__cta')!.click();
    await fixture.whenStable();

    expect(host.querySelector('.closing__cta')).toBeNull();
    const form = host.querySelector('.closing__form');
    expect(form).not.toBeNull();
    expect(document.activeElement).toBe(form);
  });

  it('vuelve al bloque con el botón Volver y devuelve el foco a Hablemos', async () => {
    const { fixture, host } = await setup();
    host.querySelector<HTMLButtonElement>('.closing__cta')!.click();
    await fixture.whenStable();
    host.querySelector<HTMLButtonElement>('.closing__back')!.click();
    await fixture.whenStable();

    expect(host.querySelector('.closing__form')).toBeNull();
    expect(document.activeElement).toBe(host.querySelector('.closing__cta'));
  });

  it('también vuelve con Escape', async () => {
    const { fixture, host } = await setup();
    host.querySelector<HTMLButtonElement>('.closing__cta')!.click();
    await fixture.whenStable();
    host
      .querySelector('.closing__form')!
      .dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();

    expect(host.querySelector('.closing__form')).toBeNull();
  });
});
