import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NAVBAR_CONTENT } from './content/navbar.content';
import { Navbar } from './layout/navbar/navbar';

@Component({
  imports: [RouterOutlet, Navbar],
  selector: 'pub-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly navbar = NAVBAR_CONTENT;
}
