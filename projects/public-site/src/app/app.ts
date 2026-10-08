import { Component } from '@angular/core';
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
}
