// ⚠️ Archivo generado por tools/generate-api-models.mjs a partir de
// docs/api/openapi.json (Escuela Itinerante del Agua — API). No editar a mano:
// regenerar con `node tools/generate-api-models.mjs`.
/* eslint-disable */

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
  readonly code:
    | 'VALIDATION_ERROR'
    | 'BAD_REQUEST'
    | 'UNAUTHORIZED'
    | 'FORBIDDEN'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'PAYLOAD_TOO_LARGE'
    | 'BUSINESS_RULE_VIOLATION'
    | 'RATE_LIMITED'
    | 'INTERNAL_ERROR'
    | 'SERVICE_UNAVAILABLE'
    | 'AUTH_EMAIL_ALREADY_REGISTERED'
    | 'AUTH_USERNAME_TAKEN'
    | 'AUTH_INVALID_CREDENTIALS'
    | 'AUTH_EMAIL_NOT_VERIFIED'
    | 'AUTH_ACCOUNT_DISABLED'
    | 'AUTH_LOGIN_LOCKED'
    | 'AUTH_ACCOUNT_NOT_FOUND'
    | 'AUTH_ALREADY_VERIFIED'
    | 'AUTH_OTP_INVALID'
    | 'AUTH_OTP_EXPIRED'
    | 'AUTH_OTP_LOCKED'
    | 'AUTH_OTP_COOLDOWN'
    | 'AUTH_REFRESH_INVALID'
    | 'AUTH_RESET_TOKEN_INVALID'
    | 'AUTH_CURRENT_PASSWORD_INVALID'
    | 'CONTACT_CAPTCHA_FAILED'
    | 'OFFER_NOT_AVAILABLE'
    | 'ENROLLMENT_REQUIRED'
    | 'ENROLLMENT_SUSPENDED'
    | 'ENROLLMENT_ALREADY_EXISTS'
    | 'ENROLLMENT_NOT_FREE'
    | 'ENROLLMENT_CLOSED'
    | 'OFFER_SOLD_OUT'
    | 'SESSION_CANCELLED'
    | 'ATTENDANCE_NOT_OPEN_YET'
    | 'ATTENDANCE_WINDOW_CLOSED'
    | 'ATTENDANCE_ALREADY_REGISTERED'
    | 'RESOURCE_FILE_UNAVAILABLE'
    | 'FINAL_PROJECT_NOT_AVAILABLE'
    | 'FINAL_PROJECT_DEADLINE_PASSED'
    | 'FINAL_PROJECT_INVALID_FILE'
    | 'FINAL_PROJECT_UPLOAD_NOT_FOUND';
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
  readonly currency: 'MXN' | 'USD';
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

export type Role =
  | 'PARTICIPANT'
  | 'SUPER_ADMIN'
  | 'ACADEMIC_COORDINATOR'
  | 'REVIEW_COMMITTEE'
  | 'REVIEW_DECIDER'
  | 'FOLLOW_UP'
  | 'FINANCE';

export type UserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'DISABLED';

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
  readonly currency: 'MXN' | 'USD';
  readonly roles: Role[];
  readonly status: UserStatus;
  readonly emailVerifiedAt: string | null;
  readonly lastLoginAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
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
  readonly expiresAt: string;
  /** Desde cuándo se puede pedir otro código ("Reenviar en 00:30"). */
  readonly resendAvailableAt: string;
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
export type OtpPurpose = 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';

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
  readonly accessTokenExpiresAt: string;
  readonly refreshToken: string;
  /** 7 días (30 con "Recordarme"). Cada refresh lo renueva. */
  readonly refreshTokenExpiresAt: string;
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
  readonly accessTokenExpiresAt: string;
  readonly refreshToken: string;
  /** 7 días (30 con "Recordarme"). Cada refresh lo renueva. */
  readonly refreshTokenExpiresAt: string;
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
  readonly expiresAt: string;
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

export type ContactSubject =
  'SCHOOL' | 'DESIGN_CONSULTING' | 'REGENERATIVE_TECH_HAWA' | 'SCHOLARSHIPS_CALLS' | 'OTHER';

/** Obligatorio si subject = DESIGN_CONSULTING (se ignora con otro asunto). */
export type ContactProjectType = 'HOUSEHOLD' | 'COMMERCIAL' | 'COLLECTIVE' | 'PRODUCTIVE' | 'OTHER';

/** Servicio de interés (o NOT_SURE). Obligatorio si subject = DESIGN_CONSULTING. */
export type ContactService =
  | 'WASTEWATER_TREATMENT_DESIGN'
  | 'RAINWATER_HARVESTING_DESIGN'
  | 'INFILTRATION_REHYDRATION_DESIGN'
  | 'WATER_RESILIENCE_DIAGNOSTICS'
  | 'TECHNOLOGY_IMPLEMENTATION_ADVICE'
  | 'NOT_SURE';

/** Canal de origen (LANDING desde la landing HU-01). */
export type ContactOrigin =
  'CONTACT_PAGE' | 'LANDING' | 'DESIGN_CONSULTING_PAGE' | 'REGENERATIVE_TECH_PAGE' | 'ABOUT_PAGE';

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

export type ContactStatus = 'NEW';

export interface ContactMessageResponseDto {
  readonly id: string;
  readonly status: ContactStatus;
  readonly createdAt: string;
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
  readonly enrollmentOpensAt: string | null;
  /** Cierre de inscripciones (o de postulación). */
  readonly enrollmentClosesAt: string | null;
  readonly startsAt: string | null;
  readonly endsAt: string | null;
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
  readonly currency: 'MXN' | 'USD';
}

export interface OfferInstallmentsDto {
  /** "Hasta N cuotas sin recargo" (HU-16 / HU-24). */
  readonly maxInstallments: number;
}

export interface OfferPricingDto {
  /** PAID: con costo; FREE: "Gratuito"; EXTERNAL_ENROLLMENT: origen Moodle ("Inscripción externa", sin precio). */
  readonly kind: 'PAID' | 'FREE' | 'EXTERNAL_ENROLLMENT';
  /** Moneda del visitante. */
  readonly currency: 'MXN' | 'USD';
  /** PROFILE: país del perfil; TIMEZONE: zona del navegador (sin sesión); DEFAULT: sin datos (USD). */
  readonly currencySource: 'PROFILE' | 'TIMEZONE' | 'DEFAULT';
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
  readonly id: string;
  /** Ruta /escuela/oferta/[slug]. */
  readonly slug: string;
  readonly name: string;
  readonly type: 'DIPLOMA' | 'COURSE' | 'WORKSHOP' | 'EVENT' | 'OPEN_CALL';
  readonly modality: 'ONLINE_LIVE' | 'IN_PERSON';
  readonly origin: 'NAS' | 'MOODLE';
  /** Estado derivado de publicación y fechas. */
  readonly availability: 'ENROLLMENT_OPEN' | 'UPCOMING' | 'ENROLLMENT_CLOSED' | 'FINISHED';
  /** Solo convocatorias: estado de la postulación. */
  readonly openCallStatus: 'OPEN' | 'UPCOMING' | 'CLOSED' | null;
  readonly summary: string;
  readonly coverImageUrl: string | null;
  readonly cohortLabel: string | null;
  readonly publicTopic:
    | 'ECOTECH_WATER_DIPLOMA'
    | 'ECOPEDAGOGIES_DIPLOMA'
    | 'WATER_APPRENTICES_SCHOOL'
    | 'WATER_TREATMENT_SYSTEMS_INTRO'
    | 'CONSTRUCTED_WETLANDS'
    | 'DRY_TOILETS'
    | 'WATER_HARVESTING'
    | 'TRAVELING_WATER_LABS'
    | 'TERRITORIAL_PRACTICES'
    | 'FIELD_VISITS'
    | null;
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
  readonly kind: 'OFFER' | 'CATALOG' | 'NONE';
  /** kind = OFFER: slug de la ficha. */
  readonly slug: string | null;
  /** kind = CATALOG: query string para /escuela/oferta. */
  readonly catalogQuery: string | null;
}

export interface TopicAvailabilityDto {
  readonly topic:
    | 'ECOTECH_WATER_DIPLOMA'
    | 'ECOPEDAGOGIES_DIPLOMA'
    | 'WATER_APPRENTICES_SCHOOL'
    | 'WATER_TREATMENT_SYSTEMS_INTRO'
    | 'CONSTRUCTED_WETLANDS'
    | 'DRY_TOILETS'
    | 'WATER_HARVESTING'
    | 'TRAVELING_WATER_LABS'
    | 'TERRITORIAL_PRACTICES'
    | 'FIELD_VISITS';
  readonly group: 'SPECIALIZED_TRAINING' | 'ONLINE_COURSES_WORKSHOPS' | 'HANDS_ON_LEARNING';
  /** Texto literal del cliente. */
  readonly label: string;
  readonly availability:
    'ENROLLMENT_OPEN' | 'UPCOMING' | 'ENROLLMENT_CLOSED' | 'OPEN_CALL' | 'NO_SCHEDULED_DATES';
  /** Ofertas vigentes (publicadas, no finalizadas). */
  readonly offerCount: number;
  readonly link: TopicLinkDto;
}

export interface TopicAvailabilityListDto {
  readonly data: TopicAvailabilityDto[];
}

export interface OfferDetailDatesDto {
  /** Apertura de inscripciones (o de postulación en convocatorias). */
  readonly enrollmentOpensAt: string | null;
  /** Cierre de inscripciones (o de postulación). */
  readonly enrollmentClosesAt: string | null;
  readonly startsAt: string | null;
  readonly endsAt: string | null;
  /** Proyecto final (diplomados). */
  readonly finalProjectDueAt: string | null;
}

export interface OfferVenueDto {
  readonly name: string;
  readonly city: string | null;
  readonly address: string | null;
  /** "Cómo llegar". */
  readonly mapsUrl: string | null;
}

export interface TeacherDto {
  readonly id: string;
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
  readonly currency: 'MXN' | 'USD';
}

export interface ScholarshipLevelDto {
  readonly level: 'AGUA_VIVA' | 'RIOS_VIVOS' | 'AGUAS_LIBRES' | 'CENOTES_VIVOS' | 'SPECIAL';
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
  readonly windowStatus: 'OPEN' | 'UPCOMING' | 'CLOSED';
  readonly opensAt: string | null;
  readonly closesAt: string | null;
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
  readonly type:
    | 'ENROLL_AND_PAY'
    | 'PAY_IN_INSTALLMENTS'
    | 'ENROLL_FREE'
    | 'APPLY_SCHOLARSHIP'
    | 'APPLY_OPEN_CALL'
    | 'ACTIVATE_MOODLE_ACCESS'
    | 'GO_TO_CLASSROOM';
  readonly enabled: boolean;
  /** Botón principal (máximo uno). */
  readonly primary: boolean;
  /** Sin sesión: llevar a login/registro y regresar a la ficha con la acción. */
  readonly requiresLogin: boolean;
  /** Motivo si `enabled = false`. */
  readonly reason:
    | 'ENROLLMENT_NOT_OPEN_YET'
    | 'ENROLLMENT_CLOSED'
    | 'OFFER_FINISHED'
    | 'SOLD_OUT'
    | 'SCHOLARSHIP_NOT_OPEN_YET'
    | 'SCHOLARSHIP_CLOSED'
    | 'PRICE_NOT_AVAILABLE'
    | null;
  /** Para *_NOT_OPEN_YET: cuándo se habilita. */
  readonly availableFrom: string | null;
}

export interface OfferDetailDto {
  readonly id: string;
  /** Ruta /escuela/oferta/[slug]. */
  readonly slug: string;
  readonly name: string;
  readonly type: 'DIPLOMA' | 'COURSE' | 'WORKSHOP' | 'EVENT' | 'OPEN_CALL';
  readonly modality: 'ONLINE_LIVE' | 'IN_PERSON';
  readonly origin: 'NAS' | 'MOODLE';
  /** Estado derivado de publicación y fechas. */
  readonly availability: 'ENROLLMENT_OPEN' | 'UPCOMING' | 'ENROLLMENT_CLOSED' | 'FINISHED';
  /** Solo convocatorias: estado de la postulación. */
  readonly openCallStatus: 'OPEN' | 'UPCOMING' | 'CLOSED' | null;
  readonly summary: string;
  readonly coverImageUrl: string | null;
  readonly cohortLabel: string | null;
  readonly publicTopic:
    | 'ECOTECH_WATER_DIPLOMA'
    | 'ECOPEDAGOGIES_DIPLOMA'
    | 'WATER_APPRENTICES_SCHOOL'
    | 'WATER_TREATMENT_SYSTEMS_INTRO'
    | 'CONSTRUCTED_WETLANDS'
    | 'DRY_TOILETS'
    | 'WATER_HARVESTING'
    | 'TRAVELING_WATER_LABS'
    | 'TERRITORIAL_PRACTICES'
    | 'FIELD_VISITS'
    | null;
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
  readonly calendarCategory: 'TRAINING' | 'TERRITORY' | 'COMMUNITY' | 'EVENTS' | 'IMPORTANT_DATES';
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
  readonly id: string;
  /** Para "Ver ficha". */
  readonly slug: string;
  readonly name: string;
  readonly type: 'DIPLOMA' | 'COURSE' | 'WORKSHOP' | 'EVENT' | 'OPEN_CALL';
  readonly modality: 'ONLINE_LIVE' | 'IN_PERSON';
  readonly coverImageUrl: string | null;
  readonly cohortLabel: string | null;
  readonly startsAt: string | null;
  readonly endsAt: string | null;
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
  readonly id: string;
  /** UTC; muestra tu hora + CDMX. */
  readonly startsAt: string;
  readonly endsAt: string;
}

export interface FormationCardDto {
  readonly enrollmentId: string;
  readonly status: 'PENDING_PAYMENT' | 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'CANCELLED';
  /** Pestaña: Activos / Completados (completada si la oferta ya terminó). */
  readonly phase: 'ACTIVE' | 'COMPLETED';
  /** `MOODLE` → badge "Vía Moodle". */
  readonly origin: 'NAS' | 'MOODLE';
  /** [Continuar] habilitado (acceso al Aula). `false` si está suspendida. */
  readonly canContinue: boolean;
  readonly offer: FormationOfferDto;
  readonly progress: ProgressDto;
  readonly nextSession: NextSessionRefDto | null;
  /** Sin próxima sesión: `FINISHED` ("Finalizado") o `NO_UPCOMING_SESSIONS`. */
  readonly scheduleStatus: 'HAS_NEXT_SESSION' | 'NO_UPCOMING_SESSIONS' | 'FINISHED';
  readonly enrolledAt: string;
}

export interface CreateEnrollmentRequestDto {
  /** Id de la oferta (`id` del catálogo/ficha). */
  readonly offerId: string;
}

export interface NotificationActionDto {
  readonly label: string;
  /** Ruta RELATIVA del frontend (los correos usan FRONTEND_URL + path). */
  readonly path: string;
}

export interface NotificationDto {
  readonly id: string;
  readonly type:
    | 'ENROLLMENT_CONFIRMED'
    | 'ATTENDANCE_OPEN'
    | 'WHATSAPP_GROUP_AVAILABLE'
    | 'MATERIAL_PUBLISHED'
    | 'RECORDING_PUBLISHED'
    | 'SESSION_RESCHEDULED'
    | 'SESSION_CANCELLED'
    | 'MOODLE_ENROLLMENT_LINKED'
    | 'APPLICATION_SUBMITTED'
    | 'APPLICATION_STATUS_CHANGED'
    | 'INTERVIEW_SCHEDULED'
    | 'INTERVIEW_REMINDER'
    | 'SCHOLARSHIP_APPROVED'
    | 'APPLICATION_EXPIRED'
    | 'PAYMENT_CONFIRMED'
    | 'BALANCE_DUE_REMINDER'
    | 'INSTALLMENT_UPCOMING'
    | 'INSTALLMENT_PAID'
    | 'INSTALLMENT_FAILED'
    | 'PLAN_DELINQUENT'
    | 'TRANSFER_VALIDATED'
    | 'TRANSFER_REJECTED'
    | 'GENERAL';
  /** Ícono / grupo. */
  readonly category: 'TRAINING' | 'APPLICATIONS' | 'PAYMENTS' | 'GENERAL';
  readonly priority: 'NORMAL' | 'HIGH';
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
  readonly readAt: string | null;
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
  readonly id: string;
  /** Para "Ver ficha". */
  readonly slug: string;
  readonly name: string;
  readonly type: 'DIPLOMA' | 'COURSE' | 'WORKSHOP' | 'EVENT' | 'OPEN_CALL';
  readonly modality: 'ONLINE_LIVE' | 'IN_PERSON';
}

export interface SessionModuleRefDto {
  readonly id: string;
  /** "Módulo N". */
  readonly number: number;
  readonly title: string;
}

export interface SessionJoinDto {
  /** `OPEN` → [Entrar a sesión] con `url`; `NOT_YET` → deshabilitado hasta `opensAt` (cuenta regresiva; vuelve a pedir la sesión al llegar); `LINK_PENDING` "Enlace aún no disponible"; `CANCELLED` "Cancelada"; `ENDED`; `IN_PERSON` (sin enlace). */
  readonly state: 'NOT_YET' | 'OPEN' | 'LINK_PENDING' | 'ENDED' | 'CANCELLED' | 'IN_PERSON';
  /** Inicio − 10 min (BUSINESS_RULES.SESSION_JOIN_WINDOW_MINUTES_BEFORE). */
  readonly opensAt: string;
  /** join_url (Zoom/Meet) SOLO con `state = OPEN`. Nunca el enlace de anfitrión. */
  readonly url: string | null;
}

export interface SessionRecordingDto {
  /** `AVAILABLE` [Ver grabación]; `AFTER_SESSION` "Disponible después de la sesión"; `PENDING` "Grabación pendiente"; `NOT_APPLICABLE` sin grabación. */
  readonly state: 'AVAILABLE' | 'AFTER_SESSION' | 'PENDING' | 'NOT_APPLICABLE';
  /** Enlace externo. */
  readonly url: string | null;
}

export interface SessionAttendanceDto {
  /** Pendiente / Registrada / No registrada (`NOT_APPLICABLE` en canceladas). */
  readonly status: 'PENDING' | 'REGISTERED' | 'NOT_REGISTERED' | 'NOT_APPLICABLE';
  /** Ventana de registro: abre al terminar la sesión y dura N h (24 h por defecto). */
  readonly windowState: 'NOT_OPEN_YET' | 'OPEN' | 'CLOSED' | 'NOT_APPLICABLE';
  /** Fin de la sesión. */
  readonly opensAt: string;
  /** "Puedes registrar hasta el …" / "Cierra en 21 h 35 min". */
  readonly closesAt: string;
  /** Duración de la ventana (sesión ?? oferta). */
  readonly windowHours: number;
  /** Habilita [Registrar asistencia]. */
  readonly canRegister: boolean;
  /** "Asistencia registrada el …". */
  readonly registeredAt: string | null;
  /** `MANUAL` = la marcó el equipo (p. ej. pase de lista en sitio). */
  readonly source: 'PARTICIPANT' | 'MANUAL' | null;
  readonly comment: string | null;
}

export interface SessionCardDto {
  readonly id: string;
  readonly offer: PortalOfferRefDto;
  readonly module: SessionModuleRefDto | null;
  /** Docente(s) del módulo o de la oferta. */
  readonly teacherNames: string[];
  readonly startsAt: string;
  readonly endsAt: string;
  /** Hora oficial de referencia (CDMX). */
  readonly timezone: string;
  readonly status: 'SCHEDULED' | 'CANCELLED';
  readonly category: 'TRAINING' | 'TERRITORY' | 'COMMUNITY' | 'EVENTS' | 'IMPORTANT_DATES';
  /** Si fue reprogramada: inicio original (HU-29). */
  readonly originalStartsAt: string | null;
  /** Motivo de reprogramación/cancelación. */
  readonly changeReason: string | null;
  /** Plataforma (ícono), deducida del enlace aunque aún no se entregue. */
  readonly platform: 'ZOOM' | 'GOOGLE_MEET' | 'OTHER' | null;
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
  readonly id: string;
  readonly status: 'PENDING_PAYMENT' | 'ACTIVE' | 'COMPLETED' | 'SUSPENDED' | 'CANCELLED';
  readonly phase: 'ACTIVE' | 'COMPLETED';
  /** `MOODLE` → "Vía Moodle". */
  readonly origin: 'NAS' | 'MOODLE';
  readonly enrolledAt: string;
}

export interface ClassroomTeacherDto {
  readonly fullName: string;
  readonly photoUrl: string | null;
}

export interface ClassroomOfferDto {
  readonly id: string;
  /** Para "Ver ficha". */
  readonly slug: string;
  readonly name: string;
  readonly type: 'DIPLOMA' | 'COURSE' | 'WORKSHOP' | 'EVENT' | 'OPEN_CALL';
  readonly modality: 'ONLINE_LIVE' | 'IN_PERSON';
  readonly coverImageUrl: string | null;
  readonly cohortLabel: string | null;
  readonly startsAt: string | null;
  readonly endsAt: string | null;
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
  readonly availableFrom: string | null;
}

export interface ClassroomWelcomeDto {
  /** `true` antes de la primera sesión → bloque "Antes de empezar" destacado; después, bloque secundario "Grupo de WhatsApp". */
  readonly preStart: boolean;
  readonly message: string | null;
  readonly firstSessionStartsAt: string | null;
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
  readonly id: string;
  /** "Módulo N" (orden del temario). */
  readonly number: number;
  readonly title: string;
  readonly description: string | null;
  /** Próximo / En curso / Completado. */
  readonly status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
  readonly teacherNames: string[];
  readonly resourceCounts: ModuleResourceCountsDto;
}

export interface FinalProjectSubmissionDto {
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly submittedAt: string;
}

export interface FinalProjectDto {
  /** Fecha de presentación/entrega. */
  readonly dueAt: string | null;
  readonly guidelines: string | null;
  /** `DISABLED`: solo presentación en vivo (sin carga); `OPEN`: se puede subir/reemplazar; `CLOSED`: pasó la fecha límite (solo lectura). */
  readonly submissionState: 'DISABLED' | 'OPEN' | 'CLOSED';
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
  readonly id: string;
  readonly type: 'PRESENTATION' | 'PRE_READING' | 'ACTIVITY';
  readonly title: string;
  readonly description: string | null;
  /** `FILE` → [Descargar]: pide la URL temporal a `…/resources/{id}/access`. `EXTERNAL_LINK` → [Ver] abre `url` en pestaña nueva. */
  readonly kind: 'FILE' | 'EXTERNAL_LINK' | null;
  /** Solo enlaces externos. */
  readonly url: string | null;
  readonly fileName: string | null;
  readonly mimeType: string | null;
  readonly sizeBytes: number | null;
  /** Actividades: fecha (aparece en el calendario como "Fecha importante"). */
  readonly activityDueAt: string | null;
}

export interface MaterialRecordingDto {
  readonly sessionId: string;
  /** "Ver grabación" con fecha. */
  readonly startsAt: string;
  readonly endsAt: string;
  readonly state: 'AVAILABLE' | 'AFTER_SESSION' | 'PENDING' | 'NOT_APPLICABLE';
  readonly url: string | null;
}

export interface MaterialModuleDto {
  readonly id: string;
  readonly number: number;
  readonly title: string;
  readonly description: string | null;
  readonly status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED';
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
  readonly kind: 'FILE' | 'EXTERNAL_LINK';
  readonly url: string;
  /** Vencimiento de la URL firmada (null para enlaces externos). Al vencer, pide otra. */
  readonly expiresAt: string | null;
  readonly fileName: string | null;
}

export interface FinalProjectUploadRequestDto {
  readonly fileName: string;
  /** Content-Type exacto que enviarás en el PUT. */
  readonly contentType:
    | 'application/pdf'
    | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    | 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    | 'application/zip';
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
  readonly expiresAt: string;
}

export interface ConfirmFinalProjectRequestDto {
  readonly key: string;
  /** Nombre a mostrar. */
  readonly fileName?: string;
}

export interface CalendarLinkDto {
  /** `CLASSROOM` → Aula (`offerId`); `OFFER` → ficha `/escuela/oferta/{slug}`. */
  readonly kind: 'CLASSROOM' | 'OFFER' | 'NONE';
  readonly offerId: string | null;
  readonly slug: string | null;
}

export interface CalendarItemDto {
  readonly id: string;
  /** `SESSION` = clase generada desde el horario (no editable); `EVENT` = evento manual o fecha importante; `ACTIVITY` = fecha de una actividad de módulo (HU-08, "Fecha importante"). */
  readonly source: 'SESSION' | 'EVENT' | 'ACTIVITY';
  /** Tipo: SESSION, ACTIVITY_DUE, MANUAL (webinar/encuentro) o fecha importante automática (ENROLLMENT_OPENS, ENROLLMENT_CLOSES, OFFER_STARTS, SCHOLARSHIP_DEADLINE, FINAL_PROJECT). */
  readonly kind:
    | 'SESSION'
    | 'ACTIVITY_DUE'
    | 'MANUAL'
    | 'ENROLLMENT_OPENS'
    | 'ENROLLMENT_CLOSES'
    | 'OFFER_STARTS'
    | 'SCHOLARSHIP_DEADLINE'
    | 'FINAL_PROJECT';
  readonly title: string;
  readonly description: string | null;
  /** Color: Formación azul, Territorio verde, Comunidad naranja, Eventos morado, Fechas importantes rojo. */
  readonly category: 'TRAINING' | 'TERRITORY' | 'COMMUNITY' | 'EVENTS' | 'IMPORTANT_DATES';
  readonly startsAt: string;
  readonly endsAt: string | null;
  /** Evento de día completo (fechas importantes). */
  readonly allDay: boolean;
  readonly timezone: string;
  /** `CANCELLED` → "Cancelada", sin enlace. */
  readonly status: 'SCHEDULED' | 'CANCELLED';
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
  readonly id: string;
  readonly slug: string;
  readonly name: string;
}

export interface LibraryItemDto {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly type: 'PDF' | 'ARTICLE' | 'BOOK' | 'VIDEO' | 'AUDIO' | 'EXTERNAL' | 'COURSE_MATERIAL';
  readonly author: string | null;
  readonly keywords: string[];
  readonly thumbnailUrl: string | null;
  /** `OFFER_ENROLLED` = exclusivo de un curso (solo lo ves si estás inscrito). */
  readonly audience: 'ALL_REGISTERED' | 'OFFER_ENROLLED';
  readonly offer: LibraryOfferRefDto | null;
  /** Ábrelo con `GET /library/{id}/access` (archivo: URL temporal; externo: pestaña nueva). */
  readonly kind: 'FILE' | 'EXTERNAL_LINK' | null;
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
  readonly failedBlocks: (
    'nextActivity' | 'formations' | 'upcomingEvents' | 'recommendedResources' | 'notifications'
  )[];
}
