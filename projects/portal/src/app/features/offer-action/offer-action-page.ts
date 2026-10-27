import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  ApplicationsApi,
  EnrollmentsApi,
  FormationCardDto,
  MoodleAccessApi,
  MoodleLinkResultDto,
  OfferActionDto,
  OfferActionType,
  OffersApi,
  toApiError,
} from 'data-access';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { usePageHeading } from '../../core/page-heading/page-heading';
import { browserTimezone } from '../dashboard/dashboard-format';
import { MoodleAccess } from '../moodle-access/moodle-access';

// TODO(contenido): confirmar los textos de esta pantalla.
const TEXT = {
  working: {
    APPLY_SCHOLARSHIP: 'Preparando tu postulación a beca…',
    APPLY_OPEN_CALL: 'Preparando tu postulación…',
    ENROLL_FREE: 'Confirmando tu inscripción…',
    ACTIVATE_MOODLE_ACCESS: 'Buscando tu inscripción de Moodle…',
  } as Partial<Record<OfferActionType, string>>,
  generic: 'Un momento…',
  moodleTitle: 'Activa tu acceso a esta formación',
  moodle: 'Para entrar al aula vinculamos tu inscripción de Moodle a tu cuenta del Portal.',
  unavailableTitle: 'Esta acción no está disponible',
  reasons: {
    ENROLLMENT_NOT_OPEN_YET: 'Las inscripciones aún no abren.',
    ENROLLMENT_CLOSED: 'Las inscripciones están cerradas.',
    OFFER_FINISHED: 'Esta oferta ya terminó.',
    SOLD_OUT: 'El cupo está agotado.',
    SCHOLARSHIP_NOT_OPEN_YET: 'La convocatoria de becas aún no abre.',
    SCHOLARSHIP_CLOSED: 'La convocatoria de becas cerró.',
    PRICE_NOT_AVAILABLE: 'El precio aún no está disponible.',
    TRANSFER_PENDING_VALIDATION: 'Tu comprobante de pago está en validación.',
  } as Record<string, string>,
  noAction: 'Revisa la ficha de la oferta para ver las opciones disponibles para ti.',
  errorTitle: 'No pudimos completar este paso',
  retry: 'Reintentar',
  backToOffer: 'Volver a la ficha',
  myFormation: 'Ir a Mi formación',
};

type View =
  | { readonly kind: 'working'; readonly text: string }
  | { readonly kind: 'moodle'; readonly result: MoodleLinkResultDto }
  | { readonly kind: 'unavailable'; readonly text: string }
  | { readonly kind: 'error'; readonly text: string };

/**
 * Continúa en el Portal una acción de la ficha de la landing
 * (`/inscripcion/:slug?accion=…`, con sesión): postular a beca o convocatoria
 * (crea el borrador y abre el formulario), inscribirse gratis (y al aula) o
 * ver la postulación / el aula, pagar (pantalla de pago) o ir a Mis pagos.
 * Quien estudia en Moodle activa su acceso (HU-25) y entra al aula.
 */
@Component({
  selector: 'portal-offer-action-page',
  imports: [RouterLink, MoodleAccess],
  templateUrl: './offer-action-page.html',
  styleUrl: './offer-action-page.scss',
})
export default class OfferActionPage {
  private readonly offers = inject(OffersApi);
  private readonly applications = inject(ApplicationsApi);
  private readonly enrollments = inject(EnrollmentsApi);
  private readonly moodle = inject(MoodleAccessApi);
  private readonly router = inject(Router);
  private readonly heading = usePageHeading();

  /** Oferta (`/inscripcion/:slug`). */
  readonly slug = input.required<string>();
  /** Acción de la ficha (`?accion=APPLY_SCHOLARSHIP`…). */
  readonly accion = input<string>();

  protected readonly text = TEXT;
  protected readonly offer = rxResource({
    params: () => this.slug(),
    stream: ({ params }) => this.offers.bySlug(params, { tz: browserTimezone() }),
  });
  protected readonly current = computed(() =>
    this.offer.hasValue() ? this.offer.value() : undefined,
  );
  protected readonly offerUrl = computed(
    () =>
      new URL(`/escuela/oferta/${encodeURIComponent(this.slug())}`, environment.landingUrl).href,
  );

  /** Resultado de ejecutar la acción (si no navegó a otra pantalla). */
  private readonly outcome = signal<View | null>(null);
  protected readonly view = computed<View>(() => {
    const error = this.offer.error();
    if (error) return { kind: 'error', text: toApiError(error).message };
    return (
      this.outcome() ?? {
        kind: 'working',
        text: TEXT.working[this.accion() as OfferActionType] ?? TEXT.generic,
      }
    );
  });

  constructor() {
    // Cuando llega la ficha (con las acciones de esta persona), se ejecuta una vez.
    effect(() => {
      const offer = this.current();
      if (!offer) return;
      this.heading.set({ title: offer.name });
      untracked(() => void this.run(offer.id, offer.actions));
    });
  }

  protected retry(): void {
    this.outcome.set(null);
    this.offer.reload();
  }

  private async run(offerId: string, actions: readonly OfferActionDto[]): Promise<void> {
    const wanted = this.accion();
    // La que pidió; si ya no aplica (p. ej. ya se inscribió), la que ahora corresponde.
    const action =
      actions.find((a) => a.type === wanted) ??
      actions.find((a) => ['GO_TO_CLASSROOM', 'VIEW_APPLICATION'].includes(a.type));
    if (!action) {
      this.outcome.set({ kind: 'unavailable', text: TEXT.noAction });
      return;
    }
    if (!action.enabled) {
      this.outcome.set({
        kind: 'unavailable',
        text: (action.reason && TEXT.reasons[action.reason]) || TEXT.noAction,
      });
      return;
    }
    try {
      switch (action.type) {
        case 'APPLY_SCHOLARSHIP':
        case 'APPLY_OPEN_CALL':
          return await this.apply(offerId, action.type);
        case 'ENROLL_FREE':
          return await this.enrollFree(offerId);
        case 'GO_TO_CLASSROOM':
          return this.go(['/formacion/aula', offerId]);
        case 'VIEW_APPLICATION':
          return action.applicationId
            ? this.go(['/postulaciones', action.applicationId])
            : this.outcome.set({ kind: 'unavailable', text: TEXT.noAction });
        // Pagos (Fase 05): a la pantalla de pago (o a Mis pagos).
        case 'ENROLL_AND_PAY':
        case 'CONTINUE_PAYMENT':
          return this.go(['/pago'], { oferta: offerId });
        case 'PAY_IN_INSTALLMENTS':
          return this.go(['/pago'], { oferta: offerId, cuotas: '1' });
        case 'PAY_BALANCE':
          return action.applicationId
            ? this.go(['/pago'], { postulacion: action.applicationId })
            : this.outcome.set({ kind: 'unavailable', text: TEXT.noAction });
        case 'REGULARIZE_PAYMENT':
        case 'PAYMENT_IN_VALIDATION':
          return this.go(['/perfil'], { pestana: 'pagos' });
        case 'ACTIVATE_MOODLE_ACCESS':
          return await this.activateMoodle(offerId);
        default:
          this.outcome.set({ kind: 'unavailable', text: TEXT.noAction });
      }
    } catch (error) {
      this.outcome.set({ kind: 'error', text: toApiError(error).message });
    }
  }

  /**
   * Crea el borrador (o abre el que ya existía) y entra al flujo de
   * postulación: la beca en su formulario (HU-19), la convocatoria en la suya
   * (HU-20). Una ya enviada muestra su seguimiento (HU-21).
   */
  private async apply(offerId: string, type: OfferActionType): Promise<void> {
    let id: string;
    try {
      id = (await firstValueFrom(this.applications.create({ offerId }))).id;
    } catch (error) {
      const apiError = toApiError(error);
      const existing = apiError.metaString('applicationId');
      if (apiError.code !== 'APPLICATION_ALREADY_EXISTS' || !existing) throw error;
      id = existing;
    }
    if (type === 'APPLY_SCHOLARSHIP') {
      this.go(['/becas', id]);
    } else {
      void this.router.navigate(['/convocatorias'], {
        queryParams: { pestana: 'postulaciones', postulacion: id },
        replaceUrl: true,
      });
    }
  }

  /** Inscripción gratuita (o ya inscrito): al aula. */
  private async enrollFree(offerId: string): Promise<void> {
    try {
      await firstValueFrom(this.enrollments.enrollFree({ offerId }));
    } catch (error) {
      if (toApiError(error).code !== 'ENROLLMENT_ALREADY_EXISTS') throw error;
    }
    this.go(['/formacion/aula', offerId]);
  }

  /**
   * Busca su correo en la lista de inscritos de Moodle: si esta formación
   * quedó vinculada, al aula; si no, el código de acceso (o contacto).
   */
  private async activateMoodle(offerId: string): Promise<void> {
    const result = await firstValueFrom(this.moodle.link());
    if (this.includes(result.linked, offerId)) return this.go(['/formacion/aula', offerId]);
    this.outcome.set({ kind: 'moodle', result });
  }

  /** Tras canjear el código: al aula si fue el de esta formación. */
  protected onMoodleLinked(linked: readonly FormationCardDto[]): void {
    const offerId = this.current()?.id;
    if (offerId && this.includes(linked, offerId)) this.go(['/formacion/aula', offerId]);
  }

  private includes(linked: readonly FormationCardDto[], offerId: string): boolean {
    return linked.some((f) => f.offer.id === offerId);
  }

  private go(commands: unknown[], queryParams?: Record<string, string>): void {
    void this.router.navigate(commands, {
      replaceUrl: true,
      ...(queryParams ? { queryParams } : {}),
    });
  }
}
