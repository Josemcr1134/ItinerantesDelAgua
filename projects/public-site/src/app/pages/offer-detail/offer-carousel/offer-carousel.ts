import { Component, computed, input, signal } from '@angular/core';
import { OFFER_DETAIL_CONTENT } from '../../../content/offer-detail.content';

/**
 * Carrusel de la ficha (Figma): imagen a todo lo ancho con flechas a los
 * lados y puntos debajo (el activo, alargado y dorado). Sin pase automático.
 */
@Component({
  selector: 'pub-offer-carousel',
  template: `
    @let list = images();
    <section
      class="carousel"
      aria-roledescription="carrusel"
      [attr.aria-label]="t.label"
      (keydown.arrowLeft)="move(-1)"
      (keydown.arrowRight)="move(1)"
    >
      <div class="carousel__track" [style.translate]="'-' + index() * 100 + '% 0'">
        @for (src of list; track $index; let i = $index) {
          <img
            class="carousel__image"
            [src]="src"
            alt=""
            [attr.aria-hidden]="i !== index()"
            [attr.loading]="i ? 'lazy' : null"
            width="760"
            height="300"
          />
        }
      </div>
      @if (list.length > 1) {
        <button
          type="button"
          class="carousel__arrow carousel__arrow--prev"
          [attr.aria-label]="t.previous"
          (click)="move(-1)"
        >
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <button
          type="button"
          class="carousel__arrow carousel__arrow--next"
          [attr.aria-label]="t.next"
          (click)="move(1)"
        >
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
        <div class="carousel__dots">
          @for (src of list; track $index; let i = $index) {
            <button
              type="button"
              class="carousel__dot"
              [class.carousel__dot--on]="i === index()"
              [attr.aria-label]="t.goTo(i + 1)"
              [attr.aria-current]="i === index() ? 'true' : null"
              (click)="index.set(i)"
            ></button>
          }
        </div>
      }
    </section>
  `,
  styleUrl: './offer-carousel.scss',
})
export class OfferCarousel {
  readonly images = input.required<readonly string[]>();

  protected readonly t = OFFER_DETAIL_CONTENT.carousel;
  protected readonly index = signal(0);
  private readonly count = computed(() => this.images().length);

  protected move(step: number): void {
    const count = this.count();
    if (count > 1) this.index.update((i) => (i + step + count) % count);
  }
}
