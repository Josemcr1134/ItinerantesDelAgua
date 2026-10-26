import { Component, computed, input } from '@angular/core';
import { ClassroomDto } from 'data-access';
import { dateRange } from '../../../shared/applications/application-format';
import { MODALITY_LABELS } from '../../../shared/applications/application-labels';
import { Avatar } from '../../../shared/avatar/avatar';
import { OFFER_TYPE_LABELS } from '../classroom-format';

/** Circunferencia del anillo de progreso (r = 42). */
const RING = 2 * Math.PI * 42;

/**
 * Encabezado del aula: ilustración grande de fondo bajo un velo verde (la
 * portada de la oferta o, sin ella, el árbol), tipo y modalidad, nombre,
 * cohorte y fechas, docentes y el anillo de asistencia.
 */
@Component({
  selector: 'portal-classroom-hero',
  imports: [Avatar],
  template: `
    @let c = classroom();
    <section
      class="hero"
      [class.hero--cover]="!!c.offer.coverImageUrl"
      aria-labelledby="classroom-title"
    >
      @if (c.offer.coverImageUrl; as cover) {
        <img class="hero__cover" [src]="cover" alt="" aria-hidden="true" />
      }
      <img
        class="hero__art"
        src="assets/access/tree.webp"
        alt=""
        width="900"
        height="1391"
        aria-hidden="true"
      />
      <div class="hero__content">
        <p class="hero__chips">
          @if (typeLabel(); as type) {
            <span class="chip chip--gold">{{ type }}</span>
          }
          <span class="chip">{{ modality() }}</span>
          @if (c.enrollment.origin === 'MOODLE') {
            <span class="chip">Vía Moodle</span>
          }
          @if (c.enrollment.phase === 'COMPLETED') {
            <span class="chip">Finalizado</span>
          }
        </p>
        <h2 id="classroom-title" class="hero__title">{{ c.offer.name }}</h2>
        @if (meta()) {
          <p class="hero__meta">{{ meta() }}</p>
        }
        @if (c.offer.teachers.length) {
          <ul class="teachers" aria-label="Docentes">
            @for (teacher of c.offer.teachers; track teacher.fullName) {
              <li class="teacher">
                @if (teacher.photoUrl) {
                  <img
                    class="teacher__photo"
                    [src]="teacher.photoUrl"
                    alt=""
                    width="34"
                    height="34"
                  />
                } @else {
                  <portal-avatar [name]="teacher.fullName" [size]="34" />
                }
                {{ teacher.fullName }}
              </li>
            }
          </ul>
        }
      </div>

      <div class="progress" role="img" [attr.aria-label]="progressLabel()">
        <svg viewBox="0 0 100 100" width="132" height="132" aria-hidden="true">
          <circle class="progress__track" cx="50" cy="50" r="42" />
          <circle
            class="progress__value"
            cx="50"
            cy="50"
            r="42"
            [attr.stroke-dasharray]="ring"
            [attr.stroke-dashoffset]="offset()"
          />
        </svg>
        <span class="progress__percent" aria-hidden="true">{{ c.progress.percent }}%</span>
        <span class="progress__caption" aria-hidden="true">
          {{ c.progress.attendedSessions }} de {{ c.progress.scheduledSessions }} sesiones
        </span>
      </div>
    </section>
  `,
  styleUrl: './classroom-hero.scss',
})
export class ClassroomHero {
  readonly classroom = input.required<ClassroomDto>();
  readonly timezone = input.required<string>();

  protected readonly ring = RING;
  protected readonly typeLabel = computed(() => OFFER_TYPE_LABELS[this.classroom().offer.type]);
  protected readonly modality = computed(() => MODALITY_LABELS[this.classroom().offer.modality]);
  protected readonly offset = computed(
    () => RING * (1 - Math.min(100, Math.max(0, this.classroom().progress.percent)) / 100),
  );
  protected readonly meta = computed(() => {
    const offer = this.classroom().offer;
    return [
      offer.cohortLabel && `Cohorte ${offer.cohortLabel}`,
      dateRange(offer.startsAt, offer.endsAt, this.timezone()),
      offer.totalHours && `${offer.totalHours} h`,
    ]
      .filter(Boolean)
      .join(' · ');
  });
  protected readonly progressLabel = computed(() => {
    const p = this.classroom().progress;
    return `Asistencia: ${p.percent}% (${p.attendedSessions} de ${p.scheduledSessions} sesiones)`;
  });
}
