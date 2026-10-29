// ⚠️ Archivo generado por tools/generate-api-models.mjs a partir de
// docs/api/openapi.json (Escuela Itinerante del Agua — API 0.1.0).
// Query y contrato de cada endpoint. No editar a mano: regenerar con `npm run api:models`.
/* eslint-disable */

import type { Paginated } from './api-client';
import type {
  AccessCodeDto,
  AccessUrlDto,
  AdminApplicationDetailDto,
  AdminApplicationListItemDto,
  AdminCalendarDto,
  AdminCalendarEventDto,
  AdminContactMessageDto,
  AdminDashboardDto,
  AdminDashboardTrendsDto,
  AdminMeDto,
  AdminModuleDto,
  AdminModulesDto,
  AdminOfferDetailDto,
  AdminOfferListItemDto,
  AdminOfferSort,
  AdminOfferStatus,
  AdminPaymentDetailDto,
  AdminPaymentDto,
  AdminPaymentPlanDto,
  AdminPaymentsSummaryDto,
  AdminRefundDto,
  AdminScholarshipTypeDto,
  AdminScholarshipTypesResponseDto,
  AdminSessionDto,
  AdminSessionListDto,
  AdminSiteMetricDto,
  AdminTeacherDto,
  AdminUserDto,
  AdminUserSort,
  ApplicationCardDto,
  ApplicationDecision,
  ApplicationDetailDto,
  ApplicationDocumentDto,
  ApplicationKind,
  ApplicationOpportunitiesDto,
  ApplicationSort,
  ApplicationStatus,
  ApplicationUploadUrlDto,
  ApproveApplicationRequestDto,
  AttendanceResultDto,
  AttendanceSessionChipsDto,
  AttendanceStatus,
  AuditLogDto,
  AvailabilityResponseDto,
  CalendarCategory,
  CalendarEventKind,
  CalendarResponseDto,
  CalendarSort,
  CancelInterviewRequestDto,
  CancelSessionRequestDto,
  CardUpdateSessionDto,
  ChangePasswordRequestDto,
  CheckoutSessionDto,
  ClassroomDto,
  CloseEnrollmentRequestDto,
  CloseEnrollmentResultDto,
  CompleteInterviewRequestDto,
  ConfirmDocumentRequestDto,
  ConfirmFinalProjectRequestDto,
  ContactInboxSummaryDto,
  ContactMessageResponseDto,
  ContactMessageSort,
  ContactOrigin,
  ContactStatus,
  ContactSubject,
  CountryListResponseDto,
  CreateApplicationRequestDto,
  CreateCalendarEventRequestDto,
  CreateContactMessageRequestDto,
  CreateEnrollmentRequestDto,
  CreateFollowUpNoteRequestDto,
  CreateMeetingRequestDto,
  CreateModuleRequestDto,
  CreateOfferRequestDto,
  CreateResourceRequestDto,
  CreateScholarshipTypeRequestDto,
  CreateSessionRequestDto,
  CreateTeacherRequestDto,
  Currency,
  DashboardDto,
  DecisionPreviewDto,
  DivisionListResponseDto,
  DuplicateOfferRequestDto,
  EvidenceUploadRequestDto,
  ExtendDeadlineRequestDto,
  FinalProjectDto,
  FinalProjectUploadRequestDto,
  FollowUpDetailDto,
  FollowUpItemDto,
  FollowUpNoteDto,
  FollowUpNotesDto,
  FollowUpTab,
  ForgotPasswordRequestDto,
  FormationCardDto,
  FormationPhaseFilter,
  FunnelOfferDto,
  GenerateCodesRequestDto,
  GenerateSessionsRequestDto,
  GenerateSessionsResultDto,
  GeneratedCodesDto,
  HealthResponseDto,
  ImageUploadUrlDto,
  ImageUploadUrlRequestDto,
  ImportRosterRequestDto,
  IsoDateTime,
  LibraryItemDto,
  LibraryItemType,
  LoginRequestDto,
  LoginResponseDto,
  LogoutRequestDto,
  MarkAllReadResponseDto,
  MarkAttendanceRequestDto,
  MarkAttendanceResultDto,
  MaterialsDto,
  MeetingDto,
  MeetingHostUrlDto,
  MeetingProvidersResponseDto,
  ModuleMutationDto,
  MoodleLinkResultDto,
  MunicipalityListResponseDto,
  NotificationCategory,
  NotificationDto,
  OfferAvailability,
  OfferDetailDto,
  OfferFunnelDto,
  OfferModality,
  OfferOrigin,
  OfferSummaryDto,
  OfferTopic,
  OfferType,
  OtpDeliveryDto,
  ParticipantAttendanceDto,
  PaymentConcept,
  PaymentDto,
  PaymentMethod,
  PaymentPlanDto,
  PaymentPlanSort,
  PaymentPlanStatus,
  PaymentPlansDto,
  PaymentQuoteDto,
  PaymentSort,
  PaymentStatus,
  PaymentsSummaryDto,
  PlanActionReasonRequestDto,
  ReadinessResponseDto,
  RedeemMoodleCodeRequestDto,
  RefreshRequestDto,
  RefundRequestDto,
  RefundStatus,
  RegisterAttendanceRequestDto,
  RegisterRequestDto,
  RegisterResponseDto,
  RejectApplicationRequestDto,
  RejectTransferRequestDto,
  RemindAttendanceResultDto,
  ReminderResultDto,
  ReorderModulesRequestDto,
  ReorderResourcesRequestDto,
  RescheduleSessionRequestDto,
  ResendOtpRequestDto,
  ResetPasswordRequestDto,
  ResetTokenResponseDto,
  ResourceMutationDto,
  ResourceUploadUrlDto,
  ResourceUploadUrlRequestDto,
  RetryEmailRequestDto,
  RetryEmailResultDto,
  Role,
  RolesCatalogDto,
  RosterEntryDto,
  RosterImportResultDto,
  ScheduleInterviewRequestDto,
  ScholarshipTypesResponseDto,
  SessionAttendanceDto,
  SessionCardDto,
  SessionChangeResultDto,
  SessionPreviewDto,
  SessionScope,
  SessionStatus,
  SiteMetricsResponseDto,
  StartCheckoutRequestDto,
  SubmitTransferRequestDto,
  SubmittedApplicationStatus,
  TimezonesResponseDto,
  TokenPairDto,
  TopicAvailabilityListDto,
  TransferStatus,
  TransferUploadUrlDto,
  TransferUploadUrlRequestDto,
  UnmarkAttendanceResultDto,
  UnreadCountDto,
  UpdateApplicationRequestDto,
  UpdateAttendanceStepDto,
  UpdateCalendarEventRequestDto,
  UpdateContactMessageRequestDto,
  UpdateContentStepDto,
  UpdateGeneralStepDto,
  UpdateModuleRequestDto,
  UpdateOriginPricingStepDto,
  UpdateProfileRequestDto,
  UpdateResourceRequestDto,
  UpdateScheduleStepDto,
  UpdateScholarshipTypeRequestDto,
  UpdateSessionRequestDto,
  UpdateSiteMetricRequestDto,
  UpdateTeacherRequestDto,
  UpdateTimezoneRequestDto,
  UpdateUserRolesRequestDto,
  UpdateWhatsappStepDto,
  UploadUrlDto,
  UpsertEvaluationRequestDto,
  UserProfileDto,
  UserStatus,
  UserStatusChangeRequestDto,
  Uuid,
  ValidateTransferRequestDto,
  VerifyEmailRequestDto,
  VerifyEmailResponseDto,
  VerifyResetOtpRequestDto,
  WhatsappRequestDto,
  WhatsappResultDto,
} from './models.generated';

/** Query de `GET /api/v1/timezones`. */
export interface LocationsTimezonesQuery {
  /** Instante (ISO 8601) para calcular los offsets (horario de verano). Por defecto, ahora. */
  readonly at?: string;
}

/** Query de `GET /api/v1/admin/users`. */
export interface AdminUsersListQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  /** Busca en nombre, correo o username. */
  readonly q?: string;
  /** Cuentas que tienen este rol. */
  readonly role?: Role;
  readonly status?: UserStatus;
  /** Solo cuentas con algún rol del equipo (todo menos PARTICIPANT). */
  readonly staffOnly?: boolean;
  readonly sort?: AdminUserSort;
}

/** Query de `GET /api/v1/admin/offers/{id}/moodle/roster`. */
export interface AdminMoodleRosterQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  /** Busca en el correo. */
  readonly q?: string;
  /** true = ya vinculados; false = pendientes. */
  readonly linked?: boolean;
}

/** Query de `GET /api/v1/admin/offers/{id}/moodle/codes`. */
export interface AdminMoodleCodesQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  /** true = canjeados; false = disponibles. */
  readonly used?: boolean;
}

/** Query de `GET /api/v1/me/enrollments`. */
export interface EnrollmentsListQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  /** Sub-ítem del menú "Formación": `DIPLOMA` (Diplomados), `COURSE` (Cursos), `WORKSHOP` (Talleres). Acepta varios (`?type=EVENT,OPEN_CALL`). Sin filtro: todas. */
  readonly type?: readonly OfferType[];
  /** Pestaña: Activos / Completados / Todos. */
  readonly phase?: FormationPhaseFilter;
}

/** Query de `GET /api/v1/me/notifications`. */
export interface NotificationsListQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  /** Solo no leídas. */
  readonly unread?: boolean;
  /** Grupo: Formación, Postulaciones y becas, Pagos o General. */
  readonly category?: NotificationCategory;
}

/** Query de `GET /api/v1/auth/availability`. */
export interface AuthAvailabilityQuery {
  readonly email?: string;
  readonly username?: string;
}

/** Query de `GET /api/v1/admin/contact-messages`. */
export interface AdminContactListQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  /** Busca en nombre, correo, organización y texto del mensaje. */
  readonly q?: string;
  readonly status?: ContactStatus;
  readonly subject?: ContactSubject;
  readonly origin?: ContactOrigin;
  /** Desde (ISO 8601). */
  readonly from?: string;
  /** Hasta (ISO 8601). */
  readonly to?: string;
  /** Orden por fecha de recepción. */
  readonly sort?: ContactMessageSort;
}

/** Query de `GET /api/v1/admin/dashboard`. */
export interface AdminDashboardOverviewQuery {
  /** Inicio del periodo (ISO 8601). Por defecto: 30 días antes de `to`. */
  readonly from?: string;
  /** Fin del periodo (ISO 8601). Por defecto: ahora. */
  readonly to?: string;
}

/** Query de `GET /api/v1/admin/dashboard/trends`. */
export interface AdminDashboardTrendsQuery {
  readonly months?: number;
}

/** Query de `GET /api/v1/offers`. */
export interface OffersListQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  /** Tipo(s): `?type=DIPLOMA,COURSE` o `?type=DIPLOMA&type=COURSE`. */
  readonly type?: readonly OfferType[];
  readonly modality?: OfferModality;
  /** Estado(s) derivado(s). Por defecto `ENROLLMENT_OPEN,UPCOMING` (Inscripciones abiertas y Próximamente). */
  readonly status?: readonly OfferAvailability[];
  /** "Con beca disponible": solo diplomados NAS con beca habilitada. */
  readonly scholarship?: boolean;
  /** Temática pública (HU-34): catálogo filtrado desde la página Itinerantes del Agua. */
  readonly topic?: OfferTopic;
  /** Búsqueda por nombre de la oferta o de la persona docente (sin distinguir acentos ni mayúsculas). Mínimo 3 caracteres. */
  readonly q?: string;
  /** Zona IANA del navegador (`Intl.DateTimeFormat().resolvedOptions().timeZone`). Sin sesión define la moneda (zona de México → MXN; resto → USD). También se acepta el header `X-Timezone`. Con sesión manda el país del perfil. */
  readonly tz?: string;
}

/** Query de `GET /api/v1/offers/availability`. */
export interface OffersAvailabilityQuery {
  /** Temáticas a consultar (`?topics=A,B`). Por defecto, las 10 de HU-34 en su orden. */
  readonly topics?: readonly OfferTopic[];
}

/** Query de `GET /api/v1/offers/{slug}`. */
export interface OffersDetailQuery {
  /** Zona IANA del navegador (`Intl.DateTimeFormat().resolvedOptions().timeZone`). Sin sesión define la moneda (zona de México → MXN; resto → USD). También se acepta el header `X-Timezone`. Con sesión manda el país del perfil. */
  readonly tz?: string;
}

/** Query de `GET /api/v1/admin/offers`. */
export interface AdminOffersListQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  /** Busca en el nombre. */
  readonly q?: string;
  readonly type?: OfferType;
  readonly modality?: OfferModality;
  readonly origin?: OfferOrigin;
  /** Estado del listado (HU-27): DRAFT Borrador · PUBLISHED Publicado (abiertas y próximamente) · ENROLLMENT_CLOSED Inscripciones cerradas · FINISHED Finalizado · ARCHIVED Archivado. */
  readonly status?: AdminOfferStatus;
  readonly sort?: AdminOfferSort;
}

/** Query de `GET /api/v1/admin/teachers`. */
export interface AdminTeachersListQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  /** Busca en el nombre. */
  readonly q?: string;
}

/** Query de `GET /api/v1/me/applications/opportunities`. */
export interface ApplicationsOpportunitiesQuery {
  /** "Becas disponibles" (`SCHOLARSHIP`) o "Convocatorias abiertas" (`OPEN_CALL`). */
  readonly kind: ApplicationKind;
}

/** Query de `GET /api/v1/me/applications`. */
export interface ApplicationsListQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  /** Pestaña "Mis postulaciones" de Becas (`SCHOLARSHIP`) o de Convocatorias (`OPEN_CALL`). */
  readonly kind?: ApplicationKind;
  /** Filtro por estado (varios con coma). */
  readonly status?: readonly ApplicationStatus[];
}

/** Query de `GET /api/v1/admin/applications`. */
export interface AdminApplicationsListQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  readonly kind?: ApplicationKind;
  readonly offerId?: Uuid;
  /** Estados separados por coma. Por defecto todos menos `DRAFT`. */
  readonly status?: readonly SubmittedApplicationStatus[];
  /** Tipo de beca solicitado (antes `level`). Ids de `GET /admin/scholarship-types`. */
  readonly scholarshipTypeId?: Uuid;
  readonly countryCode?: string;
  /** "Requiere entrevista". */
  readonly requiresInterview?: boolean;
  /** "Sin mi evaluación". */
  readonly withoutMyEvaluation?: boolean;
  /** Nombre, correo o folio. */
  readonly q?: string;
  readonly sort?: ApplicationSort;
}

/** Query de `GET /api/v1/admin/applications/export`. */
export interface AdminApplicationsExportQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  readonly kind?: ApplicationKind;
  readonly offerId?: Uuid;
  /** Estados separados por coma. Por defecto todos menos `DRAFT`. */
  readonly status?: readonly SubmittedApplicationStatus[];
  /** Tipo de beca solicitado (antes `level`). Ids de `GET /admin/scholarship-types`. */
  readonly scholarshipTypeId?: Uuid;
  readonly countryCode?: string;
  /** "Requiere entrevista". */
  readonly requiresInterview?: boolean;
  /** "Sin mi evaluación". */
  readonly withoutMyEvaluation?: boolean;
  /** Nombre, correo o folio. */
  readonly q?: string;
  readonly sort?: ApplicationSort;
}

/** Query de `GET /api/v1/admin/applications/{id}/decision-preview`. */
export interface AdminApplicationsDecisionPreviewQuery {
  readonly decision: ApplicationDecision;
  /** Beca: tipo a asignar. */
  readonly assignedScholarshipTypeId?: Uuid;
  /** Beca: % dentro del rango del tipo en la oferta (opcional si es fijo). */
  readonly assignedPercent?: number;
  /** Párrafo editable que se agregaría al correo. */
  readonly message?: string;
}

/** Query de `GET /api/v1/admin/funnel/offers`. */
export interface AdminFollowUpOffersQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  /** Busca por nombre. */
  readonly q?: string;
}

/** Query de `GET /api/v1/admin/funnel/offers/{offerId}/follow-ups`. */
export interface AdminFollowUpFollowUpsQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  /** `PENDING` = "Aprobados sin pagar" (y sin confirmar); `EXPIRED` = "Vencidas". */
  readonly tab?: FollowUpTab;
  /** Filtro de la etapa "Con pago iniciado" (true) o sin iniciar (false). */
  readonly paymentStarted?: boolean;
}

/** Query de `GET /api/v1/me/sessions`. */
export interface LiveSessionsListQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  /** `UPCOMING`: próximas y en curso (de la más cercana a la más lejana). `PAST`: historial (de la más reciente a la más antigua). */
  readonly scope?: SessionScope;
  /** Solo las sesiones de una oferta. */
  readonly offerId?: Uuid;
}

/** Query de `GET /api/v1/admin/offers/{id}/attendance/participants`. */
export interface AdminAttendanceParticipantsQuery {
  readonly countryCode?: string;
  readonly q?: string;
  /** Solo personas bajo el umbral de alerta (80%). */
  readonly belowThreshold?: boolean;
}

/** Query de `GET /api/v1/admin/offers/{id}/attendance/export`. */
export interface AdminAttendanceExportParticipantsQuery {
  readonly countryCode?: string;
  readonly q?: string;
  /** Solo personas bajo el umbral de alerta (80%). */
  readonly belowThreshold?: boolean;
}

/** Query de `GET /api/v1/admin/sessions/{id}/attendance`. */
export interface AdminAttendanceSessionQuery {
  /** Registrada / Pendiente / No registrada. */
  readonly status?: AttendanceStatus;
  /** País del perfil (ISO-3166 alpha-2). */
  readonly countryCode?: string;
  /** Nombre o correo (sin distinguir mayúsculas). */
  readonly q?: string;
}

/** Query de `GET /api/v1/admin/sessions/{id}/attendance/export`. */
export interface AdminAttendanceExportSessionQuery {
  /** Registrada / Pendiente / No registrada. */
  readonly status?: AttendanceStatus;
  /** País del perfil (ISO-3166 alpha-2). */
  readonly countryCode?: string;
  /** Nombre o correo (sin distinguir mayúsculas). */
  readonly q?: string;
}

/** Query de `GET /api/v1/me/classrooms/{offerId}/sessions`. */
export interface ClassroomSessionsQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  /** `UPCOMING`: próximas y en curso (de la más cercana a la más lejana). `PAST`: historial (de la más reciente a la más antigua). */
  readonly scope?: SessionScope;
}

/** Query de `GET /api/v1/me/calendar`. */
export interface CalendarGetQuery {
  /** Inicio del rango (ISO 8601 con zona). Normalmente el primer día visible de la cuadrícula. */
  readonly from: IsoDateTime;
  /** Fin del rango (exclusivo). Máximo 62 días después de `from`. */
  readonly to: IsoDateTime;
  /** Categorías (por defecto todas). Los chips de la UI pueden filtrar en cliente sin recargar. */
  readonly categories?: readonly CalendarCategory[];
}

/** Query de `GET /api/v1/admin/calendar`. */
export interface AdminCalendarViewQuery {
  /** Inicio del rango (ISO 8601). */
  readonly from: IsoDateTime;
  /** Fin (exclusivo). Máximo 62 días después de `from`. */
  readonly to: IsoDateTime;
  /** Filtrar por oferta. */
  readonly offerId?: Uuid;
  /** Filtrar por categoría de color. */
  readonly category?: CalendarCategory;
}

/** Query de `GET /api/v1/admin/calendar-events`. */
export interface AdminCalendarListQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  readonly offerId?: Uuid;
  /** MANUAL = eventos manuales; el resto son fechas importantes. */
  readonly kind?: CalendarEventKind;
  readonly category?: CalendarCategory;
  readonly status?: SessionStatus;
  readonly from?: string;
  readonly to?: string;
  readonly sort?: CalendarSort;
}

/** Query de `GET /api/v1/library`. */
export interface LibraryListQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  /** Chips de tipo (uno o varios). */
  readonly type?: readonly LibraryItemType[];
  /** Busca en título, autor y palabras clave (sin acentos ni mayúsculas). */
  readonly q?: string;
}

/** Query de `GET /api/v1/me/payments/quote`. */
export interface PaymentsQuoteQuery {
  /** HU-22/24: oferta a pagar (precio completo). Envía `offerId` O `applicationId`. */
  readonly offerId?: Uuid;
  /** HU-23/24: postulación "Aprobada – pendiente de pago" (saldo tras beca). */
  readonly applicationId?: Uuid;
}

/** Query de `GET /api/v1/me/payments`. */
export interface PaymentsListQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  /** Filtrar por estado. */
  readonly status?: PaymentStatus;
}

/** Query de `GET /api/v1/admin/payments`. */
export interface AdminPaymentsListQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  /** Estados (`?status=PAID,FAILED`). Por defecto todos menos `CANCELLED` (checkouts abandonados: no son pagos). */
  readonly status?: readonly PaymentStatus[];
  readonly method?: PaymentMethod;
  readonly concept?: PaymentConcept;
  readonly currency?: Currency;
  readonly offerId?: Uuid;
  /** Pagos de una persona. */
  readonly userId?: Uuid;
  /** Busca por folio (`PAG-000123`), nombre o correo de quien paga, o nombre de la oferta. */
  readonly q?: string;
  /** Creado desde (ISO 8601). */
  readonly from?: string;
  /** Creado hasta (ISO 8601). */
  readonly to?: string;
  readonly sort?: PaymentSort;
}

/** Query de `GET /api/v1/admin/payments/summary`. */
export interface AdminPaymentsSummaryQuery {
  /** Solo una oferta. */
  readonly offerId?: Uuid;
  /** Cobrado desde (fecha de pago/validación, ISO 8601). */
  readonly from?: string;
  /** Cobrado hasta. */
  readonly to?: string;
}

/** Query de `GET /api/v1/admin/refunds`. */
export interface AdminPaymentsRefundsQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  readonly status?: RefundStatus;
  readonly method?: PaymentMethod;
  readonly offerId?: Uuid;
}

/** Query de `GET /api/v1/admin/transfers`. */
export interface AdminPaymentsTransfersQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  /** "Transferencias por conciliar" = `PENDING_VALIDATION` (las más antiguas primero). */
  readonly status?: TransferStatus;
  readonly offerId?: Uuid;
  /** Busca por folio (`PAG-000123`), nombre o correo de quien paga, o nombre de la oferta. */
  readonly q?: string;
}

/** Query de `GET /api/v1/admin/payment-plans`. */
export interface AdminPaymentsPlansListQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  /** Estados (`?status=PAST_DUE,DELINQUENT`). Por defecto todos menos `PENDING_ACTIVATION` (checkout de la 1.ª cuota sin completar). */
  readonly status?: readonly PaymentPlanStatus[];
  readonly offerId?: Uuid;
  /** Nombre o correo de la persona. */
  readonly q?: string;
  /** `FAILED_SINCE_ASC`: los que llevan más días con cobro fallido primero. */
  readonly sort?: PaymentPlanSort;
}

/** Query de `GET /api/v1/admin/audit-logs`. */
export interface AdminAuditListQuery {
  /** Página (desde 1). */
  readonly page?: number;
  /** Elementos por página. */
  readonly pageSize?: number;
  /** Tipo de entidad (`Offer`, `Application`, `Payment`, `InstallmentPlan`, `User`…). */
  readonly entityType?: string;
  /** Id de la entidad. */
  readonly entityId?: string;
  /** Integrante del equipo que hizo la acción. */
  readonly actorId?: Uuid;
  /** Acción exacta (`offer.publish`) o prefijo (`offer.` = todas las de ofertas). */
  readonly action?: string;
  /** Desde (ISO 8601). */
  readonly from?: string;
  /** Hasta (ISO 8601). */
  readonly to?: string;
}

/**
 * Contrato de cada endpoint, indexado por `operationId`. Los servicios lo usan
 * (`ApiResponse<'Offers_list'>`) para que un cambio en la API se note al compilar.
 */
export interface ApiOperations {
  /** Liveness */
  readonly Health_liveness: {
    readonly method: 'GET';
    readonly path: '/api/v1/health';
    readonly pathParams: never;
    readonly query: never;
    readonly body: never;
    readonly response: HealthResponseDto;
  };
  /** Readiness */
  readonly Health_readiness: {
    readonly method: 'GET';
    readonly path: '/api/v1/health/ready';
    readonly pathParams: never;
    readonly query: never;
    readonly body: never;
    readonly response: ReadinessResponseDto;
  };
  /** Países */
  readonly Locations_countries: {
    readonly method: 'GET';
    readonly path: '/api/v1/locations/countries';
    readonly pathParams: never;
    readonly query: never;
    readonly body: never;
    readonly response: CountryListResponseDto;
  };
  /** Estados / departamentos de un país */
  readonly Locations_divisions: {
    readonly method: 'GET';
    readonly path: '/api/v1/locations/countries/{code}/divisions';
    readonly pathParams: 'code';
    readonly query: never;
    readonly body: never;
    readonly response: DivisionListResponseDto;
  };
  /** Municipios de un estado */
  readonly Locations_municipalities: {
    readonly method: 'GET';
    readonly path: '/api/v1/locations/divisions/{id}/municipalities';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: MunicipalityListResponseDto;
  };
  /** Zonas horarias */
  readonly Locations_timezones: {
    readonly method: 'GET';
    readonly path: '/api/v1/timezones';
    readonly pathParams: never;
    readonly query: LocationsTimezonesQuery;
    readonly body: never;
    readonly response: TimezonesResponseDto;
  };
  /** Mi perfil */
  readonly Me_getMe: {
    readonly method: 'GET';
    readonly path: '/api/v1/me';
    readonly pathParams: never;
    readonly query: never;
    readonly body: never;
    readonly response: UserProfileDto;
  };
  /** Actualizar mi perfil */
  readonly Me_updateMe: {
    readonly method: 'PATCH';
    readonly path: '/api/v1/me';
    readonly pathParams: never;
    readonly query: never;
    readonly body: UpdateProfileRequestDto;
    readonly response: UserProfileDto;
  };
  /** Guardar mi zona horaria */
  readonly Me_updateTimezone: {
    readonly method: 'PATCH';
    readonly path: '/api/v1/me/timezone';
    readonly pathParams: never;
    readonly query: never;
    readonly body: UpdateTimezoneRequestDto;
    readonly response: UserProfileDto;
  };
  /** Mi acceso al panel (roles y permisos) */
  readonly AdminUsers_me: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/me';
    readonly pathParams: never;
    readonly query: never;
    readonly body: never;
    readonly response: AdminMeDto;
  };
  /** Catálogo de roles y sus permisos */
  readonly AdminUsers_roles: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/roles';
    readonly pathParams: never;
    readonly query: never;
    readonly body: never;
    readonly response: RolesCatalogDto;
  };
  /** Cuentas (buscar personas para darles roles del equipo) */
  readonly AdminUsers_list: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/users';
    readonly pathParams: never;
    readonly query: AdminUsersListQuery;
    readonly body: never;
    readonly response: Paginated<AdminUserDto>;
  };
  /** Asignar roles del equipo */
  readonly AdminUsers_updateRoles: {
    readonly method: 'PUT';
    readonly path: '/api/v1/admin/users/{id}/roles';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: UpdateUserRolesRequestDto;
    readonly response: AdminUserDto;
  };
  /** Deshabilitar una cuenta */
  readonly AdminUsers_disable: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/users/{id}/disable';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: UserStatusChangeRequestDto;
    readonly response: AdminUserDto;
  };
  /** Volver a habilitar una cuenta */
  readonly AdminUsers_enable: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/users/{id}/enable';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: UserStatusChangeRequestDto;
    readonly response: AdminUserDto;
  };
  /** Marcar el correo de una cuenta como verificado */
  readonly AdminUsers_verifyEmail: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/users/{id}/verify-email';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: UserStatusChangeRequestDto;
    readonly response: AdminUserDto;
  };
  /** ¿No ves tu formación? Buscar por mi correo */
  readonly Moodle_link: {
    readonly method: 'POST';
    readonly path: '/api/v1/me/moodle-access/link';
    readonly pathParams: never;
    readonly query: never;
    readonly body: never;
    readonly response: MoodleLinkResultDto;
  };
  /** Activar acceso con código */
  readonly Moodle_redeem: {
    readonly method: 'POST';
    readonly path: '/api/v1/me/moodle-access/redeem';
    readonly pathParams: never;
    readonly query: never;
    readonly body: RedeemMoodleCodeRequestDto;
    readonly response: MoodleLinkResultDto;
  };
  /** Lista de correos inscritos (Moodle) */
  readonly AdminMoodle_roster: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/offers/{id}/moodle/roster';
    readonly pathParams: 'id';
    readonly query: AdminMoodleRosterQuery;
    readonly body: never;
    readonly response: Paginated<RosterEntryDto>;
  };
  /** Importar lista de correos (CSV) */
  readonly AdminMoodle_importRoster: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/offers/{id}/moodle/roster';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: ImportRosterRequestDto;
    readonly response: RosterImportResultDto;
  };
  /** Quitar un correo de la lista */
  readonly AdminMoodle_removeEntry: {
    readonly method: 'DELETE';
    readonly path: '/api/v1/admin/offers/{id}/moodle/roster/{entryId}';
    readonly pathParams: 'id' | 'entryId';
    readonly query: never;
    readonly body: never;
    readonly response: void;
  };
  /** Códigos de acceso generados */
  readonly AdminMoodle_codes: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/offers/{id}/moodle/codes';
    readonly pathParams: 'id';
    readonly query: AdminMoodleCodesQuery;
    readonly body: never;
    readonly response: Paginated<AccessCodeDto>;
  };
  /** Generar códigos de acceso */
  readonly AdminMoodle_generate: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/offers/{id}/moodle/codes';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: GenerateCodesRequestDto;
    readonly response: GeneratedCodesDto;
  };
  /** Mi formación */
  readonly Enrollments_list: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/enrollments';
    readonly pathParams: never;
    readonly query: EnrollmentsListQuery;
    readonly body: never;
    readonly response: Paginated<FormationCardDto>;
  };
  /** Inscribirme en una oferta gratuita */
  readonly Enrollments_enroll: {
    readonly method: 'POST';
    readonly path: '/api/v1/me/enrollments';
    readonly pathParams: never;
    readonly query: never;
    readonly body: CreateEnrollmentRequestDto;
    readonly response: FormationCardDto;
  };
  /** Mis notificaciones */
  readonly Notifications_list: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/notifications';
    readonly pathParams: never;
    readonly query: NotificationsListQuery;
    readonly body: never;
    readonly response: Paginated<NotificationDto>;
  };
  /** Contador de no leídas */
  readonly Notifications_unreadCount: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/notifications/unread-count';
    readonly pathParams: never;
    readonly query: never;
    readonly body: never;
    readonly response: UnreadCountDto;
  };
  /** Marcar todas como leídas */
  readonly Notifications_markAllRead: {
    readonly method: 'POST';
    readonly path: '/api/v1/me/notifications/read-all';
    readonly pathParams: never;
    readonly query: never;
    readonly body: never;
    readonly response: MarkAllReadResponseDto;
  };
  /** Marcar una notificación como leída */
  readonly Notifications_markRead: {
    readonly method: 'POST';
    readonly path: '/api/v1/me/notifications/{id}/read';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: NotificationDto;
  };
  /** Registro */
  readonly Auth_register: {
    readonly method: 'POST';
    readonly path: '/api/v1/auth/register';
    readonly pathParams: never;
    readonly query: never;
    readonly body: RegisterRequestDto;
    readonly response: RegisterResponseDto;
  };
  /** Disponibilidad de correo / username */
  readonly Auth_availability: {
    readonly method: 'GET';
    readonly path: '/api/v1/auth/availability';
    readonly pathParams: never;
    readonly query: AuthAvailabilityQuery;
    readonly body: never;
    readonly response: AvailabilityResponseDto;
  };
  /** Verificar correo con OTP */
  readonly Auth_verifyEmail: {
    readonly method: 'POST';
    readonly path: '/api/v1/auth/verify-email';
    readonly pathParams: never;
    readonly query: never;
    readonly body: VerifyEmailRequestDto;
    readonly response: VerifyEmailResponseDto;
  };
  /** Reenviar código OTP */
  readonly Auth_resendOtp: {
    readonly method: 'POST';
    readonly path: '/api/v1/auth/otp/resend';
    readonly pathParams: never;
    readonly query: never;
    readonly body: ResendOtpRequestDto;
    readonly response: OtpDeliveryDto;
  };
  /** Iniciar sesión */
  readonly Auth_login: {
    readonly method: 'POST';
    readonly path: '/api/v1/auth/login';
    readonly pathParams: never;
    readonly query: never;
    readonly body: LoginRequestDto;
    readonly response: LoginResponseDto;
  };
  /** Renovar tokens */
  readonly Auth_refresh: {
    readonly method: 'POST';
    readonly path: '/api/v1/auth/refresh';
    readonly pathParams: never;
    readonly query: never;
    readonly body: RefreshRequestDto;
    readonly response: TokenPairDto;
  };
  /** Cerrar sesión */
  readonly Auth_logout: {
    readonly method: 'POST';
    readonly path: '/api/v1/auth/logout';
    readonly pathParams: never;
    readonly query: never;
    readonly body: LogoutRequestDto;
    readonly response: void;
  };
  /** Recuperar contraseña — paso 1 (enviar código) */
  readonly Auth_forgotPassword: {
    readonly method: 'POST';
    readonly path: '/api/v1/auth/password/forgot';
    readonly pathParams: never;
    readonly query: never;
    readonly body: ForgotPasswordRequestDto;
    readonly response: OtpDeliveryDto;
  };
  /** Recuperar contraseña — paso 2 (verificar código) */
  readonly Auth_verifyResetOtp: {
    readonly method: 'POST';
    readonly path: '/api/v1/auth/password/verify-otp';
    readonly pathParams: never;
    readonly query: never;
    readonly body: VerifyResetOtpRequestDto;
    readonly response: ResetTokenResponseDto;
  };
  /** Recuperar contraseña — paso 3 (nueva contraseña) */
  readonly Auth_resetPassword: {
    readonly method: 'POST';
    readonly path: '/api/v1/auth/password/reset';
    readonly pathParams: never;
    readonly query: never;
    readonly body: ResetPasswordRequestDto;
    readonly response: void;
  };
  /** Cambiar mi contraseña */
  readonly AccountSecurity_changePassword: {
    readonly method: 'POST';
    readonly path: '/api/v1/me/password';
    readonly pathParams: never;
    readonly query: never;
    readonly body: ChangePasswordRequestDto;
    readonly response: void;
  };
  /** Enviar mensaje de Contacto */
  readonly Contact_create: {
    readonly method: 'POST';
    readonly path: '/api/v1/contact-messages';
    readonly pathParams: never;
    readonly query: never;
    readonly body: CreateContactMessageRequestDto;
    readonly response: ContactMessageResponseDto;
  };
  /** Bandeja de mensajes de Contacto */
  readonly AdminContact_list: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/contact-messages';
    readonly pathParams: never;
    readonly query: AdminContactListQuery;
    readonly body: never;
    readonly response: Paginated<AdminContactMessageDto>;
  };
  /** Contadores de la bandeja */
  readonly AdminContact_summary: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/contact-messages/summary';
    readonly pathParams: never;
    readonly query: never;
    readonly body: never;
    readonly response: ContactInboxSummaryDto;
  };
  /** Detalle de un mensaje de Contacto */
  readonly AdminContact_get: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/contact-messages/{id}';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: AdminContactMessageDto;
  };
  /** Cambiar estado o nota interna de un mensaje */
  readonly AdminContact_update: {
    readonly method: 'PATCH';
    readonly path: '/api/v1/admin/contact-messages/{id}';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: UpdateContactMessageRequestDto;
    readonly response: AdminContactMessageDto;
  };
  /** Cifras del inicio del panel */
  readonly AdminDashboard_overview: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/dashboard';
    readonly pathParams: never;
    readonly query: AdminDashboardOverviewQuery;
    readonly body: never;
    readonly response: AdminDashboardDto;
  };
  /** Series por mes para las gráficas del inicio */
  readonly AdminDashboard_trends: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/dashboard/trends';
    readonly pathParams: never;
    readonly query: AdminDashboardTrendsQuery;
    readonly body: never;
    readonly response: AdminDashboardTrendsDto;
  };
  /** Cifras de impacto de la landing */
  readonly SiteMetrics_list: {
    readonly method: 'GET';
    readonly path: '/api/v1/site/metrics';
    readonly pathParams: never;
    readonly query: never;
    readonly body: never;
    readonly response: SiteMetricsResponseDto;
  };
  /** Cifras de la landing (incluye ocultas) */
  readonly AdminSiteMetrics_list: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/site/metrics';
    readonly pathParams: never;
    readonly query: never;
    readonly body: never;
    readonly response: AdminSiteMetricDto[];
  };
  /** Editar una cifra de la landing */
  readonly AdminSiteMetrics_update: {
    readonly method: 'PATCH';
    readonly path: '/api/v1/admin/site/metrics/{key}';
    readonly pathParams: 'key';
    readonly query: never;
    readonly body: UpdateSiteMetricRequestDto;
    readonly response: AdminSiteMetricDto;
  };
  /** Tipos de beca vigentes */
  readonly ScholarshipTypes_list: {
    readonly method: 'GET';
    readonly path: '/api/v1/scholarship-types';
    readonly pathParams: never;
    readonly query: never;
    readonly body: never;
    readonly response: ScholarshipTypesResponseDto;
  };
  /** Tipos de beca (incluye inactivos) */
  readonly AdminScholarshipTypes_list: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/scholarship-types';
    readonly pathParams: never;
    readonly query: never;
    readonly body: never;
    readonly response: AdminScholarshipTypesResponseDto;
  };
  /** Crear tipo de beca */
  readonly AdminScholarshipTypes_create: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/scholarship-types';
    readonly pathParams: never;
    readonly query: never;
    readonly body: CreateScholarshipTypeRequestDto;
    readonly response: AdminScholarshipTypeDto;
  };
  /** Editar tipo de beca */
  readonly AdminScholarshipTypes_update: {
    readonly method: 'PATCH';
    readonly path: '/api/v1/admin/scholarship-types/{id}';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: UpdateScholarshipTypeRequestDto;
    readonly response: AdminScholarshipTypeDto;
  };
  /** Borrar tipo de beca */
  readonly AdminScholarshipTypes_remove: {
    readonly method: 'DELETE';
    readonly path: '/api/v1/admin/scholarship-types/{id}';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: void;
  };
  /** Catálogo de oferta formativa */
  readonly Offers_list: {
    readonly method: 'GET';
    readonly path: '/api/v1/offers';
    readonly pathParams: never;
    readonly query: OffersListQuery;
    readonly body: never;
    readonly response: Paginated<OfferSummaryDto>;
  };
  /** Disponibilidad por temática (página Itinerantes del Agua) */
  readonly Offers_availability: {
    readonly method: 'GET';
    readonly path: '/api/v1/offers/availability';
    readonly pathParams: never;
    readonly query: OffersAvailabilityQuery;
    readonly body: never;
    readonly response: TopicAvailabilityListDto;
  };
  /** Ficha de una oferta */
  readonly Offers_detail: {
    readonly method: 'GET';
    readonly path: '/api/v1/offers/{slug}';
    readonly pathParams: 'slug';
    readonly query: OffersDetailQuery;
    readonly body: never;
    readonly response: OfferDetailDto;
  };
  /** Listado de ofertas del panel */
  readonly AdminOffers_list: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/offers';
    readonly pathParams: never;
    readonly query: AdminOffersListQuery;
    readonly body: never;
    readonly response: Paginated<AdminOfferListItemDto>;
  };
  /** "+ Nueva oferta" (borrador) */
  readonly AdminOffers_create: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/offers';
    readonly pathParams: never;
    readonly query: never;
    readonly body: CreateOfferRequestDto;
    readonly response: AdminOfferDetailDto;
  };
  /** Detalle de la oferta (asistente) */
  readonly AdminOffers_detail: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/offers/{id}';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: AdminOfferDetailDto;
  };
  /** Borrar un borrador */
  readonly AdminOffers_remove: {
    readonly method: 'DELETE';
    readonly path: '/api/v1/admin/offers/{id}';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: void;
  };
  /** Paso 1 — Datos e imágenes */
  readonly AdminOffers_general: {
    readonly method: 'PATCH';
    readonly path: '/api/v1/admin/offers/{id}/steps/general';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: UpdateGeneralStepDto;
    readonly response: AdminOfferDetailDto;
  };
  /** Paso 2 — Contenido */
  readonly AdminOffers_content: {
    readonly method: 'PATCH';
    readonly path: '/api/v1/admin/offers/{id}/steps/content';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: UpdateContentStepDto;
    readonly response: AdminOfferDetailDto;
  };
  /** Paso 3 — Horarios */
  readonly AdminOffers_schedule: {
    readonly method: 'PATCH';
    readonly path: '/api/v1/admin/offers/{id}/steps/schedule';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: UpdateScheduleStepDto;
    readonly response: AdminOfferDetailDto;
  };
  /** Paso 4 — Origen y precio */
  readonly AdminOffers_originPricing: {
    readonly method: 'PATCH';
    readonly path: '/api/v1/admin/offers/{id}/steps/origin-pricing';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: UpdateOriginPricingStepDto;
    readonly response: AdminOfferDetailDto;
  };
  /** Paso 6 — Asistencia */
  readonly AdminOffers_attendance: {
    readonly method: 'PATCH';
    readonly path: '/api/v1/admin/offers/{id}/steps/attendance';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: UpdateAttendanceStepDto;
    readonly response: AdminOfferDetailDto;
  };
  /** Paso 7 — WhatsApp */
  readonly AdminOffers_whatsapp: {
    readonly method: 'PATCH';
    readonly path: '/api/v1/admin/offers/{id}/steps/whatsapp';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: UpdateWhatsappStepDto;
    readonly response: AdminOfferDetailDto;
  };
  /** Publicar */
  readonly AdminOffers_publish: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/offers/{id}/publish';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: AdminOfferDetailDto;
  };
  /** Despublicar (volver a borrador) */
  readonly AdminOffers_unpublish: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/offers/{id}/unpublish';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: AdminOfferDetailDto;
  };
  /** Archivar */
  readonly AdminOffers_archive: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/offers/{id}/archive';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: AdminOfferDetailDto;
  };
  /** Duplicar (nueva cohorte) */
  readonly AdminOffers_duplicate: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/offers/{id}/duplicate';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: DuplicateOfferRequestDto;
    readonly response: AdminOfferDetailDto;
  };
  /** URL firmada para subir una imagen de difusión */
  readonly AdminUploads_imageUploadUrl: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/uploads/images';
    readonly pathParams: never;
    readonly query: never;
    readonly body: ImageUploadUrlRequestDto;
    readonly response: ImageUploadUrlDto;
  };
  /** Docentes */
  readonly AdminTeachers_list: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/teachers';
    readonly pathParams: never;
    readonly query: AdminTeachersListQuery;
    readonly body: never;
    readonly response: Paginated<AdminTeacherDto>;
  };
  /** Registrar docente */
  readonly AdminTeachers_create: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/teachers';
    readonly pathParams: never;
    readonly query: never;
    readonly body: CreateTeacherRequestDto;
    readonly response: AdminTeacherDto;
  };
  /** Editar docente */
  readonly AdminTeachers_update: {
    readonly method: 'PATCH';
    readonly path: '/api/v1/admin/teachers/{id}';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: UpdateTeacherRequestDto;
    readonly response: AdminTeacherDto;
  };
  /** Borrar docente */
  readonly AdminTeachers_remove: {
    readonly method: 'DELETE';
    readonly path: '/api/v1/admin/teachers/{id}';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: void;
  };
  /** Módulos y recursos de una oferta */
  readonly AdminContent_list: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/offers/{id}/modules';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: AdminModulesDto;
  };
  /** Agregar módulo */
  readonly AdminContent_createModule: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/offers/{id}/modules';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: CreateModuleRequestDto;
    readonly response: ModuleMutationDto;
  };
  /** Reordenar módulos (arrastrar y soltar) */
  readonly AdminContent_reorderModules: {
    readonly method: 'PUT';
    readonly path: '/api/v1/admin/offers/{id}/modules/order';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: ReorderModulesRequestDto;
    readonly response: AdminModulesDto;
  };
  /** Editar / publicar / ocultar un módulo */
  readonly AdminContent_updateModule: {
    readonly method: 'PATCH';
    readonly path: '/api/v1/admin/modules/{moduleId}';
    readonly pathParams: 'moduleId';
    readonly query: never;
    readonly body: UpdateModuleRequestDto;
    readonly response: ModuleMutationDto;
  };
  /** Borrar módulo */
  readonly AdminContent_deleteModule: {
    readonly method: 'DELETE';
    readonly path: '/api/v1/admin/modules/{moduleId}';
    readonly pathParams: 'moduleId';
    readonly query: never;
    readonly body: never;
    readonly response: void;
  };
  /** URL firmada para subir el archivo de un recurso */
  readonly AdminContent_uploadUrl: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/modules/{moduleId}/resources/upload-url';
    readonly pathParams: 'moduleId';
    readonly query: never;
    readonly body: ResourceUploadUrlRequestDto;
    readonly response: ResourceUploadUrlDto;
  };
  /** Agregar recurso */
  readonly AdminContent_createResource: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/modules/{moduleId}/resources';
    readonly pathParams: 'moduleId';
    readonly query: never;
    readonly body: CreateResourceRequestDto;
    readonly response: ResourceMutationDto;
  };
  /** Reordenar recursos del módulo */
  readonly AdminContent_reorderResources: {
    readonly method: 'PUT';
    readonly path: '/api/v1/admin/modules/{moduleId}/resources/order';
    readonly pathParams: 'moduleId';
    readonly query: never;
    readonly body: ReorderResourcesRequestDto;
    readonly response: AdminModuleDto;
  };
  /** Editar / publicar / ocultar un recurso */
  readonly AdminContent_updateResource: {
    readonly method: 'PATCH';
    readonly path: '/api/v1/admin/resources/{resourceId}';
    readonly pathParams: 'resourceId';
    readonly query: never;
    readonly body: UpdateResourceRequestDto;
    readonly response: ResourceMutationDto;
  };
  /** Borrar recurso */
  readonly AdminContent_deleteResource: {
    readonly method: 'DELETE';
    readonly path: '/api/v1/admin/resources/{resourceId}';
    readonly pathParams: 'resourceId';
    readonly query: never;
    readonly body: never;
    readonly response: void;
  };
  /** Becas disponibles / Convocatorias abiertas */
  readonly Applications_opportunities: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/applications/opportunities';
    readonly pathParams: never;
    readonly query: ApplicationsOpportunitiesQuery;
    readonly body: never;
    readonly response: ApplicationOpportunitiesDto;
  };
  /** Mis postulaciones */
  readonly Applications_list: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/applications';
    readonly pathParams: never;
    readonly query: ApplicationsListQuery;
    readonly body: never;
    readonly response: Paginated<ApplicationCardDto>;
  };
  /** Iniciar postulación (borrador) */
  readonly Applications_create: {
    readonly method: 'POST';
    readonly path: '/api/v1/me/applications';
    readonly pathParams: never;
    readonly query: never;
    readonly body: CreateApplicationRequestDto;
    readonly response: ApplicationDetailDto;
  };
  /** Ver mi postulación */
  readonly Applications_get: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/applications/{id}';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: ApplicationDetailDto;
  };
  /** Guardar borrador (autoguardado) */
  readonly Applications_update: {
    readonly method: 'PATCH';
    readonly path: '/api/v1/me/applications/{id}';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: UpdateApplicationRequestDto;
    readonly response: ApplicationDetailDto;
  };
  /** Descartar borrador */
  readonly Applications_remove: {
    readonly method: 'DELETE';
    readonly path: '/api/v1/me/applications/{id}';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: void;
  };
  /** Enviar postulación */
  readonly Applications_submit: {
    readonly method: 'POST';
    readonly path: '/api/v1/me/applications/{id}/submit';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: ApplicationDetailDto;
  };
  /** Confirmar mi participación */
  readonly Applications_confirm: {
    readonly method: 'POST';
    readonly path: '/api/v1/me/applications/{id}/confirm';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: ApplicationDetailDto;
  };
  /** Evidencia: pedir URL de carga */
  readonly Applications_uploadUrl: {
    readonly method: 'POST';
    readonly path: '/api/v1/me/applications/{id}/documents/upload-url';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: EvidenceUploadRequestDto;
    readonly response: ApplicationUploadUrlDto;
  };
  /** Evidencia: confirmar archivo subido */
  readonly Applications_confirmDocument: {
    readonly method: 'POST';
    readonly path: '/api/v1/me/applications/{id}/documents';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: ConfirmDocumentRequestDto;
    readonly response: ApplicationDocumentDto;
  };
  /** Evidencia: quitar archivo */
  readonly Applications_deleteDocument: {
    readonly method: 'DELETE';
    readonly path: '/api/v1/me/applications/{id}/documents/{documentId}';
    readonly pathParams: 'id' | 'documentId';
    readonly query: never;
    readonly body: never;
    readonly response: void;
  };
  /** Evidencia: descargar / ver archivo */
  readonly Applications_download: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/applications/{id}/documents/{documentId}/download';
    readonly pathParams: 'id' | 'documentId';
    readonly query: never;
    readonly body: never;
    readonly response: AccessUrlDto;
  };
  /** Bandeja de postulaciones (becas y convocatorias) */
  readonly AdminApplications_list: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/applications';
    readonly pathParams: never;
    readonly query: AdminApplicationsListQuery;
    readonly body: never;
    readonly response: Paginated<AdminApplicationListItemDto>;
  };
  /** Exportar postulaciones a CSV (Excel) */
  readonly AdminApplications_export: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/applications/export';
    readonly pathParams: never;
    readonly query: AdminApplicationsExportQuery;
    readonly body: never;
    readonly response: void;
  };
  /** Detalle de una postulación */
  readonly AdminApplications_detail: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/applications/{id}';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: AdminApplicationDetailDto;
  };
  /** Guardar mi evaluación */
  readonly AdminApplications_evaluate: {
    readonly method: 'PUT';
    readonly path: '/api/v1/admin/applications/{id}/evaluations/me';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: UpsertEvaluationRequestDto;
    readonly response: AdminApplicationDetailDto;
  };
  /** Agendar o reprogramar la entrevista por Zoom */
  readonly AdminApplications_scheduleInterview: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/applications/{id}/interview';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: ScheduleInterviewRequestDto;
    readonly response: AdminApplicationDetailDto;
  };
  /** Marcar la entrevista como "Realizada" (o "No asistió") */
  readonly AdminApplications_completeInterview: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/applications/{id}/interview/complete';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: CompleteInterviewRequestDto;
    readonly response: AdminApplicationDetailDto;
  };
  /** Cancelar la entrevista (sin reprogramar) */
  readonly AdminApplications_cancelInterview: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/applications/{id}/interview/cancel';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: CancelInterviewRequestDto;
    readonly response: AdminApplicationDetailDto;
  };
  /** Vista previa de la decisión y del correo */
  readonly AdminApplications_decisionPreview: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/applications/{id}/decision-preview';
    readonly pathParams: 'id';
    readonly query: AdminApplicationsDecisionPreviewQuery;
    readonly body: never;
    readonly response: DecisionPreviewDto;
  };
  /** Registrar decisión: Aprobada */
  readonly AdminApplications_approve: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/applications/{id}/approve';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: ApproveApplicationRequestDto;
    readonly response: AdminApplicationDetailDto;
  };
  /** Registrar decisión: No seleccionada */
  readonly AdminApplications_reject: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/applications/{id}/reject';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: RejectApplicationRequestDto;
    readonly response: AdminApplicationDetailDto;
  };
  /** Reintentar el envío de un correo fallido */
  readonly AdminApplications_retryEmail: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/applications/{id}/retry-email';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: RetryEmailRequestDto;
    readonly response: RetryEmailResultDto;
  };
  /** Ofertas con postulaciones o inscripciones (selector) */
  readonly AdminFollowUp_offers: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/funnel/offers';
    readonly pathParams: never;
    readonly query: AdminFollowUpOffersQuery;
    readonly body: never;
    readonly response: Paginated<FunnelOfferDto>;
  };
  /** Embudo de conversión de una oferta */
  readonly AdminFollowUp_funnel: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/funnel/offers/{offerId}';
    readonly pathParams: 'offerId';
    readonly query: never;
    readonly body: never;
    readonly response: OfferFunnelDto;
  };
  /** "Aprobados sin pagar" / "Vencidas" */
  readonly AdminFollowUp_followUps: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/funnel/offers/{offerId}/follow-ups';
    readonly pathParams: 'offerId';
    readonly query: AdminFollowUpFollowUpsQuery;
    readonly body: never;
    readonly response: Paginated<FollowUpItemDto>;
  };
  /** Cerrar inscripciones */
  readonly AdminFollowUp_closeEnrollment: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/funnel/offers/{offerId}/close-enrollment';
    readonly pathParams: 'offerId';
    readonly query: never;
    readonly body: CloseEnrollmentRequestDto;
    readonly response: CloseEnrollmentResultDto;
  };
  /** Panel lateral de seguimiento de una persona */
  readonly AdminFollowUp_detail: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/applications/{id}/follow-up';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: FollowUpDetailDto;
  };
  /** Notas de seguimiento */
  readonly AdminFollowUp_notes: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/applications/{id}/notes';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: FollowUpNotesDto;
  };
  /** Agregar nota de seguimiento */
  readonly AdminFollowUp_addNote: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/applications/{id}/notes';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: CreateFollowUpNoteRequestDto;
    readonly response: FollowUpNoteDto;
  };
  /** Enviar recordatorio por correo */
  readonly AdminFollowUp_remind: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/applications/{id}/reminders';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: ReminderResultDto;
  };
  /** Contactar por WhatsApp (enlace wa.me prellenado) */
  readonly AdminFollowUp_whatsapp: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/applications/{id}/whatsapp';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: WhatsappRequestDto;
    readonly response: WhatsappResultDto;
  };
  /** Extender plazo */
  readonly AdminFollowUp_extendDeadline: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/applications/{id}/extend-deadline';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: ExtendDeadlineRequestDto;
    readonly response: FollowUpDetailDto;
  };
  /** Mis sesiones en vivo */
  readonly LiveSessions_list: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/sessions';
    readonly pathParams: never;
    readonly query: LiveSessionsListQuery;
    readonly body: never;
    readonly response: Paginated<SessionCardDto>;
  };
  /** Detalle de una sesión */
  readonly LiveSessions_detail: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/sessions/{sessionId}';
    readonly pathParams: 'sessionId';
    readonly query: never;
    readonly body: never;
    readonly response: SessionCardDto;
  };
  /** Registrar mi asistencia */
  readonly LiveSessions_registerAttendance: {
    readonly method: 'POST';
    readonly path: '/api/v1/me/sessions/{sessionId}/attendance';
    readonly pathParams: 'sessionId';
    readonly query: never;
    readonly body: RegisterAttendanceRequestDto;
    readonly response: AttendanceResultDto;
  };
  /** Sesiones de una oferta (panel) */
  readonly AdminSessions_list: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/offers/{id}/sessions';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: AdminSessionListDto;
  };
  /** Crear una sesión manual */
  readonly AdminSessions_create: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/offers/{id}/sessions';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: CreateSessionRequestDto;
    readonly response: AdminSessionDto;
  };
  /** Vista previa de la generación de sesiones */
  readonly AdminSessions_preview: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/offers/{id}/sessions/preview';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: GenerateSessionsRequestDto;
    readonly response: SessionPreviewDto;
  };
  /** "Crear sesiones" (confirmar la vista previa) */
  readonly AdminSessions_generate: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/offers/{id}/sessions/generate';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: GenerateSessionsRequestDto;
    readonly response: GenerateSessionsResultDto;
  };
  /** Detalle de una sesión (panel) */
  readonly AdminSessions_get: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/sessions/{id}';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: AdminSessionDto;
  };
  /** Editar enlaces, módulo, categoría, ventana o grabación de una sesión */
  readonly AdminSessions_update: {
    readonly method: 'PATCH';
    readonly path: '/api/v1/admin/sessions/{id}';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: UpdateSessionRequestDto;
    readonly response: SessionChangeResultDto;
  };
  /** Borrar una sesión sin asistencias */
  readonly AdminSessions_remove: {
    readonly method: 'DELETE';
    readonly path: '/api/v1/admin/sessions/{id}';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: void;
  };
  /** Reprogramar una sesión (con motivo) */
  readonly AdminSessions_reschedule: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/sessions/{id}/reschedule';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: RescheduleSessionRequestDto;
    readonly response: SessionChangeResultDto;
  };
  /** Cancelar una sesión (con motivo) */
  readonly AdminSessions_cancel: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/sessions/{id}/cancel';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: CancelSessionRequestDto;
    readonly response: SessionChangeResultDto;
  };
  /** Chips de sesiones con su estado de registro */
  readonly AdminAttendance_chips: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/offers/{id}/attendance/sessions';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: AttendanceSessionChipsDto;
  };
  /** Asistencia "Por participante" (% de asistencia) */
  readonly AdminAttendance_participants: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/offers/{id}/attendance/participants';
    readonly pathParams: 'id';
    readonly query: AdminAttendanceParticipantsQuery;
    readonly body: never;
    readonly response: ParticipantAttendanceDto;
  };
  /** Exportar asistencia por participante (CSV) */
  readonly AdminAttendance_exportParticipants: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/offers/{id}/attendance/export';
    readonly pathParams: 'id';
    readonly query: AdminAttendanceExportParticipantsQuery;
    readonly body: never;
    readonly response: void;
  };
  /** Asistencia "Por sesión" */
  readonly AdminAttendance_session: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/sessions/{id}/attendance';
    readonly pathParams: 'id';
    readonly query: AdminAttendanceSessionQuery;
    readonly body: never;
    readonly response: SessionAttendanceDto;
  };
  /** Exportar asistencia de una sesión (CSV) */
  readonly AdminAttendance_exportSession: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/sessions/{id}/attendance/export';
    readonly pathParams: 'id';
    readonly query: AdminAttendanceExportSessionQuery;
    readonly body: never;
    readonly response: void;
  };
  /** Marcar asistencia manual / "Pasar lista en sitio" */
  readonly AdminAttendance_mark: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/sessions/{id}/attendance/mark';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: MarkAttendanceRequestDto;
    readonly response: MarkAttendanceResultDto;
  };
  /** Desmarcar asistencia (corrección con motivo) */
  readonly AdminAttendance_unmark: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/sessions/{id}/attendance/unmark';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: MarkAttendanceRequestDto;
    readonly response: UnmarkAttendanceResultDto;
  };
  /** "Recordar a pendientes" */
  readonly AdminAttendance_remind: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/sessions/{id}/attendance/remind';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: RemindAttendanceResultDto;
  };
  /** Aula de mi formación */
  readonly Classroom_get: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/classrooms/{offerId}';
    readonly pathParams: 'offerId';
    readonly query: never;
    readonly body: never;
    readonly response: ClassroomDto;
  };
  /** Materiales del curso */
  readonly Classroom_materials: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/classrooms/{offerId}/materials';
    readonly pathParams: 'offerId';
    readonly query: never;
    readonly body: never;
    readonly response: MaterialsDto;
  };
  /** Abrir / descargar un recurso */
  readonly Classroom_resourceAccess: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/classrooms/{offerId}/resources/{resourceId}/access';
    readonly pathParams: 'offerId' | 'resourceId';
    readonly query: never;
    readonly body: never;
    readonly response: AccessUrlDto;
  };
  /** Sesiones del aula */
  readonly Classroom_sessions: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/classrooms/{offerId}/sessions';
    readonly pathParams: 'offerId';
    readonly query: ClassroomSessionsQuery;
    readonly body: never;
    readonly response: Paginated<SessionCardDto>;
  };
  /** Proyecto final: pedir URL de carga */
  readonly Classroom_finalProjectUploadUrl: {
    readonly method: 'POST';
    readonly path: '/api/v1/me/classrooms/{offerId}/final-project/upload-url';
    readonly pathParams: 'offerId';
    readonly query: never;
    readonly body: FinalProjectUploadRequestDto;
    readonly response: UploadUrlDto;
  };
  /** Proyecto final: confirmar entrega */
  readonly Classroom_confirmFinalProject: {
    readonly method: 'PUT';
    readonly path: '/api/v1/me/classrooms/{offerId}/final-project';
    readonly pathParams: 'offerId';
    readonly query: never;
    readonly body: ConfirmFinalProjectRequestDto;
    readonly response: FinalProjectDto;
  };
  /** Proyecto final: descargar mi entrega */
  readonly Classroom_finalProjectDownload: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/classrooms/{offerId}/final-project/download';
    readonly pathParams: 'offerId';
    readonly query: never;
    readonly body: never;
    readonly response: AccessUrlDto;
  };
  /** Mi calendario */
  readonly Calendar_get: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/calendar';
    readonly pathParams: never;
    readonly query: CalendarGetQuery;
    readonly body: never;
    readonly response: CalendarResponseDto;
  };
  /** Calendario del panel (vista mensual / lista) */
  readonly AdminCalendar_view: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/calendar';
    readonly pathParams: never;
    readonly query: AdminCalendarViewQuery;
    readonly body: never;
    readonly response: AdminCalendarDto;
  };
  /** Eventos de calendario (manuales y fechas importantes) */
  readonly AdminCalendar_list: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/calendar-events';
    readonly pathParams: never;
    readonly query: AdminCalendarListQuery;
    readonly body: never;
    readonly response: Paginated<AdminCalendarEventDto>;
  };
  /** "+ Evento manual" */
  readonly AdminCalendar_create: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/calendar-events';
    readonly pathParams: never;
    readonly query: never;
    readonly body: CreateCalendarEventRequestDto;
    readonly response: AdminCalendarEventDto;
  };
  /** Editar un evento */
  readonly AdminCalendar_update: {
    readonly method: 'PATCH';
    readonly path: '/api/v1/admin/calendar-events/{id}';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: UpdateCalendarEventRequestDto;
    readonly response: AdminCalendarEventDto;
  };
  /** Borrar un evento */
  readonly AdminCalendar_remove: {
    readonly method: 'DELETE';
    readonly path: '/api/v1/admin/calendar-events/{id}';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: void;
  };
  /** Cancelar un evento */
  readonly AdminCalendar_cancel: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/calendar-events/{id}/cancel';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: AdminCalendarEventDto;
  };
  /** Biblioteca digital */
  readonly Library_list: {
    readonly method: 'GET';
    readonly path: '/api/v1/library';
    readonly pathParams: never;
    readonly query: LibraryListQuery;
    readonly body: never;
    readonly response: Paginated<LibraryItemDto>;
  };
  /** Abrir un recurso de la biblioteca */
  readonly Library_access: {
    readonly method: 'GET';
    readonly path: '/api/v1/library/{id}/access';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: AccessUrlDto;
  };
  /** Mi dashboard */
  readonly Dashboard_get: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/dashboard';
    readonly pathParams: never;
    readonly query: never;
    readonly body: never;
    readonly response: DashboardDto;
  };
  /** Resumen de pago (precio, cuotas, métodos, transferencia) */
  readonly Payments_quote: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/payments/quote';
    readonly pathParams: never;
    readonly query: PaymentsQuoteQuery;
    readonly body: never;
    readonly response: PaymentQuoteDto;
  };
  /** Iniciar pago con tarjeta (Stripe Checkout) */
  readonly Payments_start: {
    readonly method: 'POST';
    readonly path: '/api/v1/me/payments/checkout';
    readonly pathParams: never;
    readonly query: never;
    readonly body: StartCheckoutRequestDto;
    readonly response: CheckoutSessionDto;
  };
  /** Mis pagos: historial */
  readonly Payments_list: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/payments';
    readonly pathParams: never;
    readonly query: PaymentsListQuery;
    readonly body: never;
    readonly response: Paginated<PaymentDto>;
  };
  /** Mis pagos: plan vigente y avisos */
  readonly Payments_summary: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/payments/summary';
    readonly pathParams: never;
    readonly query: never;
    readonly body: never;
    readonly response: PaymentsSummaryDto;
  };
  /** Mis planes de cuotas */
  readonly Payments_plans: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/payments/plans';
    readonly pathParams: never;
    readonly query: never;
    readonly body: never;
    readonly response: PaymentPlansDto;
  };
  /** Detalle de un plan de cuotas */
  readonly Payments_plan: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/payments/plans/{planId}';
    readonly pathParams: 'planId';
    readonly query: never;
    readonly body: never;
    readonly response: PaymentPlanDto;
  };
  /** [Actualizar tarjeta] */
  readonly Payments_cardUpdate: {
    readonly method: 'POST';
    readonly path: '/api/v1/me/payments/plans/{planId}/card-update';
    readonly pathParams: 'planId';
    readonly query: never;
    readonly body: never;
    readonly response: CardUpdateSessionDto;
  };
  /** [Pagar ahora] cuotas fallidas */
  readonly Payments_payNow: {
    readonly method: 'POST';
    readonly path: '/api/v1/me/payments/plans/{planId}/pay-now';
    readonly pathParams: 'planId';
    readonly query: never;
    readonly body: never;
    readonly response: PaymentPlanDto;
  };
  /** Comprobante de transferencia, paso 1: URL de carga */
  readonly Payments_transferUploadUrl: {
    readonly method: 'POST';
    readonly path: '/api/v1/me/payments/transfers/upload-url';
    readonly pathParams: never;
    readonly query: never;
    readonly body: TransferUploadUrlRequestDto;
    readonly response: TransferUploadUrlDto;
  };
  /** Comprobante de transferencia, paso 3: enviar */
  readonly Payments_submitTransfer: {
    readonly method: 'POST';
    readonly path: '/api/v1/me/payments/transfers';
    readonly pathParams: never;
    readonly query: never;
    readonly body: SubmitTransferRequestDto;
    readonly response: PaymentDto;
  };
  /** Detalle / estado de un pago */
  readonly Payments_get: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/payments/{id}';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: PaymentDto;
  };
  /** Cancelar un checkout abierto */
  readonly Payments_cancel: {
    readonly method: 'POST';
    readonly path: '/api/v1/me/payments/{id}/cancel';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: void;
  };
  /** Descargar comprobante (PDF) */
  readonly Payments_receipt: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/payments/{id}/receipt';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: void;
  };
  /** Ver mi comprobante de transferencia */
  readonly Payments_transferProof: {
    readonly method: 'GET';
    readonly path: '/api/v1/me/payments/{id}/transfer-proof';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: AccessUrlDto;
  };
  /** Webhook de Stripe (no lo llama el frontend) */
  readonly StripeWebhook_handle: {
    readonly method: 'POST';
    readonly path: '/api/v1/webhooks/stripe';
    readonly pathParams: never;
    readonly query: never;
    readonly body: Record<string, unknown>;
    readonly response: {
      readonly received?: boolean;
      readonly duplicate?: boolean;
      readonly ignored?: boolean;
    };
  };
  /** Listado de pagos */
  readonly AdminPayments_list: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/payments';
    readonly pathParams: never;
    readonly query: AdminPaymentsListQuery;
    readonly body: never;
    readonly response: Paginated<AdminPaymentDto>;
  };
  /** Resumen de pagos por moneda */
  readonly AdminPayments_summary: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/payments/summary';
    readonly pathParams: never;
    readonly query: AdminPaymentsSummaryQuery;
    readonly body: never;
    readonly response: AdminPaymentsSummaryDto;
  };
  /** Detalle de un pago */
  readonly AdminPayments_detail: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/payments/{id}';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: AdminPaymentDetailDto;
  };
  /** Comprobante de transferencia (URL firmada) */
  readonly AdminPayments_proof: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/payments/{id}/proof';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: AccessUrlDto;
  };
  /** Reembolsar un pago (total o parcial) */
  readonly AdminPayments_refund: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/payments/{id}/refund';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: RefundRequestDto;
    readonly response: AdminPaymentDetailDto;
  };
  /** Reembolsos */
  readonly AdminPayments_refunds: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/refunds';
    readonly pathParams: never;
    readonly query: AdminPaymentsRefundsQuery;
    readonly body: never;
    readonly response: Paginated<AdminRefundDto>;
  };
  /** Transferencias por conciliar */
  readonly AdminPayments_transfers: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/transfers';
    readonly pathParams: never;
    readonly query: AdminPaymentsTransfersQuery;
    readonly body: never;
    readonly response: Paginated<AdminPaymentDto>;
  };
  /** Validar transferencia y activar inscripción */
  readonly AdminPayments_validateTransfer: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/transfers/{id}/validate';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: ValidateTransferRequestDto;
    readonly response: AdminPaymentDetailDto;
  };
  /** Rechazar transferencia */
  readonly AdminPayments_rejectTransfer: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/transfers/{id}/reject';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: RejectTransferRequestDto;
    readonly response: AdminPaymentDetailDto;
  };
  /** Planes de cuotas */
  readonly AdminPayments_plansList: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/payment-plans';
    readonly pathParams: never;
    readonly query: AdminPaymentsPlansListQuery;
    readonly body: never;
    readonly response: Paginated<AdminPaymentPlanDto>;
  };
  /** Detalle de un plan de cuotas */
  readonly AdminPayments_plan: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/payment-plans/{id}';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: AdminPaymentPlanDto;
  };
  /** Reintentar cobro */
  readonly AdminPayments_retry: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/payment-plans/{id}/retry';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: AdminPaymentPlanDto;
  };
  /** Marcar plan "En mora" */
  readonly AdminPayments_markDelinquent: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/payment-plans/{id}/mark-delinquent';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: never;
    readonly response: AdminPaymentPlanDto;
  };
  /** Suspender acceso (manual) */
  readonly AdminPayments_suspendAccess: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/payment-plans/{id}/suspend-access';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: PlanActionReasonRequestDto;
    readonly response: AdminPaymentPlanDto;
  };
  /** Restablecer acceso */
  readonly AdminPayments_restoreAccess: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/payment-plans/{id}/restore-access';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: PlanActionReasonRequestDto;
    readonly response: AdminPaymentPlanDto;
  };
  /** Cancelar plan */
  readonly AdminPayments_cancel: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/payment-plans/{id}/cancel';
    readonly pathParams: 'id';
    readonly query: never;
    readonly body: PlanActionReasonRequestDto;
    readonly response: AdminPaymentPlanDto;
  };
  /** Registro de auditoría del panel */
  readonly AdminAudit_list: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/audit-logs';
    readonly pathParams: never;
    readonly query: AdminAuditListQuery;
    readonly body: never;
    readonly response: Paginated<AuditLogDto>;
  };
  /** Proveedores de reuniones disponibles */
  readonly AdminMeetings_providers: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/meetings/providers';
    readonly pathParams: never;
    readonly query: never;
    readonly body: never;
    readonly response: MeetingProvidersResponseDto;
  };
  /** Generar reunión (Zoom / Google Meet) */
  readonly AdminMeetings_create: {
    readonly method: 'POST';
    readonly path: '/api/v1/admin/meetings';
    readonly pathParams: never;
    readonly query: never;
    readonly body: CreateMeetingRequestDto;
    readonly response: MeetingDto;
  };
  /** Enlace de anfitrión vigente */
  readonly AdminMeetings_hostUrl: {
    readonly method: 'GET';
    readonly path: '/api/v1/admin/meetings/{provider}/{externalId}/host-url';
    readonly pathParams: 'provider' | 'externalId';
    readonly query: never;
    readonly body: never;
    readonly response: MeetingHostUrlDto;
  };
  /** Cancelar reunión generada */
  readonly AdminMeetings_cancel: {
    readonly method: 'DELETE';
    readonly path: '/api/v1/admin/meetings/{provider}/{externalId}';
    readonly pathParams: 'provider' | 'externalId';
    readonly query: never;
    readonly body: never;
    readonly response: void;
  };
}

export type ApiOperationId = keyof ApiOperations;
/** Respuesta correcta de un endpoint. */
export type ApiResponse<Id extends ApiOperationId> = ApiOperations[Id]['response'];
/** Cuerpo JSON de un endpoint. */
export type ApiBody<Id extends ApiOperationId> = ApiOperations[Id]['body'];
/** Query de un endpoint. */
export type ApiQuery<Id extends ApiOperationId> = ApiOperations[Id]['query'];
