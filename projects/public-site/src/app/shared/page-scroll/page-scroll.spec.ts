import { NavigationEnd, Scroll } from '@angular/router';
import { pageScrollAction } from './page-scroll';

const scroll = (
  url: string,
  position: [number, number] | null = null,
  anchor: string | null = null,
) => new Scroll(new NavigationEnd(1, url, url), position, anchor);

describe('pageScrollAction', () => {
  it('otra página sube arriba; con ancla va a la sección', () => {
    expect(pageScrollAction(scroll('/escuela/oferta'), '/')).toEqual({ kind: 'top' });
    expect(pageScrollAction(scroll('/#objetivos', null, 'objetivos'), '/escuela/oferta')).toEqual({
      kind: 'anchor',
      anchor: 'objetivos',
    });
  });

  it('si solo cambia la query (filtros, página) no mueve el scroll', () => {
    expect(
      pageScrollAction(scroll('/escuela/oferta?tipo=talleres&pagina=2'), '/escuela/oferta'),
    ).toEqual({ kind: 'none' });
    // Primera carga sin ancla: se queda donde la deja el navegador.
    expect(pageScrollAction(scroll('/escuela/oferta'), null)).toEqual({ kind: 'none' });
  });

  it('Atrás / Adelante vuelve a donde estaba', () => {
    expect(pageScrollAction(scroll('/', [0, 1200]), '/escuela/oferta')).toEqual({
      kind: 'position',
      position: [0, 1200],
    });
  });
});
