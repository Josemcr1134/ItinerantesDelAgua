// ⚠️ Archivo generado por tools/generate-api-models.mjs a partir de
// docs/api/openapi.json (Escuela Itinerante del Agua — API 0.1.0).
// DTO, enums y alias de la API. No editar a mano: regenerar con `npm run api:models`.
/* eslint-disable */

/** Fecha y hora ISO 8601 (p. ej. `2026-03-01T15:00:00.000Z`). */
export type IsoDateTime = string;

/** Identificador UUID. */
export type Uuid = string;

export const ATTENDANCE_SOURCE_VALUES = ['PARTICIPANT', 'MANUAL'] as const;
export type AttendanceSource = (typeof ATTENDANCE_SOURCE_VALUES)[number];

export const ATTENDANCE_STATUS_VALUES = [
  'PENDING',
  'REGISTERED',
  'NOT_REGISTERED',
  'NOT_APPLICABLE',
] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUS_VALUES)[number];

export const ATTENDANCE_WINDOW_STATE_VALUES = [
  'NOT_OPEN_YET',
  'OPEN',
  'CLOSED',
  'NOT_APPLICABLE',
] as const;
export type AttendanceWindowState = (typeof ATTENDANCE_WINDOW_STATE_VALUES)[number];

export const CALENDAR_CATEGORY_VALUES = [
  'TRAINING',
  'TERRITORY',
  'COMMUNITY',
  'EVENTS',
  'IMPORTANT_DATES',
] as const;
export type CalendarCategory = (typeof CALENDAR_CATEGORY_VALUES)[number];

export const CALENDAR_ITEM_KIND_VALUES = [
  'SESSION',
  'ACTIVITY_DUE',
  'MANUAL',
  'ENROLLMENT_OPENS',
  'ENROLLMENT_CLOSES',
  'OFFER_STARTS',
  'SCHOLARSHIP_DEADLINE',
  'FINAL_PROJECT',
] as const;
export type CalendarItemKind = (typeof CALENDAR_ITEM_KIND_VALUES)[number];

export const CALENDAR_ITEM_SOURCE_VALUES = ['SESSION', 'EVENT', 'ACTIVITY'] as const;
export type CalendarItemSource = (typeof CALENDAR_ITEM_SOURCE_VALUES)[number];

export const CALENDAR_LINK_KIND_VALUES = ['CLASSROOM', 'OFFER', 'NONE'] as const;
export type CalendarLinkKind = (typeof CALENDAR_LINK_KIND_VALUES)[number];

export const CURRENCY_VALUES = ['MXN', 'USD'] as const;
export type Currency = (typeof CURRENCY_VALUES)[number];

export const CURRENCY_SOURCE_VALUES = ['PROFILE', 'TIMEZONE', 'DEFAULT'] as const;
export type CurrencySource = (typeof CURRENCY_SOURCE_VALUES)[number];

export const DASHBOARD_BLOCK_VALUES = [
  'nextActivity',
  'formations',
  'upcomingEvents',
  'recommendedResources',
  'notifications',
] as const;
export type DashboardBlock = (typeof DASHBOARD_BLOCK_VALUES)[number];

export const ENROLLMENT_STATUS_VALUES = [
  'PENDING_PAYMENT',
  'ACTIVE',
  'COMPLETED',
  'SUSPENDED',
  'CANCELLED',
] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUS_VALUES)[number];

export const ERROR_CODE_VALUES = [
  'VALIDATION_ERROR',
  'BAD_REQUEST',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'PAYLOAD_TOO_LARGE',
  'BUSINESS_RULE_VIOLATION',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
  'SERVICE_UNAVAILABLE',
  'AUTH_EMAIL_ALREADY_REGISTERED',
  'AUTH_USERNAME_TAKEN',
  'AUTH_INVALID_CREDENTIALS',
  'AUTH_EMAIL_NOT_VERIFIED',
  'AUTH_ACCOUNT_DISABLED',
  'AUTH_LOGIN_LOCKED',
  'AUTH_ACCOUNT_NOT_FOUND',
  'AUTH_ALREADY_VERIFIED',
  'AUTH_OTP_INVALID',
  'AUTH_OTP_EXPIRED',
  'AUTH_OTP_LOCKED',
  'AUTH_OTP_COOLDOWN',
  'AUTH_REFRESH_INVALID',
  'AUTH_RESET_TOKEN_INVALID',
  'AUTH_CURRENT_PASSWORD_INVALID',
  'CONTACT_CAPTCHA_FAILED',
  'OFFER_NOT_AVAILABLE',
  'ENROLLMENT_REQUIRED',
  'ENROLLMENT_SUSPENDED',
  'ENROLLMENT_ALREADY_EXISTS',
  'ENROLLMENT_NOT_FREE',
  'ENROLLMENT_CLOSED',
  'OFFER_SOLD_OUT',
  'SESSION_CANCELLED',
  'ATTENDANCE_NOT_OPEN_YET',
  'ATTENDANCE_WINDOW_CLOSED',
  'ATTENDANCE_ALREADY_REGISTERED',
  'RESOURCE_FILE_UNAVAILABLE',
  'FINAL_PROJECT_NOT_AVAILABLE',
  'FINAL_PROJECT_DEADLINE_PASSED',
  'FINAL_PROJECT_INVALID_FILE',
  'FINAL_PROJECT_UPLOAD_NOT_FOUND',
] as const;
export type ErrorCode = (typeof ERROR_CODE_VALUES)[number];

export const FINAL_PROJECT_CONTENT_TYPE_VALUES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
] as const;
export type FinalProjectContentType = (typeof FINAL_PROJECT_CONTENT_TYPE_VALUES)[number];

export const FORMATION_PHASE_VALUES = ['ACTIVE', 'COMPLETED'] as const;
export type FormationPhase = (typeof FORMATION_PHASE_VALUES)[number];

export const FORMATION_PHASE_FILTER_VALUES = ['ACTIVE', 'COMPLETED', 'ALL'] as const;
export type FormationPhaseFilter = (typeof FORMATION_PHASE_FILTER_VALUES)[number];

export const LIBRARY_AUDIENCE_VALUES = ['ALL_REGISTERED', 'OFFER_ENROLLED'] as const;
export type LibraryAudience = (typeof LIBRARY_AUDIENCE_VALUES)[number];

export const LIBRARY_ITEM_TYPE_VALUES = [
  'PDF',
  'ARTICLE',
  'BOOK',
  'VIDEO',
  'AUDIO',
  'EXTERNAL',
  'COURSE_MATERIAL',
] as const;
export type LibraryItemType = (typeof LIBRARY_ITEM_TYPE_VALUES)[number];

export const MATERIAL_RESOURCE_TYPE_VALUES = ['PRESENTATION', 'PRE_READING', 'ACTIVITY'] as const;
export type MaterialResourceType = (typeof MATERIAL_RESOURCE_TYPE_VALUES)[number];

export const MODULE_STATUS_VALUES = ['UPCOMING', 'IN_PROGRESS', 'COMPLETED'] as const;
export type ModuleStatus = (typeof MODULE_STATUS_VALUES)[number];

export const NOTIFICATION_CATEGORY_VALUES = [
  'TRAINING',
  'APPLICATIONS',
  'PAYMENTS',
  'GENERAL',
] as const;
export type NotificationCategory = (typeof NOTIFICATION_CATEGORY_VALUES)[number];

export const NOTIFICATION_PRIORITY_VALUES = ['NORMAL', 'HIGH'] as const;
export type NotificationPriority = (typeof NOTIFICATION_PRIORITY_VALUES)[number];

export const NOTIFICATION_TYPE_VALUES = [
  'ENROLLMENT_CONFIRMED',
  'ATTENDANCE_OPEN',
  'WHATSAPP_GROUP_AVAILABLE',
  'MATERIAL_PUBLISHED',
  'RECORDING_PUBLISHED',
  'SESSION_RESCHEDULED',
  'SESSION_CANCELLED',
  'MOODLE_ENROLLMENT_LINKED',
  'APPLICATION_SUBMITTED',
  'APPLICATION_STATUS_CHANGED',
  'INTERVIEW_SCHEDULED',
  'INTERVIEW_REMINDER',
  'SCHOLARSHIP_APPROVED',
  'APPLICATION_EXPIRED',
  'PAYMENT_CONFIRMED',
  'BALANCE_DUE_REMINDER',
  'INSTALLMENT_UPCOMING',
  'INSTALLMENT_PAID',
  'INSTALLMENT_FAILED',
  'PLAN_DELINQUENT',
  'TRANSFER_VALIDATED',
  'TRANSFER_REJECTED',
  'GENERAL',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPE_VALUES)[number];

export const OFFER_ACTION_REASON_VALUES = [
  'ENROLLMENT_NOT_OPEN_YET',
  'ENROLLMENT_CLOSED',
  'OFFER_FINISHED',
  'SOLD_OUT',
  'SCHOLARSHIP_NOT_OPEN_YET',
  'SCHOLARSHIP_CLOSED',
  'PRICE_NOT_AVAILABLE',
] as const;
export type OfferActionReason = (typeof OFFER_ACTION_REASON_VALUES)[number];

export const OFFER_ACTION_TYPE_VALUES = [
  'ENROLL_AND_PAY',
  'PAY_IN_INSTALLMENTS',
  'ENROLL_FREE',
  'APPLY_SCHOLARSHIP',
  'APPLY_OPEN_CALL',
  'ACTIVATE_MOODLE_ACCESS',
  'GO_TO_CLASSROOM',
] as const;
export type OfferActionType = (typeof OFFER_ACTION_TYPE_VALUES)[number];

export const OFFER_AVAILABILITY_VALUES = [
  'ENROLLMENT_OPEN',
  'UPCOMING',
  'ENROLLMENT_CLOSED',
  'FINISHED',
] as const;
export type OfferAvailability = (typeof OFFER_AVAILABILITY_VALUES)[number];

export const OFFER_MODALITY_VALUES = ['ONLINE_LIVE', 'IN_PERSON'] as const;
export type OfferModality = (typeof OFFER_MODALITY_VALUES)[number];

export const OFFER_ORIGIN_VALUES = ['NAS', 'MOODLE'] as const;
export type OfferOrigin = (typeof OFFER_ORIGIN_VALUES)[number];

export const OFFER_TOPIC_VALUES = [
  'ECOTECH_WATER_DIPLOMA',
  'ECOPEDAGOGIES_DIPLOMA',
  'WATER_APPRENTICES_SCHOOL',
  'WATER_TREATMENT_SYSTEMS_INTRO',
  'CONSTRUCTED_WETLANDS',
  'DRY_TOILETS',
  'WATER_HARVESTING',
  'TRAVELING_WATER_LABS',
  'TERRITORIAL_PRACTICES',
  'FIELD_VISITS',
] as const;
export type OfferTopic = (typeof OFFER_TOPIC_VALUES)[number];

export const OFFER_TYPE_VALUES = ['DIPLOMA', 'COURSE', 'WORKSHOP', 'EVENT', 'OPEN_CALL'] as const;
export type OfferType = (typeof OFFER_TYPE_VALUES)[number];

export const PRICING_KIND_VALUES = ['PAID', 'FREE', 'EXTERNAL_ENROLLMENT'] as const;
export type PricingKind = (typeof PRICING_KIND_VALUES)[number];

export const RECORDING_STATE_VALUES = [
  'AVAILABLE',
  'AFTER_SESSION',
  'PENDING',
  'NOT_APPLICABLE',
] as const;
export type RecordingState = (typeof RECORDING_STATE_VALUES)[number];

export const RESOURCE_KIND_VALUES = ['FILE', 'EXTERNAL_LINK'] as const;
export type ResourceKind = (typeof RESOURCE_KIND_VALUES)[number];

export const SCHEDULE_STATUS_VALUES = [
  'HAS_NEXT_SESSION',
  'NO_UPCOMING_SESSIONS',
  'FINISHED',
] as const;
export type ScheduleStatus = (typeof SCHEDULE_STATUS_VALUES)[number];

export const SCHOLARSHIP_LEVEL_VALUES = [
  'AGUA_VIVA',
  'RIOS_VIVOS',
  'AGUAS_LIBRES',
  'CENOTES_VIVOS',
  'SPECIAL',
] as const;
export type ScholarshipLevel = (typeof SCHOLARSHIP_LEVEL_VALUES)[number];

export const SESSION_JOIN_STATE_VALUES = [
  'NOT_YET',
  'OPEN',
  'LINK_PENDING',
  'ENDED',
  'CANCELLED',
  'IN_PERSON',
] as const;
export type SessionJoinState = (typeof SESSION_JOIN_STATE_VALUES)[number];

export const SESSION_PLATFORM_VALUES = ['ZOOM', 'GOOGLE_MEET', 'OTHER'] as const;
export type SessionPlatform = (typeof SESSION_PLATFORM_VALUES)[number];

export const SESSION_SCOPE_VALUES = ['UPCOMING', 'PAST'] as const;
export type SessionScope = (typeof SESSION_SCOPE_VALUES)[number];

export const SESSION_STATUS_VALUES = ['SCHEDULED', 'CANCELLED'] as const;
export type SessionStatus = (typeof SESSION_STATUS_VALUES)[number];

export const SUBMISSION_STATE_VALUES = ['DISABLED', 'OPEN', 'CLOSED'] as const;
export type SubmissionState = (typeof SUBMISSION_STATE_VALUES)[number];

export const TOPIC_AVAILABILITY_VALUES = [
  'ENROLLMENT_OPEN',
  'UPCOMING',
  'ENROLLMENT_CLOSED',
  'OPEN_CALL',
  'NO_SCHEDULED_DATES',
] as const;
export type TopicAvailability = (typeof TOPIC_AVAILABILITY_VALUES)[number];

export const TOPIC_GROUP_VALUES = [
  'SPECIALIZED_TRAINING',
  'ONLINE_COURSES_WORKSHOPS',
  'HANDS_ON_LEARNING',
] as const;
export type TopicGroup = (typeof TOPIC_GROUP_VALUES)[number];

export const TOPIC_LINK_KIND_VALUES = ['OFFER', 'CATALOG', 'NONE'] as const;
export type TopicLinkKind = (typeof TOPIC_LINK_KIND_VALUES)[number];

export const WINDOW_STATUS_VALUES = ['OPEN', 'UPCOMING', 'CLOSED'] as const;
export type WindowStatus = (typeof WINDOW_STATUS_VALUES)[number];

export interface HealthResponseDto {
  readonly status: 'ok';
  /** Versión de la API. */
  readonly version: string;
  /** Segundos desde que arrancó el proceso. */
  readonly uptimeSeconds: number;
  /** Hora del servidor (UTC). */
  readonly timestamp: string;
}

export interface ErrorDetailDto {
  /** Campo afectado (ruta con puntos si es anidado). */
  readonly field: string;
  /** Código estable del error de campo. */
  readonly code: string;
  readonly message: string;
}

export interface ErrorResponseDto {
  /** Status HTTP (repetido en el cuerpo). */
  readonly statusCode: number;
  /** Código estable para decidir qué mostrar en el frontend. Catálogo en docs/frontend/errores.md. */
  readonly code: ErrorCode;
  /** Mensaje en español. */
  readonly message: string;
  /** Errores por campo (validación, duplicados). Ausente si no aplica. */
  readonly details?: ErrorDetailDto[];
  /** Datos extra para la UI según el `code` (p. ej. `lockedUntil`, `resendAvailableAt`, `attemptsRemaining`). Ausente si no aplica. */
  readonly meta?: {
    readonly [key: string]: unknown;
  };
  /** Identificador de la petición (header `X-Request-Id`). Inclúyelo al reportar errores. */
  readonly requestId: string;
}

export interface ReadinessChecksDto {
  readonly database: 'up';
}

export interface ReadinessResponseDto {
  readonly status: 'ok';
  readonly checks: ReadinessChecksDto;
  readonly timestamp: string;
}

export interface CountryDto {
  /** ISO-3166 alpha-2. */
  readonly code: string;
  readonly name: string;
  /** Indicativo sugerido para el teléfono. */
  readonly phoneCode: string;
  /** Longitud mínima del número (sin indicativo). */
  readonly phoneMinLength: number;
  /** Longitud máxima del número (sin indicativo). */
  readonly phoneMaxLength: number;
  /** true → el estado se elige de GET /locations/countries/{code}/divisions; false → texto libre. */
  readonly hasDivisions: boolean;
  /** Etiqueta del primer nivel en la UI. */
  readonly divisionLabel: string;
  /** Etiqueta del segundo nivel en la UI. */
  readonly municipalityLabel: string;
  /** Moneda de cobro para residentes del país (MX → MXN; resto → USD). */
  readonly currency: Currency;
}

export interface CountryListResponseDto {
  /** México y Centroamérica primero. */
  readonly data: CountryDto[];
}

export interface DivisionDto {
  readonly id: string;
  /** Clave oficial (INEGI para México). */
  readonly code: string;
  readonly name: string;
  /** true → el municipio se elige de GET /locations/divisions/{id}/municipalities; false → texto libre. */
  readonly hasMunicipalities: boolean;
}

export interface DivisionListResponseDto {
  readonly data: DivisionDto[];
}

export interface MunicipalityDto {
  readonly id: string;
  /** Clave oficial (INEGI para México). */
  readonly code: string;
  readonly name: string;
}

export interface MunicipalityListResponseDto {
  readonly data: MunicipalityDto[];
}

export interface TimezoneDto {
  /** Zona IANA (valor a guardar). */
  readonly id: string;
  /** Etiqueta para el selector. */
  readonly label: string;
  /** País (ISO alpha-2) para buscar por país. */
  readonly countryCode: string | null;
  /** Offset UTC en el instante consultado. */
  readonly utcOffset: string;
  /** Offset en minutos (para ordenar/calcular). */
  readonly offsetMinutes: number;
}

export interface ReferenceTimezoneDto {
  readonly id: string;
  readonly label: string;
  readonly utcOffset: string;
  readonly offsetMinutes: number;
  /** true en la fila de referencia (CDMX). */
  readonly isOfficial: boolean;
}

export interface TimezonesResponseDto {
  /** Hora oficial de las actividades (CDMX). Todas las fechas de la API viajan en UTC. */
  readonly officialTimezone: string;
  /** Zona a usar si el navegador no permite detectarla (HU-02, HU-11). */
  readonly defaultTimezone: string;
  /** Instante usado para offsets. */
  readonly at: string;
  /** Zonas sugeridas para el selector. */
  readonly zones: TimezoneDto[];
  /** Tabla "Ver en otros países" (HU-11): CDMX de referencia y ciudades del público. */
  readonly referenceZones: ReferenceTimezoneDto[];
}

export interface PhoneResponseDto {
  readonly countryCode: string;
  readonly number: string;
}

export interface LocationResponseDto {
  readonly countryCode: string;
  readonly countryName: string;
  /** Id de catálogo; null si se capturó como texto libre. */
  readonly divisionId: string | null;
  readonly divisionName: string;
  /** Id de catálogo; null si se capturó como texto libre. */
  readonly municipalityId: string | null;
  readonly municipalityName: string;
}

export const ROLE_VALUES = [
  'PARTICIPANT',
  'SUPER_ADMIN',
  'ACADEMIC_COORDINATOR',
  'REVIEW_COMMITTEE',
  'REVIEW_DECIDER',
  'FOLLOW_UP',
  'FINANCE',
] as const;
export type Role = (typeof ROLE_VALUES)[number];

export const USER_STATUS_VALUES = ['PENDING_VERIFICATION', 'ACTIVE', 'DISABLED'] as const;
export type UserStatus = (typeof USER_STATUS_VALUES)[number];

export interface UserProfileDto {
  readonly id: string;
  readonly fullName: string;
  /** No editable. */
  readonly username: string;
  /** No editable. */
  readonly email: string;
  readonly phone: PhoneResponseDto;
  readonly location: LocationResponseDto;
  /** Zona IANA (HU-11). */
  readonly timezone: string;
  /** Calculado: moneda de los pagos nuevos según el país (MX → MXN; resto → USD). */
  readonly currency: Currency;
  readonly roles: Role[];
  readonly status: UserStatus;
  readonly emailVerifiedAt: IsoDateTime | null;
  readonly lastLoginAt: IsoDateTime | null;
  readonly createdAt: IsoDateTime;
  readonly updatedAt: IsoDateTime;
}

export interface PhoneDto {
  /** Indicativo con "+" (ver `phoneCode` del país). */
  readonly countryCode: string;
  /** Solo dígitos, sin indicativo. Se ignoran espacios y guiones. La longitud se valida contra el país del indicativo (`phoneMinLength`/`phoneMaxLength`). */
  readonly number: string;
}

export interface LocationInputDto {
  /** ISO-3166 alpha-2 (ver GET /locations/countries). */
  readonly countryCode: string;
  /** Id del estado/departamento (países con lista). */
  readonly divisionId?: string;
  /** Estado/departamento/provincia en texto libre (países sin lista). */
  readonly divisionName?: string;
  /** Id del municipio (estados con lista). */
  readonly municipalityId?: string;
  /** Municipio/ciudad en texto libre (cuando no hay lista). */
  readonly municipalityName?: string;
}

export interface UpdateProfileRequestDto {
  /** Solo letras (con tildes o ñ) y espacios. */
  readonly fullName?: string;
  readonly phone?: PhoneDto;
  /** Ubicación completa. */
  readonly location?: LocationInputDto;
  /** Zona horaria IANA (ver GET /timezones). Por defecto America/Mexico_City. */
  readonly timezone?: string;
}

export interface UpdateTimezoneRequestDto {
  /** Zona horaria IANA (ver GET /timezones). Por defecto America/Mexico_City. */
  readonly timezone: string;
}

export interface RegisterRequestDto {
  /** Solo letras (con tildes o ñ) y espacios. */
  readonly fullName: string;
  /** De 3 a 30 caracteres: letras, números, punto o guion bajo. Se guarda en minúsculas. Único y no editable. */
  readonly username: string;
  /** Se normaliza a minúsculas y sin espacios. */
  readonly email: string;
  /** Mínimo 8 caracteres, al menos una letra y un número. */
  readonly password: string;
  readonly phone: PhoneDto;
  readonly location: LocationInputDto;
  /** Zona horaria IANA (ver GET /timezones). Por defecto America/Mexico_City. */
  readonly timezone: string;
}

export interface OtpDeliveryDto {
  /** Correo de destino enmascarado. */
  readonly maskedEmail: string;
  /** Número de dígitos (casillas). */
  readonly codeLength: number;
  /** Vencimiento del código. */
  readonly expiresAt: IsoDateTime;
  /** Desde cuándo se puede pedir otro código ("Reenviar en 00:30"). */
  readonly resendAvailableAt: IsoDateTime;
}

export interface RegisterResponseDto {
  readonly userId: string;
  readonly email: string;
  readonly status: UserStatus;
  readonly otp: OtpDeliveryDto;
}

export interface FieldAvailabilityDto {
  /** Valor normalizado que se evaluó. */
  readonly value: string;
  /** Formato válido. */
  readonly valid: boolean;
  /** Formato válido y no registrado. */
  readonly available: boolean;
}

export interface AvailabilityResponseDto {
  readonly email?: FieldAvailabilityDto;
  readonly username?: FieldAvailabilityDto;
}

export interface VerifyEmailRequestDto {
  /** Se normaliza a minúsculas y sin espacios. */
  readonly email: string;
  /** Código de 6 dígitos recibido por correo. */
  readonly code: string;
}

export interface VerifyEmailResponseDto {
  readonly verified: boolean;
  readonly email: string;
}

/** `EMAIL_VERIFICATION` (HU-03) o `PASSWORD_RESET` (HU-05). */
export const OTP_PURPOSE_VALUES = ['EMAIL_VERIFICATION', 'PASSWORD_RESET'] as const;
export type OtpPurpose = (typeof OTP_PURPOSE_VALUES)[number];

export interface ResendOtpRequestDto {
  /** Se normaliza a minúsculas y sin espacios. */
  readonly email: string;
  /** `EMAIL_VERIFICATION` (HU-03) o `PASSWORD_RESET` (HU-05). */
  readonly purpose: OtpPurpose;
}

export interface LoginRequestDto {
  readonly email: string;
  readonly password: string;
  /** "Recordarme": alarga la vida del refresh token en este dispositivo. */
  readonly rememberMe?: boolean;
}

export interface LoginResponseDto {
  readonly accessToken: string;
  readonly tokenType: string;
  /** Segundos de vida del accessToken. */
  readonly expiresIn: number;
  readonly accessTokenExpiresAt: IsoDateTime;
  readonly refreshToken: string;
  /** 7 días (30 con "Recordarme"). Cada refresh lo renueva. */
  readonly refreshTokenExpiresAt: IsoDateTime;
  readonly user: UserProfileDto;
}

export interface RefreshRequestDto {
  readonly refreshToken: string;
}

export interface TokenPairDto {
  readonly accessToken: string;
  readonly tokenType: string;
  /** Segundos de vida del accessToken. */
  readonly expiresIn: number;
  readonly accessTokenExpiresAt: IsoDateTime;
  readonly refreshToken: string;
  /** 7 días (30 con "Recordarme"). Cada refresh lo renueva. */
  readonly refreshTokenExpiresAt: IsoDateTime;
}

export interface LogoutRequestDto {
  readonly refreshToken: string;
}

export interface ForgotPasswordRequestDto {
  /** Se normaliza a minúsculas y sin espacios. */
  readonly email: string;
}

export interface VerifyResetOtpRequestDto {
  /** Se normaliza a minúsculas y sin espacios. */
  readonly email: string;
  /** Código de 6 dígitos recibido por correo. */
  readonly code: string;
}

export interface ResetTokenResponseDto {
  /** Envíalo en POST /auth/password/reset. Un solo uso. */
  readonly resetToken: string;
  readonly expiresAt: IsoDateTime;
}

export interface ResetPasswordRequestDto {
  /** Token devuelto por POST /auth/password/verify-otp (un solo uso, vida corta). */
  readonly resetToken: string;
  /** Mínimo 8 caracteres, al menos una letra y un número. */
  readonly newPassword: string;
  readonly confirmPassword: string;
}

export interface ChangePasswordRequestDto {
  readonly currentPassword: string;
  /** Mínimo 8 caracteres, al menos una letra y un número. */
  readonly newPassword: string;
  readonly confirmPassword: string;
}

export const CONTACT_SUBJECT_VALUES = [
  'SCHOOL',
  'DESIGN_CONSULTING',
  'REGENERATIVE_TECH_HAWA',
  'SCHOLARSHIPS_CALLS',
  'OTHER',
] as const;
export type ContactSubject = (typeof CONTACT_SUBJECT_VALUES)[number];

/** Obligatorio si subject = DESIGN_CONSULTING (se ignora con otro asunto). */
export const CONTACT_PROJECT_TYPE_VALUES = [
  'HOUSEHOLD',
  'COMMERCIAL',
  'COLLECTIVE',
  'PRODUCTIVE',
  'OTHER',
] as const;
export type ContactProjectType = (typeof CONTACT_PROJECT_TYPE_VALUES)[number];

/** Servicio de interés (o NOT_SURE). Obligatorio si subject = DESIGN_CONSULTING. */
export const CONTACT_SERVICE_VALUES = [
  'WASTEWATER_TREATMENT_DESIGN',
  'RAINWATER_HARVESTING_DESIGN',
  'INFILTRATION_REHYDRATION_DESIGN',
  'WATER_RESILIENCE_DIAGNOSTICS',
  'TECHNOLOGY_IMPLEMENTATION_ADVICE',
  'NOT_SURE',
] as const;
export type ContactService = (typeof CONTACT_SERVICE_VALUES)[number];

/** Canal de origen (LANDING desde la landing HU-01). */
export const CONTACT_ORIGIN_VALUES = [
  'CONTACT_PAGE',
  'LANDING',
  'DESIGN_CONSULTING_PAGE',
  'REGENERATIVE_TECH_PAGE',
  'ABOUT_PAGE',
] as const;
export type ContactOrigin = (typeof CONTACT_ORIGIN_VALUES)[number];

export interface CreateContactMessageRequestDto {
  readonly name: string;
  readonly email: string;
  readonly organization?: string;
  /** Teléfono / WhatsApp con indicativo. */
  readonly phone?: PhoneDto;
  readonly subject: ContactSubject;
  /** Obligatorio si subject = DESIGN_CONSULTING (se ignora con otro asunto). */
  readonly projectType?: ContactProjectType;
  /** Ubicación del proyecto. Obligatorio si subject = DESIGN_CONSULTING. */
  readonly projectLocation?: string;
  /** Servicio de interés (o NOT_SURE). Obligatorio si subject = DESIGN_CONSULTING. */
  readonly service?: ContactService;
  readonly message: string;
  /** Debe ser true (política de datos aceptada). */
  readonly privacyAccepted: boolean;
  /** Canal de origen (LANDING desde la landing HU-01). */
  readonly origin: ContactOrigin;
  /** Honeypot: campo oculto que debe ir vacío o ausente. Si viene con texto el mensaje se descarta en silencio (la respuesta es igual a la de éxito). */
  readonly website?: string;
  /** Token de Cloudflare Turnstile. Obligatorio solo si el backend tiene el captcha activo. */
  readonly captchaToken?: string;
}

export const CONTACT_STATUS_VALUES = ['NEW'] as const;
export type ContactStatus = (typeof CONTACT_STATUS_VALUES)[number];

export interface ContactMessageResponseDto {
  readonly id: string;
  readonly status: ContactStatus;
  readonly createdAt: IsoDateTime;
}

export interface PaginationMetaDto {
  readonly page: number;
  readonly pageSize: number;
  /** Total de elementos que cumplen el filtro. */
  readonly total: number;
  readonly totalPages: number;
}

export interface PaginatedResponseDto {
  readonly meta: PaginationMetaDto;
}

export interface OfferDatesDto {
  /** Apertura de inscripciones (o de postulación en convocatorias). */
  readonly enrollmentOpensAt: IsoDateTime | null;
  /** Cierre de inscripciones (o de postulación). */
  readonly enrollmentClosesAt: IsoDateTime | null;
  readonly startsAt: IsoDateTime | null;
  readonly endsAt: IsoDateTime | null;
}

export interface SessionSlotDto {
  readonly startsAt: string;
  readonly endsAt: string;
}

export interface OfferScheduleDto {
  /** Zona de la regla (hora oficial CDMX). */
  readonly timezone: string;
  /** Días ISO: 1 = lunes … 7 = domingo. */
  readonly weekdays: number[];
  /** Hora de inicio en CDMX (HH:mm). */
  readonly startTime: string;
  /** Hora de fin en CDMX (HH:mm). */
  readonly endTime: string;
  /** Primera sesión según la regla, en UTC: sirve para mostrar "10:00 hora CDMX · 11:00 tu hora" con `Intl` (HU-11). null si la oferta no tiene fecha de inicio. */
  readonly firstSession: SessionSlotDto | null;
}

export interface OfferVenueSummaryDto {
  readonly name: string;
  readonly city: string | null;
}

export interface MoneyDto {
  /** Centavos enteros. */
  readonly amountCents: number;
  readonly currency: Currency;
}

export interface OfferInstallmentsDto {
  /** "Hasta N cuotas sin recargo" (HU-16 / HU-24). */
  readonly maxInstallments: number;
}

export interface OfferPricingDto {
  /** PAID: con costo; FREE: "Gratuito"; EXTERNAL_ENROLLMENT: origen Moodle ("Inscripción externa", sin precio). */
  readonly kind: PricingKind;
  /** Moneda del visitante. */
  readonly currency: Currency;
  /** PROFILE: país del perfil; TIMEZONE: zona del navegador (sin sesión); DEFAULT: sin datos (USD). */
  readonly currencySource: CurrencySource;
  /** Precio en `currency` (null si no es PAID o no hay precio en esa moneda). */
  readonly price: MoneyDto | null;
  /** Solo si la oferta permite cuotas. */
  readonly installments: OfferInstallmentsDto | null;
}

export interface ScholarshipBadgeDto {
  readonly minPercent: number;
  readonly maxPercent: number;
}

export interface OfferSummaryDto {
  readonly id: Uuid;
  /** Ruta /escuela/oferta/[slug]. */
  readonly slug: string;
  readonly name: string;
  readonly type: OfferType;
  readonly modality: OfferModality;
  readonly origin: OfferOrigin;
  /** Estado derivado de publicación y fechas. */
  readonly availability: OfferAvailability;
  /** Solo convocatorias: estado de la postulación. */
  readonly openCallStatus: WindowStatus | null;
  readonly summary: string;
  readonly coverImageUrl: string | null;
  readonly cohortLabel: string | null;
  readonly publicTopic: OfferTopic | null;
  readonly dates: OfferDatesDto;
  /** null si la oferta no tiene regla de horario. */
  readonly schedule: OfferScheduleDto | null;
  readonly totalHours: number | null;
  /** Solo presenciales. */
  readonly venue: OfferVenueSummaryDto | null;
  readonly pricing: OfferPricingDto;
  /** Badge "Beca 10%–80%": solo diplomados NAS con beca. */
  readonly scholarship: ScholarshipBadgeDto | null;
  readonly teacherNames: string[];
  /** Con sesión: inscripción activa → "Inscrito" y la tarjeta lleva al Aula (HU-17). */
  readonly enrolled: boolean;
}

export interface TopicLinkDto {
  readonly kind: TopicLinkKind;
  /** kind = OFFER: slug de la ficha. */
  readonly slug: string | null;
  /** kind = CATALOG: query string para /escuela/oferta. */
  readonly catalogQuery: string | null;
}

export interface TopicAvailabilityDto {
  readonly topic: OfferTopic;
  readonly group: TopicGroup;
  /** Texto literal del cliente. */
  readonly label: string;
  readonly availability: TopicAvailability;
  /** Ofertas vigentes (publicadas, no finalizadas). */
  readonly offerCount: number;
  readonly link: TopicLinkDto;
}

export interface TopicAvailabilityListDto {
  readonly data: TopicAvailabilityDto[];
}

export interface OfferDetailDatesDto {
  /** Apertura de inscripciones (o de postulación en convocatorias). */
  readonly enrollmentOpensAt: IsoDateTime | null;
  /** Cierre de inscripciones (o de postulación). */
  readonly enrollmentClosesAt: IsoDateTime | null;
  readonly startsAt: IsoDateTime | null;
  readonly endsAt: IsoDateTime | null;
  /** Proyecto final (diplomados). */
  readonly finalProjectDueAt: IsoDateTime | null;
}

export interface OfferVenueDto {
  readonly name: string;
  readonly city: string | null;
  readonly address: string | null;
  /** "Cómo llegar". */
  readonly mapsUrl: string | null;
}

export interface TeacherDto {
  readonly id: Uuid;
  readonly fullName: string;
  readonly photoUrl: string | null;
  readonly bio: string | null;
  /** "Ver CV". */
  readonly cvUrl: string | null;
}

export interface OfferModuleDto {
  /** Número de módulo (1..n) en el temario publicado. */
  readonly number: number;
  readonly title: string;
  readonly description: string | null;
}

export interface AmountRangeDto {
  readonly minAmountCents: number;
  readonly maxAmountCents: number;
  readonly currency: Currency;
}

export interface ScholarshipLevelDto {
  readonly level: ScholarshipLevel;
  readonly label: string;
  readonly minPercent: number;
  /** Igual a minPercent salvo en Beca especial (71–80). */
  readonly maxPercent: number;
  /** Más de 70%: entrevista por Zoom. */
  readonly requiresInterview: boolean;
  /** Monto estimado de la beca en la moneda del visitante. */
  readonly estimatedScholarship: AmountRangeDto | null;
  /** Saldo estimado a pagar ("el nivel final lo asigna el equipo"). */
  readonly estimatedBalance: AmountRangeDto | null;
}

export interface OfferScholarshipDto {
  readonly minPercent: number;
  readonly maxPercent: number;
  readonly interviewRequiredAbovePercent: number;
  /** Convocatoria de becas. */
  readonly windowStatus: WindowStatus;
  readonly opensAt: IsoDateTime | null;
  readonly closesAt: IsoDateTime | null;
  readonly levels: ScholarshipLevelDto[];
}

export interface EligibleCountryDto {
  readonly code: string;
  readonly name: string;
}

export interface OfferEligibilityDto {
  readonly text: string | null;
  /** Vacío = sin restricción de país. */
  readonly countries: EligibleCountryDto[];
  /** Requiere disponibilidad para viajar (asistencia presencial completa). */
  readonly requiresTravel: boolean;
}

export interface OfferCapacityDto {
  /** Cupo total (null = sin cupo). */
  readonly total: number | null;
  /** "Cupo agotado". */
  readonly soldOut: boolean;
}

export interface OfferViewerDto {
  readonly authenticated: boolean;
  /** "Ya estás inscrito". */
  readonly enrolled: boolean;
}

export interface OfferActionDto {
  readonly type: OfferActionType;
  readonly enabled: boolean;
  /** Botón principal (máximo uno). */
  readonly primary: boolean;
  /** Sin sesión: llevar a login/registro y regresar a la ficha con la acción. */
  readonly requiresLogin: boolean;
  /** Motivo si `enabled = false`. */
  readonly reason: OfferActionReason | null;
  /** Para *_NOT_OPEN_YET: cuándo se habilita. */
  readonly availableFrom: IsoDateTime | null;
}

export interface OfferDetailDto {
  readonly id: Uuid;
  /** Ruta /escuela/oferta/[slug]. */
  readonly slug: string;
  readonly name: string;
  readonly type: OfferType;
  readonly modality: OfferModality;
  readonly origin: OfferOrigin;
  /** Estado derivado de publicación y fechas. */
  readonly availability: OfferAvailability;
  /** Solo convocatorias: estado de la postulación. */
  readonly openCallStatus: WindowStatus | null;
  readonly summary: string;
  readonly coverImageUrl: string | null;
  readonly cohortLabel: string | null;
  readonly publicTopic: OfferTopic | null;
  readonly dates: OfferDetailDatesDto;
  /** null si la oferta no tiene regla de horario. */
  readonly schedule: OfferScheduleDto | null;
  readonly totalHours: number | null;
  /** Solo presenciales. */
  readonly venue: OfferVenueDto | null;
  readonly pricing: OfferPricingDto;
  /** Badge "Beca 10%–80%": solo diplomados NAS con beca. */
  readonly scholarship: ScholarshipBadgeDto | null;
  readonly teacherNames: string[];
  /** Con sesión: inscripción activa → "Inscrito" y la tarjeta lleva al Aula (HU-17). */
  readonly enrolled: boolean;
  readonly description: string;
  readonly learningOutcomes: string[];
  readonly requirements: string | null;
  /** Carrusel de imágenes (URLs). */
  readonly carouselImageUrls: string[];
  /** Sesiones programadas (sin canceladas). */
  readonly sessionCount: number;
  readonly calendarCategory: CalendarCategory;
  readonly teachers: TeacherDto[];
  /** Temario: solo módulos publicados. */
  readonly modules: OfferModuleDto[];
  /** Bloque de beca: solo diplomados NAS con beca. */
  readonly scholarshipDetails: OfferScholarshipDto | null;
  /** Requisitos de elegibilidad (convocatorias). */
  readonly eligibility: OfferEligibilityDto | null;
  readonly capacity: OfferCapacityDto;
  /** Moodle: enlace informativo al curso. */
  readonly moodleCourseUrl?: string | null;
  readonly viewer: OfferViewerDto;
  /** CTA calculados por el backend, en orden de jerarquía. */
  readonly actions: OfferActionDto[];
}

export interface PortalVenueDto {
  readonly name: string;
  readonly address: string | null;
  readonly city: string | null;
  /** "Cómo llegar". */
  readonly mapsUrl: string | null;
}

export interface FormationOfferDto {
  readonly id: Uuid;
  /** Para "Ver ficha". */
  readonly slug: string;
  readonly name: string;
  readonly type: OfferType;
  readonly modality: OfferModality;
  readonly coverImageUrl: string | null;
  readonly cohortLabel: string | null;
  readonly startsAt: IsoDateTime | null;
  readonly endsAt: IsoDateTime | null;
  /** Solo presenciales. */
  readonly venue: PortalVenueDto | null;
}

export interface ProgressDto {
  /** Sesiones con asistencia registrada. */
  readonly attendedSessions: number;
  /** Sesiones programadas (sin canceladas). */
  readonly scheduledSessions: number;
  /** Entero 0–100: asistidas ÷ programadas. */
  readonly percent: number;
}

export interface NextSessionRefDto {
  readonly id: Uuid;
  /** UTC; muestra tu hora + CDMX. */
  readonly startsAt: string;
  readonly endsAt: string;
}

export interface FormationCardDto {
  readonly enrollmentId: Uuid;
  readonly status: EnrollmentStatus;
  /** Pestaña: Activos / Completados (completada si la oferta ya terminó). */
  readonly phase: FormationPhase;
  /** `MOODLE` → badge "Vía Moodle". */
  readonly origin: OfferOrigin;
  /** [Continuar] habilitado (acceso al Aula). `false` si está suspendida. */
  readonly canContinue: boolean;
  readonly offer: FormationOfferDto;
  readonly progress: ProgressDto;
  readonly nextSession: NextSessionRefDto | null;
  /** Sin próxima sesión: `FINISHED` ("Finalizado") o `NO_UPCOMING_SESSIONS`. */
  readonly scheduleStatus: ScheduleStatus;
  readonly enrolledAt: string;
}

export interface CreateEnrollmentRequestDto {
  /** Id de la oferta (`id` del catálogo/ficha). */
  readonly offerId: Uuid;
}

export interface NotificationActionDto {
  readonly label: string;
  /** Ruta RELATIVA del frontend (los correos usan FRONTEND_URL + path). */
  readonly path: string;
}

export interface NotificationDto {
  readonly id: Uuid;
  readonly type: NotificationType;
  /** Ícono / grupo. */
  readonly category: NotificationCategory;
  readonly priority: NotificationPriority;
  /** Fijada al inicio del panel (prioridad alta sin regularizar: cobro fallido, mora). */
  readonly pinned: boolean;
  readonly title: string;
  readonly body: string;
  readonly action: NotificationActionDto | null;
  /** Ids relacionados para armar rutas propias. */
  readonly data: {
    readonly [key: string]: unknown;
  } | null;
  readonly read: boolean;
  readonly readAt: IsoDateTime | null;
  readonly createdAt: string;
}

export interface UnreadCountDto {
  /** No leídas (contador de la campana). */
  readonly unread: number;
  /** Fijadas (prioridad alta sin regularizar). */
  readonly pinned: number;
}

export interface MarkAllReadResponseDto {
  /** Notificaciones marcadas como leídas. */
  readonly updated: number;
}

export interface PortalOfferRefDto {
  readonly id: Uuid;
  /** Para "Ver ficha". */
  readonly slug: string;
  readonly name: string;
  readonly type: OfferType;
  readonly modality: OfferModality;
}

export interface SessionModuleRefDto {
  readonly id: Uuid;
  /** "Módulo N". */
  readonly number: number;
  readonly title: string;
}

export interface SessionJoinDto {
  /** `OPEN` → [Entrar a sesión] con `url`; `NOT_YET` → deshabilitado hasta `opensAt` (cuenta regresiva; vuelve a pedir la sesión al llegar); `LINK_PENDING` "Enlace aún no disponible"; `CANCELLED` "Cancelada"; `ENDED`; `IN_PERSON` (sin enlace). */
  readonly state: SessionJoinState;
  /** Inicio − 10 min (BUSINESS_RULES.SESSION_JOIN_WINDOW_MINUTES_BEFORE). */
  readonly opensAt: IsoDateTime;
  /** join_url (Zoom/Meet) SOLO con `state = OPEN`. Nunca el enlace de anfitrión. */
  readonly url: string | null;
}

export interface SessionRecordingDto {
  /** `AVAILABLE` [Ver grabación]; `AFTER_SESSION` "Disponible después de la sesión"; `PENDING` "Grabación pendiente"; `NOT_APPLICABLE` sin grabación. */
  readonly state: RecordingState;
  /** Enlace externo. */
  readonly url: string | null;
}

export interface SessionAttendanceDto {
  /** Pendiente / Registrada / No registrada (`NOT_APPLICABLE` en canceladas). */
  readonly status: AttendanceStatus;
  /** Ventana de registro: abre al terminar la sesión y dura N h (24 h por defecto). */
  readonly windowState: AttendanceWindowState;
  /** Fin de la sesión. */
  readonly opensAt: IsoDateTime;
  /** "Puedes registrar hasta el …" / "Cierra en 21 h 35 min". */
  readonly closesAt: IsoDateTime;
  /** Duración de la ventana (sesión ?? oferta). */
  readonly windowHours: number;
  /** Habilita [Registrar asistencia]. */
  readonly canRegister: boolean;
  /** "Asistencia registrada el …". */
  readonly registeredAt: IsoDateTime | null;
  /** `MANUAL` = la marcó el equipo (p. ej. pase de lista en sitio). */
  readonly source: AttendanceSource | null;
  readonly comment: string | null;
}

export interface SessionCardDto {
  readonly id: Uuid;
  readonly offer: PortalOfferRefDto;
  readonly module: SessionModuleRefDto | null;
  /** Docente(s) del módulo o de la oferta. */
  readonly teacherNames: string[];
  readonly startsAt: IsoDateTime;
  readonly endsAt: IsoDateTime;
  /** Hora oficial de referencia (CDMX). */
  readonly timezone: string;
  readonly status: SessionStatus;
  readonly category: CalendarCategory;
  /** Si fue reprogramada: inicio original (HU-29). */
  readonly originalStartsAt: IsoDateTime | null;
  /** Motivo de reprogramación/cancelación. */
  readonly changeReason: string | null;
  /** Plataforma (ícono), deducida del enlace aunque aún no se entregue. */
  readonly platform: SessionPlatform | null;
  /** Presencial: lugar. */
  readonly venue: PortalVenueDto | null;
  readonly join: SessionJoinDto;
  readonly recording: SessionRecordingDto;
  readonly attendance: SessionAttendanceDto;
}

export interface RegisterAttendanceRequestDto {
  /** Checkbox "Asistí a la sesión" (obligatorio, debe ser `true`). */
  readonly attended: boolean;
  /** "¿Qué te llevas de esta sesión?" (opcional, máx. 500). */
  readonly comment?: string;
}

export interface AttendanceResultDto {
  /** Sesión con `attendance.status = REGISTERED`. */
  readonly session: SessionCardDto;
  /** Progreso recalculado del Aula. */
  readonly progress: ProgressDto;
}

export interface ClassroomEnrollmentDto {
  readonly id: Uuid;
  readonly status: EnrollmentStatus;
  readonly phase: FormationPhase;
  /** `MOODLE` → "Vía Moodle". */
  readonly origin: OfferOrigin;
  readonly enrolledAt: IsoDateTime;
}

export interface ClassroomTeacherDto {
  readonly fullName: string;
  readonly photoUrl: string | null;
}

export interface ClassroomOfferDto {
  readonly id: Uuid;
  /** Para "Ver ficha". */
  readonly slug: string;
  readonly name: string;
  readonly type: OfferType;
  readonly modality: OfferModality;
  readonly coverImageUrl: string | null;
  readonly cohortLabel: string | null;
  readonly startsAt: IsoDateTime | null;
  readonly endsAt: IsoDateTime | null;
  readonly totalHours: number | null;
  /** Presencial: "Cómo llegar". */
  readonly venue: PortalVenueDto | null;
  readonly teachers: ClassroomTeacherDto[];
}

export interface WhatsappGroupDto {
  /** [Unirme al grupo de WhatsApp] (pestaña nueva). */
  readonly available: boolean;
  /** Solo inscritos y desde la fecha que definió el equipo. */
  readonly url: string | null;
  /** Configurado pero aún no visible: "Disponible a partir del …". */
  readonly availableFrom: IsoDateTime | null;
}

export interface ClassroomWelcomeDto {
  /** `true` antes de la primera sesión → bloque "Antes de empezar" destacado; después, bloque secundario "Grupo de WhatsApp". */
  readonly preStart: boolean;
  readonly message: string | null;
  readonly firstSessionStartsAt: IsoDateTime | null;
  readonly whatsapp: WhatsappGroupDto;
}

export interface ModuleResourceCountsDto {
  readonly presentation: number;
  readonly preReadings: number;
  readonly activities: number;
  /** Grabaciones ya cargadas. */
  readonly recordings: number;
}

export interface ClassroomModuleDto {
  readonly id: Uuid;
  /** "Módulo N" (orden del temario). */
  readonly number: number;
  readonly title: string;
  readonly description: string | null;
  /** Próximo / En curso / Completado. */
  readonly status: ModuleStatus;
  readonly teacherNames: string[];
  readonly resourceCounts: ModuleResourceCountsDto;
}

export interface FinalProjectSubmissionDto {
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly submittedAt: IsoDateTime;
}

export interface FinalProjectDto {
  /** Fecha de presentación/entrega. */
  readonly dueAt: IsoDateTime | null;
  readonly guidelines: string | null;
  /** `DISABLED`: solo presentación en vivo (sin carga); `OPEN`: se puede subir/reemplazar; `CLOSED`: pasó la fecha límite (solo lectura). */
  readonly submissionState: SubmissionState;
  /** PDF, DOCX, PPTX o ZIP. */
  readonly acceptedMimeTypes: string[];
  /** 20 MB. */
  readonly maxBytes: number;
  readonly submission: FinalProjectSubmissionDto | null;
}

export interface ClassroomDto {
  readonly enrollment: ClassroomEnrollmentDto;
  readonly offer: ClassroomOfferDto;
  /** Sesiones con asistencia ÷ programadas. */
  readonly progress: ProgressDto;
  readonly welcome: ClassroomWelcomeDto;
  /** Próxima sesión (en curso o futura, no cancelada); null si no hay. */
  readonly nextSession: SessionCardDto | null;
  /** Módulos publicados, en orden. */
  readonly modules: ClassroomModuleDto[];
  /** Solo diplomados (en cursos y talleres es null y la sección no aparece). */
  readonly finalProject: FinalProjectDto | null;
}

export interface MaterialResourceDto {
  readonly id: Uuid;
  readonly type: MaterialResourceType;
  readonly title: string;
  readonly description: string | null;
  /** `FILE` → [Descargar]: pide la URL temporal a `…/resources/{id}/access`. `EXTERNAL_LINK` → [Ver] abre `url` en pestaña nueva. */
  readonly kind: ResourceKind | null;
  /** Solo enlaces externos. */
  readonly url: string | null;
  readonly fileName: string | null;
  readonly mimeType: string | null;
  readonly sizeBytes: number | null;
  /** Actividades: fecha (aparece en el calendario como "Fecha importante"). */
  readonly activityDueAt: IsoDateTime | null;
}

export interface MaterialRecordingDto {
  readonly sessionId: Uuid;
  /** "Ver grabación" con fecha. */
  readonly startsAt: IsoDateTime;
  readonly endsAt: IsoDateTime;
  readonly state: RecordingState;
  readonly url: string | null;
}

export interface MaterialModuleDto {
  readonly id: Uuid;
  readonly number: number;
  readonly title: string;
  readonly description: string | null;
  readonly status: ModuleStatus;
  readonly teacherNames: string[];
  /** 1. Presentación del módulo (la más reciente). */
  readonly presentation: MaterialResourceDto | null;
  /** 2. Lecturas previas. */
  readonly preReadings: MaterialResourceDto[];
  /** 3. Actividades. */
  readonly activities: MaterialResourceDto[];
  /** 4. Grabación de la sesión: una por sesión del módulo (sin canceladas). */
  readonly recordings: MaterialRecordingDto[];
}

export interface MaterialsDto {
  readonly modules: MaterialModuleDto[];
}

export interface AccessUrlDto {
  readonly kind: ResourceKind;
  readonly url: string;
  /** Vencimiento de la URL firmada (null para enlaces externos). Al vencer, pide otra. */
  readonly expiresAt: IsoDateTime | null;
  readonly fileName: string | null;
}

export interface FinalProjectUploadRequestDto {
  readonly fileName: string;
  /** Content-Type exacto que enviarás en el PUT. */
  readonly contentType: FinalProjectContentType;
  /** Tamaño en bytes (máx. 20 MB). */
  readonly sizeBytes: number;
}

export interface UploadUrlDto {
  readonly uploadUrl: string;
  readonly method: 'PUT';
  /** Headers obligatorios del PUT. */
  readonly headers: Record<string, unknown>;
  /** Envíala a `PUT …/final-project` para confirmar la entrega. */
  readonly key: string;
  readonly expiresAt: IsoDateTime;
}

export interface ConfirmFinalProjectRequestDto {
  readonly key: string;
  /** Nombre a mostrar. */
  readonly fileName?: string;
}

export interface CalendarLinkDto {
  /** `CLASSROOM` → Aula (`offerId`); `OFFER` → ficha `/escuela/oferta/{slug}`. */
  readonly kind: CalendarLinkKind;
  readonly offerId: Uuid | null;
  readonly slug: string | null;
}

export interface CalendarItemDto {
  readonly id: Uuid;
  /** `SESSION` = clase generada desde el horario (no editable); `EVENT` = evento manual o fecha importante; `ACTIVITY` = fecha de una actividad de módulo (HU-08, "Fecha importante"). */
  readonly source: CalendarItemSource;
  /** Tipo: SESSION, ACTIVITY_DUE, MANUAL (webinar/encuentro) o fecha importante automática (ENROLLMENT_OPENS, ENROLLMENT_CLOSES, OFFER_STARTS, SCHOLARSHIP_DEADLINE, FINAL_PROJECT). */
  readonly kind: CalendarItemKind;
  readonly title: string;
  readonly description: string | null;
  /** Color: Formación azul, Territorio verde, Comunidad naranja, Eventos morado, Fechas importantes rojo. */
  readonly category: CalendarCategory;
  readonly startsAt: string;
  readonly endsAt: IsoDateTime | null;
  /** Evento de día completo (fechas importantes). */
  readonly allDay: boolean;
  readonly timezone: string;
  /** `CANCELLED` → "Cancelada", sin enlace. */
  readonly status: SessionStatus;
  readonly offer: PortalOfferRefDto | null;
  readonly module: SessionModuleRefDto | null;
  /** Presencial (hora local del lugar). */
  readonly venue: PortalVenueDto | null;
  /** Lugar libre de eventos manuales. */
  readonly location: string | null;
  /** Acceso (HU-12) si la actividad es en línea; null en fechas importantes. */
  readonly join: SessionJoinDto | null;
  readonly link: CalendarLinkDto;
}

export interface CalendarResponseDto {
  readonly data: CalendarItemDto[];
}

export interface LibraryOfferRefDto {
  readonly id: Uuid;
  readonly slug: string;
  readonly name: string;
}

export interface LibraryItemDto {
  readonly id: Uuid;
  readonly title: string;
  readonly description: string | null;
  readonly type: LibraryItemType;
  readonly author: string | null;
  readonly keywords: string[];
  readonly thumbnailUrl: string | null;
  /** `OFFER_ENROLLED` = exclusivo de un curso (solo lo ves si estás inscrito). */
  readonly audience: LibraryAudience;
  readonly offer: LibraryOfferRefDto | null;
  /** Ábrelo con `GET /library/{id}/access` (archivo: URL temporal; externo: pestaña nueva). */
  readonly kind: ResourceKind | null;
  readonly fileName: string | null;
  readonly sizeBytes: number | null;
  /** Material recomendado (Dashboard). */
  readonly featured: boolean;
}

export interface DashboardFormationsDto {
  /** Máximo 3 (configurable). */
  readonly items: FormationCardDto[];
  /** Total de formaciones activas ("Ver toda mi formación"). */
  readonly total: number;
}

export interface DashboardDto {
  /** "Próxima actividad": la siguiente sesión o evento (en curso o futuro, no cancelado, sin fechas importantes) en los próximos 62 días, con `join` (HU-12). null → mensaje orientador. */
  readonly nextActivity: CalendarItemDto | null;
  readonly formations: DashboardFormationsDto | null;
  /** Widget Calendario: próximos eventos (30 días, máx. 5) con color de categoría. */
  readonly upcomingEvents: CalendarItemDto[] | null;
  /** Widget Biblioteca: material recomendado (máx. 4). */
  readonly recommendedResources: LibraryItemDto[] | null;
  readonly notifications: UnreadCountDto | null;
  /** Bloques que no se pudieron cargar: muestra "No se pudo cargar esta información" + reintento (el reintento puede usar el endpoint propio del bloque: /me/enrollments, /me/calendar, /library, /me/notifications/unread-count). */
  readonly failedBlocks: DashboardBlock[];
}
