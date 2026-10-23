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
import { RouterLink } from '@angular/router';
import {
  AdminOfferDetailDto,
  AdminOffersApi,
  GeneratedCodesDto,
  RosterImportResultDto,
  requestState,
} from 'data-access';
import { Button } from 'ui-kit';
import { AdminAccess } from '../../../core/access/admin-access';
import { Notice } from '../../../shared/notice/notice';
import { PageHeader } from '../../../shared/page-header/page-header';
import { RequestState } from '../../../shared/request-state/request-state';
import { CodesSection } from './codes-section';
import { GenerateCodesDialog } from './generate-codes-dialog';
import { ImportRosterDialog } from './import-roster-dialog';
import { RosterSection } from './roster-section';

type Section = 'correos' | 'codigos';

/**
 * Acceso de una oferta de origen Moodle (HU-25 / HU-27): la lista de correos
 * inscritos (cargar desde un CSV y quitar los no vinculados) y los códigos de
 * acceso de un solo uso. Sección en la URL (`?seccion=`). Ver requiere
 * `offers.read`; cargar, quitar y generar, `offers.write`.
 */
@Component({
  selector: 'adm-moodle-page',
  imports: [
    RouterLink,
    Button,
    Notice,
    PageHeader,
    RequestState,
    RosterSection,
    CodesSection,
    ImportRosterDialog,
    GenerateCodesDialog,
  ],
  templateUrl: './moodle-page.html',
  styleUrl: './moodle-page.scss',
})
export default class MoodlePage {
  /** `/ofertas/:id/moodle`. */
  readonly id = input.required<string>();
  /** `?seccion=correos|codigos`. */
  readonly seccion = input<string>();

  private readonly offersApi = inject(AdminOffersApi);
  private readonly access = inject(AdminAccess);
  protected readonly canWrite = computed(() => this.access.can('offers.write'));

  protected readonly section = computed<Section>(() =>
    this.seccion() === 'codigos' ? 'codigos' : 'correos',
  );
  protected readonly offer = requestState<AdminOfferDetailDto>();
  protected readonly isMoodle = computed(() => this.offer.data()?.origin === 'MOODLE');
  protected readonly notice = signal('');

  protected readonly importing = signal(false);
  protected readonly generating = signal(false);
  private readonly rosterSection = viewChild(RosterSection);
  private readonly codesSection = viewChild(CodesSection);

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => void this.offer.run(this.offersApi.detail(id)));
    });
  }

  protected reloadOffer(): void {
    void this.offer.run(this.offersApi.detail(this.id()));
  }

  protected onImported(result: RosterImportResultDto): void {
    this.notice.set(
      `Se cargaron ${result.added} ${result.added === 1 ? 'correo' : 'correos'}` +
        (result.linkedUsers
          ? ` y quedaron inscritas ${result.linkedUsers} personas ya registradas.`
          : '.'),
    );
    this.rosterSection()?.reload();
  }

  protected onGenerated(result: GeneratedCodesDto): void {
    this.notice.set(`Se generaron ${result.codes.length} códigos de acceso.`);
    this.codesSection()?.reload();
  }
}
