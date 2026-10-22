import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AdminOfferDetailDto, AdminOffersApi, requestState, WizardStepDto } from 'data-access';
import { AlertService, Button } from 'ui-kit';
import { AdminAccess } from '../../../core/access/admin-access';
import { RowMenu } from '../../../shared/row-menu/row-menu';
import { OFFER_MODALITY_LABELS, OFFER_STATUS_LABELS, OFFER_TYPE_LABELS } from '../offer-labels';
import { OfferActions } from '../shared/offer-actions';
import { AttendanceStep } from './steps/attendance-step';
import { ContentStep } from './steps/content-step';
import { GeneralStep } from './steps/general-step';
import { OfferStep } from './steps/offer-step';
import { PricingStep } from './steps/pricing-step';
import { ResourcesStep } from './steps/resources-step';
import { ScheduleStep } from './steps/schedule-step';
import { WhatsappStep } from './steps/whatsapp-step';

/**
 * Asistente de una oferta (HU-27): 7 pasos con su estado según la API
 * (`wizard`). Al cambiar de paso, lo pendiente se guarda solo (autoguardado);
 * "Publicar" se habilita cuando la API lo permite (`wizard.canPublish`).
 * Sin `offers.write`, todo queda en solo lectura.
 */
@Component({
  selector: 'adm-offer-editor-page',
  imports: [
    RouterLink,
    Button,
    RowMenu,
    GeneralStep,
    ContentStep,
    ScheduleStep,
    PricingStep,
    ResourcesStep,
    AttendanceStep,
    WhatsappStep,
  ],
  templateUrl: './offer-editor-page.html',
  styleUrl: './offer-editor-page.scss',
})
export default class OfferEditorPage {
  /** Id de la ruta (`/ofertas/:id`). */
  readonly id = input.required<string>();

  private readonly api = inject(AdminOffersApi);
  private readonly actions = inject(OfferActions);
  private readonly alerts = inject(AlertService);
  private readonly router = inject(Router);
  private readonly access = inject(AdminAccess);

  protected readonly typeLabels = OFFER_TYPE_LABELS;
  protected readonly modalityLabels = OFFER_MODALITY_LABELS;
  protected readonly statusLabels = OFFER_STATUS_LABELS;

  protected readonly canWrite = computed(() => this.access.permissions().has('offers.write'));
  protected readonly canPublish = computed(() => this.access.permissions().has('offers.publish'));

  protected readonly request = requestState<AdminOfferDetailDto>();
  protected readonly offer = computed(() => this.request.data());
  protected readonly steps = computed(() => this.offer()?.wizard.steps ?? []);
  protected readonly stepIndex = signal(0);
  protected readonly current = computed<WizardStepDto | null>(
    () => this.steps()[this.stepIndex()] ?? null,
  );
  protected readonly isLast = computed(() => this.stepIndex() >= this.steps().length - 1);
  protected readonly busy = signal(false);
  protected readonly notice = signal('');

  private readonly activeStep = viewChild(OfferStep);

  /** Como pide la API: con pendientes (y nada por guardar) no se avanza con "Siguiente". */
  protected readonly blockedNext = computed(
    () => this.canWrite() && !this.dirty() && !!this.current() && !this.current()!.complete,
  );

  /** Hay cambios sin guardar en el paso visible. */
  readonly dirty = computed(() => this.activeStep()?.dirty() ?? false);

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => void this.request.run(this.api.detail(id)));
    });
  }

  protected reload(): void {
    void this.request.run(this.api.detail(this.id()));
  }

  protected stepStatus(step: WizardStepDto): string {
    const status = step.complete
      ? 'Completo'
      : step.issues.length
        ? `${step.issues.length} ${step.issues.length === 1 ? 'pendiente' : 'pendientes'}`
        : 'Sin revisar';
    return step.requiredToPublish ? status : `${status} · opcional`;
  }

  /** Guarda el paso visible si tiene cambios. Devuelve `false` si falló. */
  protected async save(): Promise<boolean> {
    const step = this.activeStep();
    if (!step || !this.canWrite() || !step.dirty()) return true;
    this.busy.set(true);
    const updated = await step.save();
    this.busy.set(false);
    if (!updated) return false;
    this.request.set(updated);
    this.notice.set(`Se guardó «${this.current()?.label}».`);
    return true;
  }

  /** Cambia de paso guardando antes lo pendiente. */
  protected async goTo(index: number): Promise<void> {
    if (index === this.stepIndex() || index < 0 || index >= this.steps().length) return;
    if (!(await this.save())) return;
    this.stepIndex.set(index);
    this.notice.set('');
    document.querySelector<HTMLElement>('#offer-step-title')?.focus();
  }

  /** "Guardar y continuar": avanza solo si el paso quedó sin problemas. */
  protected async saveAndNext(): Promise<void> {
    if (!(await this.save())) return;
    const step = this.current();
    if (step && !step.complete && this.canWrite()) {
      this.notice.set(`«${step.label}» tiene datos pendientes; revisa los mensajes del paso.`);
      return;
    }
    await this.goTo(this.stepIndex() + 1);
  }

  // --- Estado de la oferta ---
  protected async publish(): Promise<void> {
    const offer = this.offer();
    if (!offer || !(await this.save())) return;
    await this.applyChange(await this.actions.publish(offer), 'Oferta publicada.');
  }

  protected async unpublish(): Promise<void> {
    const offer = this.offer();
    if (offer)
      await this.applyChange(await this.actions.unpublish(offer), 'La oferta volvió a borrador.');
  }

  protected async archive(): Promise<void> {
    const offer = this.offer();
    if (offer) await this.applyChange(await this.actions.archive(offer), 'Oferta archivada.');
  }

  protected async duplicate(): Promise<void> {
    const offer = this.offer();
    if (!offer || !(await this.save())) return;
    const copy = await this.actions.duplicate(offer);
    if (copy) {
      this.stepIndex.set(0);
      await this.router.navigate(['/ofertas', copy.id]);
    }
  }

  protected async remove(): Promise<void> {
    const offer = this.offer();
    if (offer && (await this.actions.remove(offer))) {
      await this.router.navigateByUrl('/ofertas');
    }
  }

  /** Pregunta antes de salir con cambios sin guardar (guard de la ruta). */
  async confirmLeave(): Promise<boolean> {
    if (!this.dirty()) return true;
    return this.alerts.confirm(
      '¿Salir sin guardar?',
      'Hay cambios en este paso que todavía no se guardaron.',
      { confirmLabel: 'Salir sin guardar', cancelLabel: 'Seguir editando' },
    );
  }

  private async applyChange(updated: AdminOfferDetailDto | null, message: string): Promise<void> {
    if (updated) {
      this.request.set(updated);
      this.notice.set(message);
    }
  }
}
