import { Component, computed, effect, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { SessionStore } from 'auth';
import { ClassroomsApi, FinalProjectDto, toApiError } from 'data-access';
import { map } from 'rxjs';
import { Crumb, usePageHeading } from '../../core/page-heading/page-heading';
import { browserTimezone } from '../dashboard/dashboard-format';
import { FORMATION_TYPES, formationPath, FormationSlug } from '../formation/formation-options';
import { ClassroomAside } from './classroom-aside/classroom-aside';
import { ClassroomHero } from './classroom-hero/classroom-hero';
import { ClassroomSessions } from './classroom-sessions/classroom-sessions';
import { FinalProject } from './final-project/final-project';
import { ModuleMaterials } from './module-materials/module-materials';

/** Volver a pedir el aula cuando abre el acceso a la próxima sesión (si es en menos de 12 h). */
const MAX_JOIN_WAIT_MS = 12 * 3_600_000;

type Section = 'materiales' | 'sesiones' | 'proyecto';

/**
 * Aula de una formación (HU-08 / HU-17; sin Figma, con la línea gráfica del
 * portal): encabezado ilustrado con la asistencia, módulos y materiales,
 * sesiones y proyecto final (`?seccion=`), y a un lado la próxima sesión y la
 * bienvenida. Sin inscripción o con el acceso suspendido, lo explica.
 */
@Component({
  selector: 'portal-classroom-page',
  imports: [
    RouterLink,
    ClassroomHero,
    ClassroomAside,
    ModuleMaterials,
    ClassroomSessions,
    FinalProject,
  ],
  templateUrl: './classroom-page.html',
  styleUrls: ['./classroom-page.scss', './classroom-denied.scss'],
})
export default class ClassroomPage {
  private readonly api = inject(ClassroomsApi);
  private readonly user = inject(SessionStore).user;
  private readonly heading = usePageHeading();

  /** Oferta (`/formacion/aula/:offerId`). */
  readonly offerId = input.required<string>();
  /** Sección (`?seccion=sesiones|proyecto`); por defecto, materiales. */
  readonly seccion = input<string>();

  protected readonly timezone = computed(() => this.user()?.timezone ?? browserTimezone());

  protected readonly classroom = rxResource({
    params: () => this.offerId(),
    stream: ({ params }) => this.api.classroom(params),
  });
  protected readonly current = computed(() =>
    this.classroom.hasValue() ? this.classroom.value() : undefined,
  );
  protected readonly section = computed<Section>(() => {
    const value = this.seccion();
    if (value === 'sesiones') return 'sesiones';
    // Mientras carga el aula no se sabe si hay proyecto final: se espera sin pedir materiales.
    if (value === 'proyecto') {
      const classroom = this.current();
      return !classroom || classroom.finalProject ? 'proyecto' : 'materiales';
    }
    return 'materiales';
  });
  protected readonly materials = rxResource({
    // En paralelo con el aula (tiene su propio endpoint para reintentar).
    params: () => (this.section() === 'materiales' ? this.offerId() : undefined),
    stream: ({ params }) => this.api.materials(params).pipe(map((r) => r.modules)),
  });

  /** Error del aula: sin inscripción, suspendida o inexistente. */
  protected readonly denied = computed(() => {
    const error = this.classroom.error();
    if (!error) return null;
    const apiError = toApiError(error);
    // TODO(contenido): confirmar los textos sin acceso al aula.
    switch (apiError.code) {
      case 'ENROLLMENT_REQUIRED':
        return {
          title: 'Esta aula es solo para personas inscritas',
          text: 'Cuando te inscribas a esta formación, aquí encontrarás sus sesiones y materiales.',
        };
      case 'ENROLLMENT_SUSPENDED':
        return {
          title: 'Tu acceso al aula está en pausa',
          text: 'Tienes un pago pendiente. Al regularizarlo, recuperas el acceso a sesiones y materiales.',
        };
      case 'NOT_FOUND':
        return {
          title: 'No encontramos esta aula',
          text: 'Puede que el enlace no sea correcto. Revisa tus formaciones.',
        };
      default:
        return { title: 'No pudimos abrir el aula', text: apiError.message, retry: true };
    }
  });
  protected readonly materialsError = computed(() => {
    const error = this.materials.error();
    return error ? toApiError(error).message : null;
  });
  protected readonly backLink = computed(() =>
    formationPath(this.current()?.offer.type ?? 'DIPLOMA'),
  );

  constructor() {
    effect(() => {
      const offer = this.current()?.offer;
      const crumbs: Crumb[] = [];
      if (offer) {
        const path = formationPath(offer.type);
        const slug = path.split('/').pop() as FormationSlug;
        crumbs.push({ label: FORMATION_TYPES[slug].label, link: path }, { label: offer.name });
      }
      this.heading.set({ title: 'Mi aula', breadcrumb: crumbs });
    });

    // El acceso a la sesión abre 10 min antes: al llegar la hora, se vuelve a pedir el aula.
    effect((onCleanup) => {
      const join = this.current()?.nextSession?.join;
      if (join?.state !== 'NOT_YET') return;
      const wait = new Date(join.opensAt).getTime() - Date.now();
      if (wait <= 0 || wait > MAX_JOIN_WAIT_MS) return;
      const timer = setTimeout(() => this.classroom.reload(), wait + 1_000);
      onCleanup(() => clearTimeout(timer));
    });
  }

  protected onProjectChanged(project: FinalProjectDto): void {
    this.classroom.update((classroom) => classroom && { ...classroom, finalProject: project });
  }
}
