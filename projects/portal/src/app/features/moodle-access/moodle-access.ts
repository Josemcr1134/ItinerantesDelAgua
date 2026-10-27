import { Component, computed, inject, input, linkedSignal, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FormationCardDto, MoodleAccessApi, MoodleLinkResultDto, requestState } from 'data-access';
import { environment } from '../../../environments/environment';

// TODO(contenido): confirmar los textos y agregar el correo y el WhatsApp de la Escuela.
const TEXT = {
  title: '¿Estudias en Moodle y no ves tu formación?',
  intro:
    'Buscamos tu correo en las listas de inscritos de la Escuela. Si te inscribiste con otro correo, activa tu acceso con el código que te dio el equipo.',
  search: 'Buscar por mi correo',
  searching: 'Buscando…',
  haveCode: 'Tengo un código de acceso',
  linked: (n: number) =>
    n === 1
      ? 'Listo, vinculamos esta formación a tu cuenta:'
      : `Listo, vinculamos ${n} formaciones a tu cuenta:`,
  goToClassroom: 'Ir al aula',
  suspended: 'Acceso suspendido',
  upToDate: 'Tus formaciones de Moodle ya están en Mi formación.',
  notFound: 'No encontramos una inscripción asociada a tu correo.',
  notFoundHelp: 'Si usaste otro correo en Moodle, activa tu acceso con tu código o',
  contact: 'escríbenos',
  codeLabel: 'Código de acceso',
  codeHint: 'Tiene 8 letras y números (XXXX-XXXX). Te lo envía el equipo de la Escuela.',
  codeInvalid: 'Escribe el código completo: 8 letras y números.',
  activate: 'Activar mi acceso',
  activating: 'Activando…',
  alreadyEnrolled: 'Ya estás inscrito en esta formación.',
  myFormation: 'Ir a Mi formación',
};

/** Código `XXXX-XXXX`: sin espacios ni guiones, en mayúsculas. */
export function normalizeMoodleCode(value: string): string {
  const clean = value.toUpperCase().replace(/[\s-]/g, '');
  return clean.length === 8 ? `${clean.slice(0, 4)}-${clean.slice(4)}` : clean;
}

const CODE_PATTERN = /^[A-Z0-9]{4}-?[A-Z0-9]{4}$/;

/**
 * Activación del acceso de quien estudia en Moodle (HU-25): busca su correo en
 * las listas de inscritos y, si no aparece, deja canjear el código de acceso
 * o escribir a la Escuela. Avisa con `linked` qué formaciones se vincularon.
 */
@Component({
  selector: 'portal-moodle-access',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './moodle-access.html',
  styleUrl: './moodle-access.scss',
})
export class MoodleAccess {
  private readonly api = inject(MoodleAccessApi);

  /** Resultado de una búsqueda ya hecha (p. ej. al llegar desde la ficha). */
  readonly initial = input<MoodleLinkResultDto | null>(null);
  /** Formaciones vinculadas ahora (por correo o con el código). */
  readonly linked = output<readonly FormationCardDto[]>();

  protected readonly text = TEXT;
  protected readonly contactUrl = new URL('/#contacto', environment.landingUrl).href;

  protected readonly search = requestState<MoodleLinkResultDto>();
  protected readonly redeem = requestState<MoodleLinkResultDto>();
  protected readonly result = linkedSignal(() => this.initial());
  /** Sin inscripción con su correo, el código se muestra de una vez. */
  protected readonly showCode = linkedSignal(() => this.result()?.found === false);

  protected readonly code = new FormControl('', {
    nonNullable: true,
    validators: [
      Validators.required,
      (c) => (CODE_PATTERN.test(normalizeMoodleCode(c.value)) ? null : { code: true }),
    ],
  });
  protected readonly codeForm = new FormGroup({ code: this.code });

  protected readonly codeError = computed(() => {
    const error = this.redeem.error();
    if (!error || error.code === 'ENROLLMENT_ALREADY_EXISTS') return null;
    return error.message;
  });
  protected readonly alreadyEnrolled = computed(
    () => this.redeem.error()?.code === 'ENROLLMENT_ALREADY_EXISTS',
  );

  protected async searchByEmail(): Promise<void> {
    const result = await this.search.run(this.api.link());
    if (result) this.show(result);
  }

  protected async submitCode(): Promise<void> {
    if (this.code.invalid) {
      this.code.markAsTouched();
      return;
    }
    const code = normalizeMoodleCode(this.code.value);
    this.code.setValue(code);
    const result = await this.redeem.run(this.api.redeem({ code }));
    if (result) {
      this.code.reset();
      this.show(result);
    }
  }

  protected showCodeInvalid(): boolean {
    return this.code.invalid && this.code.touched;
  }

  private show(result: MoodleLinkResultDto): void {
    // Tras canjear un código el resultado es de esa formación: no vuelve a "no encontramos".
    this.result.set(result);
    if (result.linked.length) this.linked.emit(result.linked);
  }
}
