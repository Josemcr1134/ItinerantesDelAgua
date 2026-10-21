// ⚠️ Archivo generado por tools/generate-api-models.mjs a partir de
// docs/api/openapi.json (Escuela Itinerante del Agua — API 0.1.0).
// Query y contrato de cada endpoint. No editar a mano: regenerar con `npm run api:models`.
/* eslint-disable */

import type { Paginated } from './api-client';
import type {
  AccessUrlDto,
  AttendanceResultDto,
  AvailabilityResponseDto,
  CalendarCategory,
  CalendarResponseDto,
  ChangePasswordRequestDto,
  ClassroomDto,
  ConfirmFinalProjectRequestDto,
  ContactMessageResponseDto,
  CountryListResponseDto,
  CreateContactMessageRequestDto,
  CreateEnrollmentRequestDto,
  DashboardDto,
  DivisionListResponseDto,
  FinalProjectDto,
  FinalProjectUploadRequestDto,
  ForgotPasswordRequestDto,
  FormationCardDto,
  FormationPhaseFilter,
  HealthResponseDto,
  IsoDateTime,
  LibraryItemDto,
  LibraryItemType,
  LoginRequestDto,
  LoginResponseDto,
  LogoutRequestDto,
  MarkAllReadResponseDto,
  MaterialsDto,
  MunicipalityListResponseDto,
  NotificationCategory,
  NotificationDto,
  OfferAvailability,
  OfferDetailDto,
  OfferModality,
  OfferSummaryDto,
  OfferTopic,
  OfferType,
  OtpDeliveryDto,
  ReadinessResponseDto,
  RefreshRequestDto,
  RegisterAttendanceRequestDto,
  RegisterRequestDto,
  RegisterResponseDto,
  ResendOtpRequestDto,
  ResetPasswordRequestDto,
  ResetTokenResponseDto,
  SessionCardDto,
  SessionScope,
  TimezonesResponseDto,
  TokenPairDto,
  TopicAvailabilityListDto,
  UnreadCountDto,
  UpdateProfileRequestDto,
  UpdateTimezoneRequestDto,
  UploadUrlDto,
  UserProfileDto,
  Uuid,
  VerifyEmailRequestDto,
  VerifyEmailResponseDto,
  VerifyResetOtpRequestDto,
} from './models.generated';

/** Query de `GET /api/v1/timezones`. */
export interface LocationsTimezonesQuery {
  /** Instante (ISO 8601) para calcular los offsets (horario de verano). Por defecto, ahora. */
  readonly at?: string;
}

/** Query de `GET /api/v1/auth/availability`. */
export interface AuthAvailabilityQuery {
  readonly email?: string;
  readonly username?: string;
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
}

export type ApiOperationId = keyof ApiOperations;
/** Respuesta correcta de un endpoint. */
export type ApiResponse<Id extends ApiOperationId> = ApiOperations[Id]['response'];
/** Cuerpo JSON de un endpoint. */
export type ApiBody<Id extends ApiOperationId> = ApiOperations[Id]['body'];
/** Query de un endpoint. */
export type ApiQuery<Id extends ApiOperationId> = ApiOperations[Id]['query'];
