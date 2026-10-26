import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SessionStore } from 'auth';
import {
  ApplicationDetailDto,
  ApplicationOpportunityDto,
  ApplicationsApi,
  toApiError,
} from 'data-access';
import { firstValueFrom, map } from 'rxjs';
import { AlertService } from 'ui-kit';
import { usePageHeading } from '../../core/page-heading/page-heading';
import { APPLICATION_STATUS_LABELS } from '../../shared/applications/application-labels';
import { browserTimezone } from '../dashboard/dashboard-format';
import { ApplicationForm } from './application-form/application-form';
import { ApplicationSummary } from './application-summary/application-summary';
import { dateTimeIn } from './open-call-format';
import { OpportunityCard } from './opportunity-card/opportunity-card';

/**
 * Convocatorias (HU-20 / HU-21, Figma): convocatorias abiertas con
 * [Ver y postular] y "Mis Postulaciones"; la postulación abierta
 * (`?postulacion=`) se muestra debajo como formulario (borrador) o resumen.
 * Las becas usan los mismos endpoints con `kind=SCHOLARSHIP` (otra sección).
 */
@Component({
  selector: 'portal-open-calls-page',
  imports: [RouterLink, OpportunityCard, ApplicationForm, ApplicationSummary],
  templateUrl: './open-calls-page.html',
  styleUrl: './open-calls-page.scss',
})
export default class OpenCallsPage {
  private readonly api = inject(ApplicationsApi);
  private readonly alerts = inject(AlertService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly injector = inject(Injector);
  private readonly user = inject(SessionStore).user;
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  /** Pestaña (`?pestana=postulaciones`); por defecto, las abiertas. */
  readonly pestana = input<string>();
  /** Postulación abierta debajo (`?postulacion=<id>`). */
  readonly postulacion = input<string>();

  protected readonly statuses = APPLICATION_STATUS_LABELS;
  protected readonly timezone = computed(() => this.user()?.timezone ?? browserTimezone());
  protected readonly tab = computed(() => (this.pestana() === 'postulaciones' ? 'mine' : 'open'));
  protected readonly creating = signal<string | null>(null);

  protected readonly opportunities = rxResource({
    stream: () => this.api.opportunities({ kind: 'OPEN_CALL' }).pipe(map((r) => r.data)),
    defaultValue: [],
  });
  protected readonly mine = rxResource({
    params: () =>
      this.tab() === 'mine' ? { kind: 'OPEN_CALL' as const, pageSize: 50 } : undefined,
    stream: ({ params }) => this.api.list(params).pipe(map((r) => r.data)),
    defaultValue: [],
  });
  protected readonly application = rxResource({
    params: () => this.postulacion() || undefined,
    stream: ({ params }) => this.api.get(params),
  });

  protected readonly openCount = computed(
    () => this.opportunities.value().filter((o) => o.window.state === 'OPEN').length,
  );
  protected readonly selectedOffer = computed(() => this.application.value()?.offer.id ?? null);
  protected readonly error = computed(() => {
    const error = this.opportunities.error() ?? this.mine.error() ?? this.application.error();
    return error ? toApiError(error).message : null;
  });

  constructor() {
    usePageHeading().set({ title: 'Convocatorias' });
  }

  protected format(iso: string): string {
    return dateTimeIn(iso, this.timezone());
  }

  /** [Ver y postular]: crea el borrador (o abre el que ya existía). */
  protected async apply(opportunity: ApplicationOpportunityDto): Promise<void> {
    this.creating.set(opportunity.offer.id);
    try {
      const created = await firstValueFrom(this.api.create({ offerId: opportunity.offer.id }));
      this.opportunities.reload();
      this.open(created.id);
    } catch (error) {
      const apiError = toApiError(error);
      const existing = apiError.metaString('applicationId');
      if (apiError.code === 'APPLICATION_ALREADY_EXISTS' && existing) this.open(existing);
      else await this.alerts.error('No se pudo iniciar la postulación', apiError.message);
    } finally {
      this.creating.set(null);
    }
  }

  protected open(applicationId: string): void {
    void this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: { postulacion: applicationId },
        queryParamsHandling: 'merge',
      })
      .then(() =>
        afterNextRender(
          () => this.panel()?.nativeElement.scrollIntoView?.({ behavior: 'smooth' }),
          {
            injector: this.injector,
          },
        ),
      );
  }

  /** La postulación se guardó, se envió o se descartó (`null`). */
  protected onChanged(application: ApplicationDetailDto | null): void {
    if (application) {
      this.application.set(application);
    } else {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { postulacion: null },
        queryParamsHandling: 'merge',
      });
    }
    this.opportunities.reload();
    if (this.tab() === 'mine') this.mine.reload();
  }
}
