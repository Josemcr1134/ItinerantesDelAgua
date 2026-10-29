import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  AdminContactApi,
  AdminContactMessageDto,
  CONTACT_STATUS_VALUES,
  ContactStatus,
  requestState,
  UpdateContactMessageRequestDto,
} from 'data-access';
import { firstValueFrom } from 'rxjs';
import { Button } from 'ui-kit';
import { AdminAccess } from '../../../core/access/admin-access';
import { ErrorPresenter } from '../../../core/error-presenter';
import { formatDateTime } from '../../../shared/format/format';
import { Notice } from '../../../shared/notice/notice';
import { RequestState } from '../../../shared/request-state/request-state';
import { ContactInbox } from '../contact-inbox';
import {
  CONTACT_PROJECT_TYPE_LABELS,
  CONTACT_SERVICE_LABELS,
  CONTACT_STATUS_LABELS,
  CONTACT_STATUS_TONES,
} from '../contact-labels';

/**
 * Detalle de un mensaje de Contacto (HU-38): datos de la persona, asunto y
 * origen (y, en Diseño y consultoría, el proyecto), responder por correo y
 * quién lo atendió. Con `contact.manage`, cambiar el estado y escribir la nota
 * interna (la guardada se ve aparte, no dentro del formulario). Abrirlo no
 * cambia su estado.
 */
@Component({
  selector: 'adm-contact-message-page',
  imports: [ReactiveFormsModule, RouterLink, Button, Notice, RequestState],
  templateUrl: './contact-message-page.html',
  styleUrls: ['../../payments/detail.scss', './contact-message-page.scss'],
})
export default class ContactMessagePage {
  /** `/mensajes/:id`. */
  readonly id = input.required<string>();

  private readonly api = inject(AdminContactApi);
  private readonly errors = inject(ErrorPresenter);
  private readonly inbox = inject(ContactInbox);
  private readonly access = inject(AdminAccess);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly canManage = computed(() => this.access.can('contact.manage'));

  protected readonly message = requestState<AdminContactMessageDto>();
  protected readonly saving = signal(false);
  protected readonly notice = signal('');

  protected readonly statusOptions = CONTACT_STATUS_VALUES.map((value) => ({
    value,
    label: CONTACT_STATUS_LABELS[value],
  }));
  protected readonly statusTones = CONTACT_STATUS_TONES;
  protected readonly projectTypeLabels = CONTACT_PROJECT_TYPE_LABELS;
  protected readonly serviceLabels = CONTACT_SERVICE_LABELS;
  protected readonly formatDateTime = formatDateTime;

  protected readonly statusForm = this.fb.group({
    status: this.fb.control<ContactStatus>('NEW'),
  });
  /** Nota nueva: se vacía al guardarla (la guardada se muestra aparte). */
  protected readonly noteForm = this.fb.group({ note: [''] });
  private readonly status = this.statusForm.controls.status;
  private readonly note = this.noteForm.controls.note;
  private readonly statusValue = toSignal(this.status.valueChanges, {
    initialValue: this.status.value,
  });
  private readonly noteValue = toSignal(this.note.valueChanges, { initialValue: '' });
  /** El estado elegido es distinto del guardado. */
  protected readonly statusChanged = computed(
    () => this.statusValue() !== this.message.data()?.status,
  );
  protected readonly hasNote = computed(() => !!this.noteValue().trim());

  /** Quién cambió por última vez el estado o la nota (`handledBy`). */
  protected readonly handler = computed(() => {
    const by = this.message.data()?.handledBy;
    return by ? (by.fullName ?? by.email) : null;
  });

  /** "Responder por correo": abre el cliente de correo con el asunto. */
  protected readonly mailto = computed(() => {
    const m = this.message.data();
    if (!m) return null;
    const subject = encodeURIComponent(`Re: ${m.subjectLabel} · Itinerantes del Agua`);
    return `mailto:${m.email}?subject=${subject}`;
  });

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => void this.load(id));
    });
  }

  protected reload(): void {
    void this.load(this.id());
  }

  protected async saveStatus(): Promise<void> {
    const status = this.status.value;
    if (status === this.message.data()?.status) return;
    await this.update({ status }, `Estado cambiado a «${CONTACT_STATUS_LABELS[status]}».`);
  }

  protected async saveNote(): Promise<void> {
    const note = this.note.value.trim();
    if (!note) return;
    if (await this.update({ internalNote: note }, 'Se guardó la nota interna.')) {
      this.note.reset();
    }
  }

  protected async clearNote(): Promise<void> {
    await this.update({ internalNote: null }, 'Se borró la nota interna.');
  }

  /** `true` si se guardó (si falla, se presenta el error y se conserva lo escrito). */
  private async update(body: UpdateContactMessageRequestDto, done: string): Promise<boolean> {
    this.saving.set(true);
    try {
      const updated = await firstValueFrom(this.api.update(this.id(), body));
      this.message.set(updated);
      this.fill(updated);
      this.notice.set(done);
      this.inbox.refresh();
      return true;
    } catch (error) {
      void this.errors.present(error);
      return false;
    } finally {
      this.saving.set(false);
    }
  }

  private async load(id: string): Promise<void> {
    const message = await this.message.run(this.api.get(id));
    if (message) this.fill(message);
  }

  private fill(message: AdminContactMessageDto): void {
    this.status.setValue(message.status);
  }
}
