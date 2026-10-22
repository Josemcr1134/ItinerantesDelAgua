import { Component, forwardRef, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminOfferDetailDto } from 'data-access';
import { OfferStep } from './offer-step';

/** Paso 5 — Recursos: resumen (se gestionan en "Contenido del aula"). */
@Component({
  selector: 'adm-resources-step',
  imports: [RouterLink],
  providers: [{ provide: OfferStep, useExisting: forwardRef(() => ResourcesStep) }],
  template: `
    <section class="adm-section" aria-labelledby="resources-title">
      <h2 id="resources-title" class="adm-section__title">Recursos del aula</h2>
      <p class="adm-section__lead">
        Los módulos y sus materiales se gestionan en «Contenido del aula».
      </p>
      <dl class="summary">
        <div>
          <dt>Módulos</dt>
          <dd>{{ offer().resources.moduleCount }}</dd>
        </div>
        <div>
          <dt>Módulos publicados</dt>
          <dd>{{ offer().resources.publishedModuleCount }}</dd>
        </div>
        <div>
          <dt>Recursos</dt>
          <dd>{{ offer().resources.resourceCount }}</dd>
        </div>
      </dl>
      <a class="adm-action manage" [routerLink]="['/ofertas', offer().id, 'contenido']">
        {{ readonly() ? 'Ver el contenido del aula' : 'Gestionar el contenido del aula' }} →
      </a>
    </section>
  `,
  styles: `
    .summary {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-3);
      margin: 0 0 var(--space-3);
    }
    .summary div {
      min-width: 9rem;
      padding: var(--space-3);
      border-radius: 14px;
      background: #fff;
    }
    dt {
      color: var(--color-primary);
      font-size: 0.8125rem;
      font-weight: 600;
    }
    .manage {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      text-decoration: none;
    }
    dd {
      margin: 0;
      font-family: var(--font-family-numeric);
      font-size: 1.75rem;
      font-weight: 700;
    }
  `,
})
export class ResourcesStep extends OfferStep {
  readonly slug = null;
  readonly dirty = signal(false).asReadonly();

  async save(): Promise<AdminOfferDetailDto | null> {
    return this.offer();
  }
}
