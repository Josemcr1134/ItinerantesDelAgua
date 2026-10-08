import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpandableCardGroup } from './expandable-card-group';
import { ExpandableItem } from './expandable-item';

const ITEMS: readonly ExpandableItem[] = ['a', 'b', 'c'].map((id) => ({
  id,
  icon: { src: 'icon.svg', alt: '' },
  title: `Título ${id}`,
  description: `Descripción ${id}`,
  detail: { paragraphs: [`Detalle ${id}`], cta: { label: 'Conoce más', href: '#' } },
}));

describe('ExpandableCardGroup', () => {
  let fixture: ComponentFixture<ExpandableCardGroup>;
  let host: HTMLElement;

  const triggers = () => Array.from(host.querySelectorAll<HTMLButtonElement>('.card__trigger'));
  const visiblePanels = () => host.querySelectorAll<HTMLElement>('.panel:not([hidden])');

  beforeEach(async () => {
    fixture = TestBed.createComponent(ExpandableCardGroup);
    fixture.componentRef.setInput('items', ITEMS);
    fixture.componentRef.setInput('groupLabel', 'Grupo de prueba');
    fixture.componentRef.setInput('collapseLabel', 'Cerrar');
    host = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
  });

  it('arranca con todas las tarjetas colapsadas y aria-controls válido', () => {
    expect(visiblePanels().length).toBe(0);
    for (const trigger of triggers()) {
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(host.querySelector(`#${trigger.getAttribute('aria-controls')}`)).not.toBeNull();
    }
  });

  it('expande una tarjeta y mueve el foco al título del panel', async () => {
    triggers()[1].click();
    await fixture.whenStable();

    expect(triggers()[1].getAttribute('aria-expanded')).toBe('true');
    expect(visiblePanels().length).toBe(1);
    expect(visiblePanels()[0].textContent).toContain('Detalle b');
    expect(document.activeElement?.textContent?.trim()).toBe('Título b');
  });

  it('mantiene un solo panel abierto a la vez', async () => {
    triggers()[0].click();
    await fixture.whenStable();
    triggers()[2].click();
    await fixture.whenStable();

    expect(triggers().map((t) => t.getAttribute('aria-expanded'))).toEqual([
      'false',
      'false',
      'true',
    ]);
    expect(visiblePanels().length).toBe(1);
    expect(visiblePanels()[0].textContent).toContain('Detalle c');
  });

  it('colapsa con el botón del panel y devuelve el foco a la tarjeta', async () => {
    triggers()[1].click();
    await fixture.whenStable();

    const collapse = Array.from(visiblePanels()[0].querySelectorAll('button')).find(
      (b) => b.textContent?.trim() === 'Cerrar',
    );
    collapse?.click();
    await fixture.whenStable();

    expect(visiblePanels().length).toBe(0);
    expect(document.activeElement).toBe(triggers()[1]);
  });

  it('colapsa al volver a pulsar la misma tarjeta', async () => {
    triggers()[0].click();
    await fixture.whenStable();
    triggers()[0].click();
    await fixture.whenStable();

    expect(triggers()[0].getAttribute('aria-expanded')).toBe('false');
    expect(visiblePanels().length).toBe(0);
  });

  it('navega entre tarjetas con flechas, Home y End', () => {
    const press = (target: HTMLElement, key: string) =>
      target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));

    triggers()[0].focus();
    press(triggers()[0], 'ArrowRight');
    expect(document.activeElement).toBe(triggers()[1]);
    press(triggers()[1], 'End');
    expect(document.activeElement).toBe(triggers()[2]);
    press(triggers()[2], 'ArrowRight');
    expect(document.activeElement).toBe(triggers()[0]);
    press(triggers()[0], 'ArrowLeft');
    expect(document.activeElement).toBe(triggers()[2]);
    press(triggers()[2], 'Home');
    expect(document.activeElement).toBe(triggers()[0]);
  });
});
