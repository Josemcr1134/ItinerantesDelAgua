import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AdminScholarshipTypeDto, AdminScholarshipTypesApi, requestState } from 'data-access';
import { firstValueFrom, map } from 'rxjs';
import { AlertService, Button } from 'ui-kit';
import { AdminAccess } from '../../core/access/admin-access';
import { rowActions } from '../../shared/list/row-actions';
import { Notice } from '../../shared/notice/notice';
import { PageHeader } from '../../shared/page-header/page-header';
import { RequestState } from '../../shared/request-state/request-state';
import { RowMenu } from '../../shared/row-menu/row-menu';
import { ScholarshipTypeFormDialog } from './scholarship-type-form-dialog';
import { percentRange } from './scholarship-type-labels';

/**
 * Tipos de beca: catálogo que cada oferta habilita (paso 4) y el comité
 * asigna. Nombre, % fijo o rango, entrevista, cupo global y uso. Ver:
 * `offers.read`; crear, editar, activar/desactivar y borrar:
 * `scholarship_types.write` (SUPER_ADMIN).
 */
@Component({
  selector: 'adm-scholarship-types-page',
  imports: [Button, Notice, PageHeader, RequestState, RowMenu, ScholarshipTypeFormDialog],
  templateUrl: './scholarship-types-page.html',
  styleUrl: './scholarship-types-page.scss',
})
export default class ScholarshipTypesPage implements OnInit {
  private readonly api = inject(AdminScholarshipTypesApi);
  private readonly alerts = inject(AlertService);
  private readonly access = inject(AdminAccess);
  protected readonly canWrite = computed(() => this.access.can('scholarship_types.write'));

  protected readonly types = requestState<readonly AdminScholarshipTypeDto[]>();
  protected readonly rows = rowActions();
  protected readonly notice = signal('');
  protected readonly formOpen = signal(false);
  protected readonly editing = signal<AdminScholarshipTypeDto | null>(null);
  protected readonly range = percentRange;

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    void this.types.run(this.api.list().pipe(map((r) => r.data)));
  }

  /** Lo usan ofertas, postulaciones o evaluaciones: no se puede borrar. */
  protected inUse(type: AdminScholarshipTypeDto): boolean {
    const u = type.usage;
    return u.offers + u.applications + u.evaluations > 0;
  }

  /** "3 ofertas · 12 postulaciones · 4 evaluaciones" (o "Sin uso"). */
  protected usage(type: AdminScholarshipTypeDto): string {
    const u = type.usage;
    const parts = [
      plural(u.offers, 'oferta', 'ofertas'),
      plural(u.applications, 'postulación', 'postulaciones'),
      plural(u.evaluations, 'evaluación', 'evaluaciones'),
    ].filter(Boolean);
    return parts.join(' · ') || 'Sin uso';
  }

  protected openForm(type: AdminScholarshipTypeDto | null): void {
    this.editing.set(type);
    this.formOpen.set(true);
  }

  protected onSaved(type: AdminScholarshipTypeDto): void {
    this.notice.set(
      this.editing() ? `Se guardó «${type.name}».` : `Se creó el tipo de beca «${type.name}».`,
    );
    this.load();
  }

  protected async toggleActive(type: AdminScholarshipTypeDto): Promise<void> {
    const active = !type.active;
    const updated = await this.rows.confirmRun(
      type.id,
      {
        title: active ? `¿Activar «${type.name}»?` : `¿Desactivar «${type.name}»?`,
        message: active
          ? 'Vuelve a poder habilitarse en ofertas y solicitarse en postulaciones nuevas.'
          : 'Deja de ofrecerse en ofertas y postulaciones nuevas. Las becas ya asignadas se conservan.',
        confirmLabel: active ? 'Activar' : 'Desactivar',
        variant: active ? 'info' : 'warning',
      },
      () => firstValueFrom(this.api.update(type.id, { active })),
    );
    if (updated) {
      this.notice.set(`«${updated.name}» ${active ? 'ya está activo' : 'quedó desactivado'}.`);
      this.load();
    }
  }

  protected async remove(type: AdminScholarshipTypeDto): Promise<void> {
    if (this.inUse(type)) {
      await this.alerts.warning(
        `«${type.name}» no se puede borrar`,
        `Lo usan ${this.usage(type)}. Desactívalo para que deje de ofrecerse sin perder lo asignado.`,
      );
      return;
    }
    const done = await this.rows.confirmRun(
      type.id,
      {
        title: `¿Borrar «${type.name}»?`,
        message: 'No lo usa ninguna oferta, postulación ni evaluación. No se puede deshacer.',
        confirmLabel: 'Borrar',
        variant: 'error',
      },
      async () => {
        await firstValueFrom(this.api.remove(type.id), { defaultValue: undefined });
        return true;
      },
    );
    if (done) {
      this.notice.set(`Se borró «${type.name}».`);
      this.load();
    }
  }
}

function plural(n: number, one: string, many: string): string | null {
  return n ? `${n} ${n === 1 ? one : many}` : null;
}
