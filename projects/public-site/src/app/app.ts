import { DOCUMENT } from '@angular/common';
import { afterNextRender, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FOOTER_CONTENT } from './content/footer.content';
import { NAVBAR_CONTENT } from './content/navbar.content';
import { Footer } from './layout/footer/footer';
import { Navbar } from './layout/navbar/navbar';

@Component({
  imports: [RouterOutlet, Navbar, Footer],
  selector: 'pub-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly navbar = NAVBAR_CONTENT;
  protected readonly footer = FOOTER_CONTENT;

  constructor() {
    const document = inject(DOCUMENT);

    // Los títulos usan fuentes propias con `font-display: swap`: cuando
    // cargan después del primer render desplazan el contenido, y el scroll
    // al ancla (Router) queda corto. Se reajusta una vez listas las fuentes.
    afterNextRender(() => {
      const view = document.defaultView;
      const hash = document.location.hash.slice(1);
      if (!hash || !view) {
        return;
      }
      view.document.fonts?.ready.then(() => {
        if (document.location.hash.slice(1) !== hash) {
          return;
        }
        document.getElementById(hash)?.scrollIntoView({ behavior: 'auto', block: 'start' });
      });
    });
  }
}
