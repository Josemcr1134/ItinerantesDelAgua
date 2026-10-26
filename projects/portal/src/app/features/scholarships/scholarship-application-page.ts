import { Component, computed, effect, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { SessionStore } from 'auth';
import { ApplicationDetailDto, ApplicationsApi, OffersApi, toApiError } from 'data-access';
import { catchError, map, of } from 'rxjs';
import { Crumb, usePageHeading } from '../../core/page-heading/page-heading';
import { percentLabel } from '../../shared/applications/application-format';
import { documentOpener } from '../../shared/applications/open-document';
import { browserTimezone } from '../dashboard/dashboard-format';
import { ScholarshipForm } from './scholarship-form/scholarship-form';
import { ScholarshipTracker } from './scholarship-tracker/scholarship-tracker';

/**
 * Una postulación a beca (`/becas/:id`): el formulario mientras es borrador
 * y, una vez enviada, su seguimiento y lo que se envió.
 */
@Component({
  selector: 'portal-scholarship-application-page',
  imports: [RouterLink, ScholarshipForm, ScholarshipTracker],
  templateUrl: './scholarship-application-page.html',
  styleUrl: './scholarship-application-page.scss',
})
export default class ScholarshipApplicationPage {
  private readonly api = inject(ApplicationsApi);
  private readonly offers = inject(OffersApi);
  private readonly router = inject(Router);
  private readonly user = inject(SessionStore).user;
  private readonly heading = usePageHeading();
  private readonly openFile = documentOpener();

  /** Id de la postulación (`/becas/:id`). */
  readonly id = input.required<string>();

  protected readonly timezone = computed(() => this.user()?.timezone ?? browserTimezone());
  protected readonly percent = percentLabel;

  protected readonly application = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.api.get(params),
  });
  /** La postulación cargada (`value()` lanza si la petición falló). */
  protected readonly current = computed(() =>
    this.application.hasValue() ? this.application.value() : undefined,
  );
  /** Horario de la oferta (solo para el resumen del borrador); sin él, se omite. */
  protected readonly schedule = rxResource({
    params: () => {
      const a = this.current();
      return a?.status === 'DRAFT' ? a.offer.slug : undefined;
    },
    stream: ({ params }) =>
      this.offers.bySlug(params, { tz: this.timezone() }).pipe(
        map((offer) => offer.schedule),
        catchError(() => of(null)),
      ),
    defaultValue: null,
  });

  protected readonly error = computed(() => {
    const error = this.application.error();
    return error ? toApiError(error).message : null;
  });

  constructor() {
    effect(() => {
      const a = this.current();
      const draft = !a || a.status === 'DRAFT';
      const crumbs: Crumb[] = [
        { label: 'Becas', link: '/becas' },
        draft
          ? { label: 'Becas disponibles', link: '/becas' }
          : {
              label: 'Mis postulaciones',
              link: '/becas',
              queryParams: { pestana: 'postulaciones' },
            },
      ];
      if (a) {
        crumbs.push({
          label: a.offer.cohortLabel
            ? `${a.offer.name} · Cohorte ${a.offer.cohortLabel}`
            : a.offer.name,
        });
      }
      this.heading.set({
        title: draft ? 'Postulación a beca' : 'Mi postulación a beca',
        breadcrumb: crumbs,
      });
    });
  }

  /** Guardada, enviada o descartada (`null` → vuelve a Mis postulaciones). */
  protected onChanged(application: ApplicationDetailDto | null): void {
    if (application) this.application.set(application);
    else void this.router.navigate(['/becas'], { queryParams: { pestana: 'postulaciones' } });
  }

  protected openDocument(documentId: string): Promise<void> {
    return this.openFile(this.id(), documentId);
  }
}
