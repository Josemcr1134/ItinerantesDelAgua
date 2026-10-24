// ⚠️ Archivo generado por tools/generate-api-models.mjs a partir de
// docs/api/openapi.json (Escuela Itinerante del Agua — API 0.1.0).
// DTO, enums y alias de la API. No editar a mano: regenerar con `npm run api:models`.
/* eslint-disable */

/** Fecha y hora ISO 8601 (p. ej. `2026-03-01T15:00:00.000Z`). */
export type IsoDateTime = string;

/** Identificador UUID. */
export type Uuid = string;

export const ACTOR_TYPE_VALUES = ['PARTICIPANT', 'STAFF', 'SYSTEM'] as const;
export type ActorType = (typeof ACTOR_TYPE_VALUES)[number];

export const ADMIN_CALENDAR_ITEM_KIND_VALUES = [
  'SESSION',
  'MANUAL',
  'ENROLLMENT_OPENS',
  'ENROLLMENT_CLOSES',
  'OFFER_STARTS',
  'SCHOLARSHIP_DEADLINE',
  'FINAL_PROJECT',
] as const;
export type AdminCalendarItemKind = (typeof ADMIN_CALENDAR_ITEM_KIND_VALUES)[number];

export const ADMIN_CALENDAR_SOURCE_VALUES = ['SESSION', 'EVENT'] as const;
export type AdminCalendarSource = (typeof ADMIN_CALENDAR_SOURCE_VALUES)[number];

export const ADMIN_OFFER_SORT_VALUES = ['UPDATED_DESC', 'STARTS_AT_ASC', 'NAME_ASC'] as const;
export type AdminOfferSort = (typeof ADMIN_OFFER_SORT_VALUES)[number];

export const ADMIN_OFFER_STATUS_VALUES = [
  'DRAFT',
  'PUBLISHED',
  'ENROLLMENT_CLOSED',
  'FINISHED',
  'ARCHIVED',
] as const;
export type AdminOfferStatus = (typeof ADMIN_OFFER_STATUS_VALUES)[number];

export const ADMIN_SESSION_STATE_VALUES = [
  'SCHEDULED',
  'REGISTRATION_OPEN',
  'CLOSED',
  'CANCELLED',
] as const;
export type AdminSessionState = (typeof ADMIN_SESSION_STATE_VALUES)[number];

export const ADMIN_USER_SORT_VALUES = ['NAME_ASC', 'CREATED_DESC', 'LAST_LOGIN_DESC'] as const;
export type AdminUserSort = (typeof ADMIN_USER_SORT_VALUES)[number];

export const APPLICATION_ACTION_REASON_VALUES = [
  'WINDOW_CLOSED',
  'INTERVIEW_NOT_OPEN_YET',
  'INTERVIEW_LINK_PENDING',
  'INTERVIEW_ENDED',
  'TRANSFER_PENDING_VALIDATION',
] as const;
export type ApplicationActionReason = (typeof APPLICATION_ACTION_REASON_VALUES)[number];

export const APPLICATION_ACTION_TYPE_VALUES = [
  'CONTINUE_DRAFT',
  'JOIN_INTERVIEW',
  'PAY_BALANCE',
  'CONTINUE_PAYMENT',
  'UPLOAD_TRANSFER_PROOF',
  'PAYMENT_IN_VALIDATION',
  'CONFIRM_PARTICIPATION',
  'GO_TO_CLASSROOM',
  'VIEW',
] as const;
export type ApplicationActionType = (typeof APPLICATION_ACTION_TYPE_VALUES)[number];

export const APPLICATION_DECISION_VALUES = ['APPROVE', 'REJECT'] as const;
export type ApplicationDecision = (typeof APPLICATION_DECISION_VALUES)[number];

export const APPLICATION_FIELD_ISSUE_CODE_VALUES = [
  'REQUIRED',
  'MIN_LENGTH',
  'MAX_LENGTH',
  'MIN_FILES',
  'MUST_ACCEPT',
  'SCHOLARSHIP_TYPE_NOT_ENABLED',
  'SCHOLARSHIP_TYPE_FULL',
  'NOT_APPLICABLE',
] as const;
export type ApplicationFieldIssueCode = (typeof APPLICATION_FIELD_ISSUE_CODE_VALUES)[number];

export const APPLICATION_INELIGIBILITY_REASON_VALUES = [
  'COUNTRY_NOT_ELIGIBLE',
  'TRAVEL_REQUIRED',
] as const;
export type ApplicationIneligibilityReason =
  (typeof APPLICATION_INELIGIBILITY_REASON_VALUES)[number];

export const APPLICATION_KIND_VALUES = ['SCHOLARSHIP', 'OPEN_CALL'] as const;
export type ApplicationKind = (typeof APPLICATION_KIND_VALUES)[number];

export const APPLICATION_SORT_VALUES = ['SUBMITTED_ASC', 'SUBMITTED_DESC', 'DUE_ASC'] as const;
export type ApplicationSort = (typeof APPLICATION_SORT_VALUES)[number];

export const APPLICATION_STATUS_VALUES = [
  'DRAFT',
  'SUBMITTED',
  'IN_REVIEW',
  'INTERVIEW_SCHEDULED',
  'APPROVED_PENDING_PAYMENT',
  'APPROVED_PENDING_CONFIRMATION',
  'ENROLLED',
  'NOT_SELECTED',
  'EXPIRED',
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUS_VALUES)[number];

export const APPLICATION_TIMELINE_STEP_VALUES = [
  'SUBMITTED',
  'IN_REVIEW',
  'INTERVIEW',
  'RESULT',
  'PAYMENT',
  'CONFIRMATION',
  'ENROLLED',
] as const;
export type ApplicationTimelineStep = (typeof APPLICATION_TIMELINE_STEP_VALUES)[number];

export const ATTENDANCE_SOURCE_VALUES = ['PARTICIPANT', 'MANUAL'] as const;
export type AttendanceSource = (typeof ATTENDANCE_SOURCE_VALUES)[number];

export const ATTENDANCE_STATUS_VALUES = [
  'PENDING',
  'REGISTERED',
  'NOT_REGISTERED',
  'NOT_APPLICABLE',
] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUS_VALUES)[number];

export const CALENDAR_CATEGORY_VALUES = [
  'TRAINING',
  'TERRITORY',
  'COMMUNITY',
  'EVENTS',
  'IMPORTANT_DATES',
] as const;
export type CalendarCategory = (typeof CALENDAR_CATEGORY_VALUES)[number];

export const CALENDAR_EVENT_KIND_VALUES = [
  'MANUAL',
  'ENROLLMENT_OPENS',
  'ENROLLMENT_CLOSES',
  'OFFER_STARTS',
  'SCHOLARSHIP_DEADLINE',
  'FINAL_PROJECT',
] as const;
export type CalendarEventKind = (typeof CALENDAR_EVENT_KIND_VALUES)[number];

export const CALENDAR_ITEM_KIND_VALUES = [
  'SESSION',
  'ACTIVITY_DUE',
  'INTERVIEW',
  'MANUAL',
  'ENROLLMENT_OPENS',
  'ENROLLMENT_CLOSES',
  'OFFER_STARTS',
  'SCHOLARSHIP_DEADLINE',
  'FINAL_PROJECT',
] as const;
export type CalendarItemKind = (typeof CALENDAR_ITEM_KIND_VALUES)[number];

export const CALENDAR_ITEM_SOURCE_VALUES = ['SESSION', 'EVENT', 'ACTIVITY', 'APPLICATION'] as const;
export type CalendarItemSource = (typeof CALENDAR_ITEM_SOURCE_VALUES)[number];

export const CALENDAR_LINK_KIND_VALUES = ['CLASSROOM', 'OFFER', 'APPLICATION', 'NONE'] as const;
export type CalendarLinkKind = (typeof CALENDAR_LINK_KIND_VALUES)[number];

export const CALENDAR_SORT_VALUES = ['STARTS_AT_ASC', 'STARTS_AT_DESC'] as const;
export type CalendarSort = (typeof CALENDAR_SORT_VALUES)[number];

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
  'scholarships',
  'openCalls',
  'payments',
] as const;
export type DashboardBlock = (typeof DASHBOARD_BLOCK_VALUES)[number];

export const EMAIL_STATUS_VALUES = ['NOT_REQUESTED', 'PENDING', 'SENT', 'FAILED'] as const;
export type EmailStatus = (typeof EMAIL_STATUS_VALUES)[number];

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
  'APPLICATION_NOT_ALLOWED',
  'APPLICATION_WINDOW_CLOSED',
  'APPLICATION_ALREADY_EXISTS',
  'APPLICATION_NOT_EDITABLE',
  'APPLICATION_INCOMPLETE',
  'APPLICATION_NOT_ELIGIBLE',
  'APPLICATION_INVALID_FILE',
  'APPLICATION_TOO_MANY_FILES',
  'APPLICATION_UPLOAD_NOT_FOUND',
  'APPLICATION_INVALID_TRANSITION',
  'APPLICATION_DEADLINE_PASSED',
  'APPLICATION_INTERVIEW_REQUIRED',
  'PAYMENTS_NOT_CONFIGURED',
  'PAYMENT_PROVIDER_ERROR',
  'PAYMENT_NOT_ALLOWED',
  'PAYMENT_BALANCE_NOT_DUE',
  'PAYMENT_INSTALLMENTS_NOT_AVAILABLE',
  'PAYMENT_TRANSFER_NOT_AVAILABLE',
  'PAYMENT_TRANSFER_PENDING',
  'PAYMENT_TRANSFER_INVALID_FILE',
  'PAYMENT_TRANSFER_UPLOAD_NOT_FOUND',
  'PAYMENT_TRANSFER_AMOUNT_MISMATCH',
  'PAYMENT_INVALID_STATE',
  'PAYMENT_CHARGE_FAILED',
  'PAYMENT_RECEIPT_NOT_AVAILABLE',
  'PAYMENT_WEBHOOK_SIGNATURE_INVALID',
  'MOODLE_CODE_INVALID',
  'MOODLE_CODE_USED',
  'MOODLE_CODE_EXPIRED',
  'OFFER_NAME_TAKEN',
  'OFFER_INCOMPLETE',
  'OFFER_HAS_ENROLLMENTS',
  'OFFER_INVALID_STATE',
  'OFFER_NOT_MOODLE',
  'TEACHER_IN_USE',
  'ADMIN_UPLOAD_INVALID_FILE',
  'ADMIN_UPLOAD_NOT_FOUND',
  'SESSION_GENERATION_BLOCKED',
  'SESSION_CONFLICT',
  'SESSION_HAS_ATTENDANCE',
  'ATTENDANCE_NOT_ENROLLED',
  'APPLICATION_INVALID_STATE',
  'NOTIFICATION_EMAIL_NOT_FAILED',
  'FOLLOW_UP_REMINDER_TOO_SOON',
  'FOLLOW_UP_PHONE_INVALID',
  'PAYMENT_PLAN_INVALID_STATE',
  'PAYMENT_REFUND_INVALID',
  'SCHOLARSHIP_TYPE_KEY_TAKEN',
  'SCHOLARSHIP_TYPE_IN_USE',
  'SCHOLARSHIP_TYPE_INVALID_RANGE',
  'SCHOLARSHIP_TYPE_FULL',
  'SCHOLARSHIP_TYPE_NOT_AVAILABLE',
  'ADMIN_LAST_SUPER_ADMIN',
  'ADMIN_SELF_ACTION',
] as const;
export type ErrorCode = (typeof ERROR_CODE_VALUES)[number];

export const EVALUATION_RECOMMENDATION_VALUES = ['APPROVE', 'NOT_SELECT', 'UNSURE'] as const;
export type EvaluationRecommendation = (typeof EVALUATION_RECOMMENDATION_VALUES)[number];

export const EVIDENCE_CONTENT_TYPE_VALUES = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'video/mp4',
  'video/quicktime',
] as const;
export type EvidenceContentType = (typeof EVIDENCE_CONTENT_TYPE_VALUES)[number];

export const EVIDENCE_MEDIA_TYPE_VALUES = ['IMAGE', 'VIDEO'] as const;
export type EvidenceMediaType = (typeof EVIDENCE_MEDIA_TYPE_VALUES)[number];

export const FINAL_PROJECT_CONTENT_TYPE_VALUES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
] as const;
export type FinalProjectContentType = (typeof FINAL_PROJECT_CONTENT_TYPE_VALUES)[number];

export const FOLLOW_UP_NOTE_KIND_VALUES = ['NOTE', 'REMINDER_SENT', 'WHATSAPP_CONTACT'] as const;
export type FollowUpNoteKind = (typeof FOLLOW_UP_NOTE_KIND_VALUES)[number];

export const FOLLOW_UP_OUTCOME_VALUES = [
  'NO_RESPONSE',
  'WILL_PAY_SOON',
  'REQUESTS_INSTALLMENTS',
  'WITHDRAWS',
] as const;
export type FollowUpOutcome = (typeof FOLLOW_UP_OUTCOME_VALUES)[number];

export const FOLLOW_UP_TAB_VALUES = ['PENDING', 'EXPIRED'] as const;
export type FollowUpTab = (typeof FOLLOW_UP_TAB_VALUES)[number];

export const FOLLOW_UP_TIMELINE_KIND_VALUES = [
  'STATUS_CHANGE',
  'NOTE',
  'REMINDER_SENT',
  'WHATSAPP_CONTACT',
  'PAYMENT',
] as const;
export type FollowUpTimelineKind = (typeof FOLLOW_UP_TIMELINE_KIND_VALUES)[number];

export const FORMATION_PHASE_VALUES = ['ACTIVE', 'COMPLETED'] as const;
export type FormationPhase = (typeof FORMATION_PHASE_VALUES)[number];

export const FORMATION_PHASE_FILTER_VALUES = ['ACTIVE', 'COMPLETED', 'ALL'] as const;
export type FormationPhaseFilter = (typeof FORMATION_PHASE_FILTER_VALUES)[number];

export const FUNNEL_STAGE_VALUES = ['APPLIED', 'APPROVED', 'PAYMENT_STARTED', 'ENROLLED'] as const;
export type FunnelStage = (typeof FUNNEL_STAGE_VALUES)[number];

export const IMAGE_CONTENT_TYPE_VALUES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type ImageContentType = (typeof IMAGE_CONTENT_TYPE_VALUES)[number];

export const IMAGE_UPLOAD_PURPOSE_VALUES = [
  'OFFER_COVER',
  'OFFER_CAROUSEL',
  'TEACHER_PHOTO',
] as const;
export type ImageUploadPurpose = (typeof IMAGE_UPLOAD_PURPOSE_VALUES)[number];

export const IMPORTANT_DATE_KIND_VALUES = [
  'ENROLLMENT_OPENS',
  'ENROLLMENT_CLOSES',
  'OFFER_STARTS',
  'SCHOLARSHIP_DEADLINE',
  'FINAL_PROJECT',
] as const;
export type ImportantDateKind = (typeof IMPORTANT_DATE_KIND_VALUES)[number];

export const INSTALLMENT_STATUS_VALUES = [
  'SCHEDULED',
  'PROCESSING',
  'PAID',
  'FAILED',
  'CANCELLED',
] as const;
export type InstallmentStatus = (typeof INSTALLMENT_STATUS_VALUES)[number];

export const INTERVIEW_OUTCOME_VALUES = ['COMPLETED', 'NO_SHOW'] as const;
export type InterviewOutcome = (typeof INTERVIEW_OUTCOME_VALUES)[number];

export const INTERVIEW_STATUS_VALUES = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const;
export type InterviewStatus = (typeof INTERVIEW_STATUS_VALUES)[number];

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
  'TRANSFER_PENDING_VALIDATION',
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
  'VIEW_APPLICATION',
  'PAY_BALANCE',
  'CONTINUE_PAYMENT',
  'PAYMENT_IN_VALIDATION',
  'REGULARIZE_PAYMENT',
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

export const PAYMENT_ALERT_TYPE_VALUES = [
  'INSTALLMENT_FAILED',
  'PLAN_DELINQUENT',
  'TRANSFER_REJECTED',
  'TRANSFER_PENDING',
  'INSTALLMENT_UPCOMING',
] as const;
export type PaymentAlertType = (typeof PAYMENT_ALERT_TYPE_VALUES)[number];

export const PAYMENT_CONCEPT_VALUES = ['FULL_PRICE', 'BALANCE', 'INSTALLMENT'] as const;
export type PaymentConcept = (typeof PAYMENT_CONCEPT_VALUES)[number];

export const PAYMENT_METHOD_VALUES = ['CARD', 'BANK_TRANSFER'] as const;
export type PaymentMethod = (typeof PAYMENT_METHOD_VALUES)[number];

export const PAYMENT_PLAN_ACTION_VALUES = [
  'RETRY',
  'MARK_DELINQUENT',
  'SUSPEND_ACCESS',
  'RESTORE_ACCESS',
  'CANCEL',
] as const;
export type PaymentPlanAction = (typeof PAYMENT_PLAN_ACTION_VALUES)[number];

export const PAYMENT_PLAN_SORT_VALUES = ['FAILED_SINCE_ASC', 'CREATED_DESC'] as const;
export type PaymentPlanSort = (typeof PAYMENT_PLAN_SORT_VALUES)[number];

export const PAYMENT_PLAN_STATUS_VALUES = [
  'PENDING_ACTIVATION',
  'CURRENT',
  'PAST_DUE',
  'DELINQUENT',
  'COMPLETED',
  'CANCELLED',
] as const;
export type PaymentPlanStatus = (typeof PAYMENT_PLAN_STATUS_VALUES)[number];

export const PAYMENT_SORT_VALUES = [
  'CREATED_DESC',
  'CREATED_ASC',
  'PAID_DESC',
  'AMOUNT_DESC',
] as const;
export type PaymentSort = (typeof PAYMENT_SORT_VALUES)[number];

export const PAYMENT_STATUS_VALUES = [
  'PENDING',
  'PAID',
  'FAILED',
  'CANCELLED',
  'REFUNDED',
  'PENDING_VALIDATION',
  'VALIDATED',
  'REJECTED',
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUS_VALUES)[number];

export const PERMISSION_VALUES = [
  'admin.access',
  'offers.read',
  'offers.write',
  'offers.publish',
  'attendance.read',
  'attendance.write',
  'applications.read',
  'applications.evaluate',
  'applications.interview',
  'applications.decide',
  'followup.read',
  'followup.manage',
  'payments.read',
  'payments.manage',
  'users.manage',
  'audit.read',
  'site.write',
  'scholarship_types.write',
] as const;
export type Permission = (typeof PERMISSION_VALUES)[number];

export const PLAN_CONCEPT_VALUES = ['FULL_PRICE', 'BALANCE'] as const;
export type PlanConcept = (typeof PLAN_CONCEPT_VALUES)[number];

export const PRICING_KIND_VALUES = ['PAID', 'FREE', 'EXTERNAL_ENROLLMENT'] as const;
export type PricingKind = (typeof PRICING_KIND_VALUES)[number];

export const PUBLICATION_STATUS_VALUES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;
export type PublicationStatus = (typeof PUBLICATION_STATUS_VALUES)[number];

export const RECORDING_STATE_VALUES = [
  'AVAILABLE',
  'AFTER_SESSION',
  'PENDING',
  'NOT_APPLICABLE',
] as const;
export type RecordingState = (typeof RECORDING_STATE_VALUES)[number];

export const REFUND_STATUS_VALUES = ['PENDING', 'SUCCEEDED', 'FAILED'] as const;
export type RefundStatus = (typeof REFUND_STATUS_VALUES)[number];

export const RESOURCE_KIND_VALUES = ['FILE', 'EXTERNAL_LINK'] as const;
export type ResourceKind = (typeof RESOURCE_KIND_VALUES)[number];

export const RESOURCE_SOURCE_VALUES = ['FILE', 'URL', 'LIBRARY', 'NONE'] as const;
export type ResourceSource = (typeof RESOURCE_SOURCE_VALUES)[number];

export const RESPONSE_DEADLINE_KIND_VALUES = ['PAYMENT', 'CONFIRMATION'] as const;
export type ResponseDeadlineKind = (typeof RESPONSE_DEADLINE_KIND_VALUES)[number];

export const SCHEDULE_STATUS_VALUES = [
  'HAS_NEXT_SESSION',
  'NO_UPCOMING_SESSIONS',
  'FINISHED',
] as const;
export type ScheduleStatus = (typeof SCHEDULE_STATUS_VALUES)[number];

export const SESSION_EXCLUSION_REASON_VALUES = ['MANUAL', 'MX_HOLIDAY'] as const;
export type SessionExclusionReason = (typeof SESSION_EXCLUSION_REASON_VALUES)[number];

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

export const SESSION_PREVIEW_STATUS_VALUES = ['NEW', 'EXCLUDED', 'CONFLICT'] as const;
export type SessionPreviewStatus = (typeof SESSION_PREVIEW_STATUS_VALUES)[number];

export const SESSION_SCOPE_VALUES = ['UPCOMING', 'PAST'] as const;
export type SessionScope = (typeof SESSION_SCOPE_VALUES)[number];

export const SESSION_STATUS_VALUES = ['SCHEDULED', 'CANCELLED'] as const;
export type SessionStatus = (typeof SESSION_STATUS_VALUES)[number];

export const SUBMISSION_STATE_VALUES = ['DISABLED', 'OPEN', 'CLOSED'] as const;
export type SubmissionState = (typeof SUBMISSION_STATE_VALUES)[number];

export const SUBMITTED_APPLICATION_STATUS_VALUES = [
  'SUBMITTED',
  'IN_REVIEW',
  'INTERVIEW_SCHEDULED',
  'APPROVED_PENDING_PAYMENT',
  'APPROVED_PENDING_CONFIRMATION',
  'ENROLLED',
  'NOT_SELECTED',
  'EXPIRED',
] as const;
export type SubmittedApplicationStatus = (typeof SUBMITTED_APPLICATION_STATUS_VALUES)[number];

export const TIMELINE_STEP_STATE_VALUES = [
  'DONE',
  'CURRENT',
  'UPCOMING',
  'SKIPPED',
  'FAILED',
] as const;
export type TimelineStepState = (typeof TIMELINE_STEP_STATE_VALUES)[number];

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

export const TRANSFER_PROOF_CONTENT_TYPE_VALUES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const;
export type TransferProofContentType = (typeof TRANSFER_PROOF_CONTENT_TYPE_VALUES)[number];

export const TRANSFER_REJECTION_REASON_VALUES = [
  'ILLEGIBLE',
  'AMOUNT_MISMATCH',
  'NOT_FOUND',
  'OTHER',
] as const;
export type TransferRejectionReason = (typeof TRANSFER_REJECTION_REASON_VALUES)[number];

export const TRANSFER_STATUS_VALUES = [
  'PENDING_VALIDATION',
  'VALIDATED',
  'REJECTED',
  'REFUNDED',
] as const;
export type TransferStatus = (typeof TRANSFER_STATUS_VALUES)[number];

export const VISIBILITY_VALUES = ['HIDDEN', 'PUBLISHED'] as const;
export type Visibility = (typeof VISIBILITY_VALUES)[number];

export const WINDOW_STATUS_VALUES = ['OPEN', 'UPCOMING', 'CLOSED'] as const;
export type WindowStatus = (typeof WINDOW_STATUS_VALUES)[number];

export const WIZARD_ISSUE_CODE_VALUES = [
  'REQUIRED',
  'MIN_LENGTH',
  'MAX_LENGTH',
  'INVALID',
  'NOT_APPLICABLE',
  'COURSE_MAX_HOURS_EXCEEDED',
  'DIPLOMA_HOURS_MISMATCH',
] as const;
export type WizardIssueCode = (typeof WIZARD_ISSUE_CODE_VALUES)[number];

export const WIZARD_STEP_VALUES = [
  'GENERAL',
  'CONTENT',
  'SCHEDULE',
  'ORIGIN_PRICING',
  'RESOURCES',
  'ATTENDANCE',
  'WHATSAPP',
] as const;
export type WizardStep = (typeof WIZARD_STEP_VALUES)[number];

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

export interface AdminMeUserDto {
  readonly id: Uuid;
  readonly email: string;
  readonly fullName: string;
}

export interface AdminMeDto {
  readonly user: AdminMeUserDto;
  readonly roles: Role[];
  /** Permisos efectivos (unión de los roles). El frontend muestra u oculta secciones y botones con esto; la API valida igual en cada endpoint (403 `FORBIDDEN`). */
  readonly permissions: Permission[];
}

export interface RoleDefinitionDto {
  readonly role: Role;
  readonly label: string;
  readonly permissions: Permission[];
}

export interface RolesCatalogDto {
  readonly data: RoleDefinitionDto[];
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

export interface AdminUserDto {
  readonly id: Uuid;
  readonly fullName: string;
  readonly email: string;
  readonly username: string;
  readonly roles: Role[];
  readonly permissions: Permission[];
  readonly status: UserStatus;
  readonly countryCode: string;
  readonly lastLoginAt: string | null;
  readonly createdAt: string;
}

export interface UpdateUserRolesRequestDto {
  /** Roles del equipo que tendrá la cuenta (reemplaza los actuales). `PARTICIPANT` se conserva siempre. Lista vacía = quitar todos los roles del equipo. */
  readonly roles: Role[];
}

export interface UserStatusChangeRequestDto {
  readonly reason?: string;
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

export interface MoodleLinkResultDto {
  /** false → "No encontramos una inscripción asociada a tu correo": ofrece código de acceso o contacto con la Escuela (correo y WhatsApp). */
  readonly found: boolean;
  /** Formaciones vinculadas AHORA (banner de éxito descartable). Las ya vinculadas antes no se repiten; aparecen en Mi formación con `origin = MOODLE` ("Vía Moodle"). */
  readonly linked: FormationCardDto[];
}

export interface RedeemMoodleCodeRequestDto {
  /** Código XXXX-XXXX que entregó el equipo (mayúsculas/espacios y guion opcionales). */
  readonly code: string;
}

export interface MoodleUserRefDto {
  readonly id: Uuid;
  readonly fullName: string;
  readonly email: string;
}

export interface RosterEntryDto {
  readonly id: Uuid;
  readonly email: string;
  /** Ya tiene cuenta y quedó inscrita ("Vía Moodle"). */
  readonly linked: boolean;
  readonly linkedUser: MoodleUserRefDto | null;
  readonly linkedAt: string | null;
  readonly createdAt: string;
}

export interface ImportRosterRequestDto {
  /** Contenido de un CSV (columna `email`/`correo`, o la primera celda con @ de cada fila) o texto con un correo por línea. Envía `csv` O `emails`. */
  readonly csv?: string;
  readonly emails?: string[];
}

export interface RosterImportResultDto {
  /** Correos nuevos agregados. */
  readonly added: number;
  /** Repetidos (en el archivo o ya cargados). */
  readonly duplicates: number;
  /** Valores que no son correos. */
  readonly invalid: string[];
  /** Personas ya registradas que quedaron vinculadas al cargar. */
  readonly linkedUsers: number;
}

export interface AccessCodeDto {
  readonly id: Uuid;
  /** Últimos 4 caracteres (el código completo solo se ve al generarlo). */
  readonly hint: string;
  readonly expiresAt: string | null;
  readonly used: boolean;
  readonly usedBy: MoodleUserRefDto | null;
  readonly usedAt: string | null;
  readonly createdAt: string;
}

export interface GenerateCodesRequestDto {
  readonly count: number;
}

export interface GeneratedCodesDto {
  /** Códigos en claro: se muestran UNA sola vez (solo se guarda el hash). Cópialos o descárgalos. */
  readonly codes: string[];
  /** Vencen al fin de la cohorte. */
  readonly expiresAt: string | null;
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

export interface SiteMetricDto {
  /** Clave estable. Iniciales: WATER_LITERS_REVITALIZED, PEOPLE_TRAINED, TERRITORIES_ACCOMPANIED, YOUTH_TRAINED. */
  readonly key: string;
  readonly label: string;
  /** Número crudo (el frontend lo formatea/anima). */
  readonly value: number;
  /** Texto antes del número (p. ej. "+"). */
  readonly prefix: string;
  /** Texto después del número (p. ej. "+" o " L"). */
  readonly suffix: string;
  /** Listo para mostrar: prefijo + número con separador de miles + sufijo. */
  readonly display: string;
  readonly sortOrder: number;
}

export interface SiteMetricsResponseDto {
  /** Solo las visibles, ordenadas por sortOrder. */
  readonly data: SiteMetricDto[];
  readonly updatedAt: string | null;
}

export interface AdminSiteMetricDto {
  /** Clave estable. Iniciales: WATER_LITERS_REVITALIZED, PEOPLE_TRAINED, TERRITORIES_ACCOMPANIED, YOUTH_TRAINED. */
  readonly key: string;
  readonly label: string;
  /** Número crudo (el frontend lo formatea/anima). */
  readonly value: number;
  /** Texto antes del número (p. ej. "+"). */
  readonly prefix: string;
  /** Texto después del número (p. ej. "+" o " L"). */
  readonly suffix: string;
  /** Listo para mostrar: prefijo + número con separador de miles + sufijo. */
  readonly display: string;
  readonly sortOrder: number;
  readonly visible: boolean;
  readonly updatedAt: string;
}

export interface UpdateSiteMetricRequestDto {
  readonly label?: string;
  readonly value?: number;
  readonly prefix?: string;
  readonly suffix?: string;
  readonly sortOrder?: number;
  /** false = no se muestra en la landing. */
  readonly visible?: boolean;
}

export interface ScholarshipTypeDto {
  readonly id: Uuid;
  /** Clave estable (no cambia). */
  readonly key: string;
  /** Texto a mostrar (editable en el panel). */
  readonly name: string;
  readonly minPercent: number;
  /** Igual a minPercent si el porcentaje es fijo. */
  readonly maxPercent: number;
  /** La postulación requiere entrevista por Zoom. */
  readonly requiresInterview: boolean;
  readonly description: string | null;
  /** Orden de presentación (menor primero). */
  readonly sortOrder: number;
  /** Becas de este tipo que aún se pueden asignar (cupo global). null = sin límite. */
  readonly availableRecipients: number | null;
  /** Cupo agotado: se muestra "Agotado" y no se puede solicitar en postulaciones nuevas. */
  readonly isFull: boolean;
}

export interface ScholarshipTypesResponseDto {
  /** Solo los activos, ordenados. */
  readonly data: ScholarshipTypeDto[];
}

export interface ScholarshipTypeUsageDto {
  /** Ofertas que lo habilitan. */
  readonly offers: number;
  /** Postulaciones que lo solicitaron o lo tienen asignado. */
  readonly applications: number;
  /** Evaluaciones del comité que lo sugieren. */
  readonly evaluations: number;
}

export interface AdminScholarshipTypeDto {
  readonly id: Uuid;
  /** Clave estable (no cambia). */
  readonly key: string;
  /** Texto a mostrar (editable en el panel). */
  readonly name: string;
  readonly minPercent: number;
  /** Igual a minPercent si el porcentaje es fijo. */
  readonly maxPercent: number;
  /** La postulación requiere entrevista por Zoom. */
  readonly requiresInterview: boolean;
  readonly description: string | null;
  /** Orden de presentación (menor primero). */
  readonly sortOrder: number;
  /** Becas de este tipo que aún se pueden asignar (cupo global). null = sin límite. */
  readonly availableRecipients: number | null;
  /** Cupo agotado: se muestra "Agotado" y no se puede solicitar en postulaciones nuevas. */
  readonly isFull: boolean;
  /** Cupo global (todas las ofertas). null = sin límite. */
  readonly maxRecipients: number | null;
  /** Becas asignadas que ocupan cupo (aprobadas pendientes de pago/confirmación e inscritas). */
  readonly usedRecipients: number;
  /** Desactivado = no se ofrece en ofertas ni postulaciones nuevas. */
  readonly active: boolean;
  /** Uso actual. Solo se puede borrar si todo es 0 (si no, desactívalo). */
  readonly usage: ScholarshipTypeUsageDto;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AdminScholarshipTypesResponseDto {
  /** Todos (incluye inactivos), ordenados. */
  readonly data: AdminScholarshipTypeDto[];
}

export interface CreateScholarshipTypeRequestDto {
  /** MAYÚSCULAS_CON_GUION_BAJO, única. No se puede cambiar después. */
  readonly key: string;
  readonly name: string;
  readonly description?: string | null;
  readonly minPercent: number;
  /** Igual a minPercent = % fijo. */
  readonly maxPercent: number;
  readonly requiresInterview?: boolean;
  /** Cupo global: cuántas personas pueden tener asignada esta beca (todas las ofertas). null = sin límite. Puede quedar por debajo de lo ya asignado (no quita becas; bloquea nuevas). */
  readonly maxRecipients?: number | null;
  readonly active?: boolean;
  /** Por defecto, al final. */
  readonly sortOrder?: number;
}

export interface UpdateScholarshipTypeRequestDto {
  readonly name?: string;
  readonly description?: string | null;
  readonly minPercent?: number;
  /** Igual a minPercent = % fijo. */
  readonly maxPercent?: number;
  readonly requiresInterview?: boolean;
  /** Cupo global: cuántas personas pueden tener asignada esta beca (todas las ofertas). null = sin límite. Puede quedar por debajo de lo ya asignado (no quita becas; bloquea nuevas). */
  readonly maxRecipients?: number | null;
  /** false = deja de ofrecerse en ofertas y postulaciones nuevas (lo asignado se conserva). */
  readonly active?: boolean;
  readonly sortOrder?: number;
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

export interface ScholarshipTypeSummaryDto {
  readonly id: Uuid;
  /** Clave estable (no cambia). */
  readonly key: string;
  /** Texto a mostrar (editable en el panel). */
  readonly name: string;
  readonly minPercent: number;
  /** Igual a minPercent si el porcentaje es fijo. */
  readonly maxPercent: number;
  /** La postulación requiere entrevista por Zoom. */
  readonly requiresInterview: boolean;
}

export interface AmountRangeDto {
  readonly minAmountCents: number;
  readonly maxAmountCents: number;
  readonly currency: Currency;
}

export interface OfferScholarshipTypeDto {
  readonly scholarshipTypeId: Uuid;
  /** Tipo de beca con el rango EFECTIVO en esta oferta (la oferta puede ajustar el rango del tipo). `requiresInterview` = la postulación pasa por entrevista por Zoom. */
  readonly scholarshipType: ScholarshipTypeSummaryDto;
  readonly description: string | null;
  /** Monto estimado de la beca en la moneda del visitante. */
  readonly estimatedScholarship: AmountRangeDto | null;
  /** Saldo estimado a pagar ("el tipo final lo asigna el equipo"). */
  readonly estimatedBalance: AmountRangeDto | null;
  /** Becas de este tipo que aún se pueden asignar en esta oferta (mínimo entre el cupo global del tipo y el de la oferta). null = sin límite. */
  readonly availableRecipients: number | null;
  /** Cupo agotado: muéstralo como "Agotado"; no se puede solicitar. */
  readonly isFull: boolean;
}

export interface OfferScholarshipDto {
  readonly minPercent: number;
  readonly maxPercent: number;
  /** Convocatoria de becas. */
  readonly windowStatus: WindowStatus;
  readonly opensAt: IsoDateTime | null;
  readonly closesAt: IsoDateTime | null;
  /** Tipos de beca activos de esta oferta, ordenados (antes `levels`). */
  readonly scholarshipTypes: OfferScholarshipTypeDto[];
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

export interface OfferViewerApplicationDto {
  readonly id: Uuid;
  readonly kind: ApplicationKind;
  readonly status: ApplicationStatus;
  readonly folio: string;
  /** Fase 05: comprobante de transferencia "Pendiente de validación". */
  readonly transferPending?: boolean;
}

export interface OfferViewerDto {
  readonly authenticated: boolean;
  /** "Ya estás inscrito". */
  readonly enrolled: boolean;
  /** Fase 04: mi postulación (beca o convocatoria) en esta oferta, una por cohorte (HU-16: "con una postulación a beca en curso veo su estado o [Pagar saldo]"). null sin sesión o sin postulación. */
  readonly application: OfferViewerApplicationDto | null;
}

export interface OfferActionDto {
  /** Fase 05: ENROLL_AND_PAY / PAY_IN_INSTALLMENTS → pantalla de pago (`GET /me/payments/quote?offerId=`), PAY_BALANCE → `/portal/postulaciones/{applicationId}/pago`, CONTINUE_PAYMENT [Continuar pago] (checkout abierto: `POST /me/payments/checkout` devuelve la misma sesión), PAYMENT_IN_VALIDATION "Pago en validación" (deshabilitado), REGULARIZE_PAYMENT [Regularizar pago] → Mis pagos (acceso suspendido por mora). */
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
  /** Fase 04: en `VIEW_APPLICATION` / `PAY_BALANCE`, id de mi postulación → `/portal/postulaciones/{applicationId}` (`GET /me/applications/{id}`). */
  readonly applicationId: Uuid | null;
  /** Fase 04: estado de mi postulación (mismos textos que "Mis postulaciones"). */
  readonly applicationStatus: ApplicationStatus | null;
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

export interface AdminOfferCountsDto {
  /** Inscripciones que ocupan cupo (incluye reservas vigentes). */
  readonly enrollments: number;
  /** Postulaciones enviadas (sin borradores). */
  readonly applications: number;
  /** Sesiones no canceladas. */
  readonly sessions: number;
  readonly modules: number;
}

export interface AdminOfferListItemDto {
  readonly id: Uuid;
  readonly slug: string;
  readonly name: string;
  readonly type: OfferType;
  readonly modality: OfferModality;
  readonly origin: OfferOrigin;
  readonly publicationStatus: PublicationStatus;
  /** Estado del listado (ver tabla de la guía). */
  readonly adminStatus: AdminOfferStatus;
  /** Estado público derivado ("Próximamente" en el sitio). */
  readonly availability: OfferAvailability;
  readonly cohortLabel: string | null;
  readonly startsAt: string | null;
  readonly endsAt: string | null;
  readonly coverImageUrl: string | null;
  readonly counts: AdminOfferCountsDto;
  /** Ruta de la ficha pública (Vista previa). */
  readonly publicPath: string;
  readonly updatedAt: string;
}

export interface CreateOfferRequestDto {
  readonly type: OfferType;
  readonly modality: OfferModality;
  readonly name: string;
}

export interface AdminImageDto {
  readonly key: string;
  readonly url: string;
}

export interface AdminTeacherRefDto {
  readonly id: Uuid;
  readonly fullName: string;
  readonly photoUrl: string | null;
}

export interface AdminVenueDto {
  readonly name: string | null;
  readonly address: string | null;
  readonly city: string | null;
  readonly mapsUrl: string | null;
}

export interface AdminOfferGeneralDto {
  readonly cohortLabel: string | null;
  readonly summary: string;
  readonly coverImage: AdminImageDto | null;
  readonly carouselImages: AdminImageDto[];
  readonly publicTopic: OfferTopic | null;
  readonly teachers: AdminTeacherRefDto[];
  readonly venue: AdminVenueDto;
  readonly capacity: number | null;
}

export interface AdminOfferContentDto {
  readonly description: string;
  readonly learningOutcomes: string[];
  readonly requirements: string | null;
  readonly eligibilityText: string | null;
  readonly eligibleCountryCodes: string[];
  readonly requiresTravel: boolean;
  readonly classroomWelcome: string | null;
  readonly finalProjectSubmissionEnabled: boolean;
  readonly finalProjectGuidelines: string | null;
}

export interface ScheduleRuleDto {
  /** Días ISO: 1 = lunes … 7 = domingo. */
  readonly weekdays: number[];
  /** Inicio en hora CDMX (HH:mm). */
  readonly startTime: string;
  /** Fin en hora CDMX (HH:mm), posterior al inicio. */
  readonly endTime: string;
  /** Fechas CDMX omitidas (recesos). */
  readonly excludedDates?: string[];
  /** Omite los festivos oficiales de México. */
  readonly excludeMexicanHolidays?: boolean;
}

export interface AdminOfferScheduleDto {
  readonly enrollmentOpensAt: string | null;
  readonly enrollmentClosesAt: string | null;
  readonly startsAt: string | null;
  readonly endsAt: string | null;
  readonly finalProjectDueAt: string | null;
  readonly totalHours: number | null;
  readonly scheduleRule: ScheduleRuleDto | null;
  readonly calendarCategory: CalendarCategory;
  /** Zona de las horas de la regla. */
  readonly timezone: string;
}

export interface OfferScholarshipQuotaDto {
  /** Cupo global del tipo. */
  readonly typeMaxRecipients: number | null;
  /** Asignadas del tipo en todas las ofertas. */
  readonly typeUsedRecipients: number;
  /** Tope propio de la oferta. */
  readonly offerMaxRecipients: number | null;
  /** Asignadas del tipo en esta oferta. */
  readonly offerUsedRecipients: number;
  /** Disponibles = mínimo entre ambos cupos. null = sin límite. */
  readonly availableRecipients: number | null;
  readonly isFull: boolean;
}

export interface AdminOfferScholarshipTypeDto {
  readonly scholarshipTypeId: Uuid;
  /** Override de la oferta. */
  readonly minPercent: number | null;
  /** Override de la oferta. */
  readonly maxPercent: number | null;
  readonly sortOrder: number | null;
  /** Tope propio de la oferta. */
  readonly maxRecipients: number | null;
  /** Cupo global + de la oferta. */
  readonly quota: OfferScholarshipQuotaDto;
  /** false = tipo desactivado: no se ofrece. */
  readonly active: boolean;
  /** Tipo con el rango EFECTIVO en esta oferta. */
  readonly scholarshipType: ScholarshipTypeSummaryDto;
}

export interface AdminOfferOriginPricingDto {
  readonly origin: OfferOrigin;
  readonly isFree: boolean;
  readonly priceMxnCents: number | null;
  readonly priceUsdCents: number | null;
  readonly installmentsEnabled: boolean;
  readonly installmentsMax: number | null;
  readonly moodleCourseUrl: string | null;
  readonly scholarshipEnabled: boolean;
  /** Tipos de beca habilitados (antes `scholarshipLevels`), incluye desactivados. */
  readonly scholarshipTypes: AdminOfferScholarshipTypeDto[];
  readonly scholarshipOpensAt: string | null;
  readonly scholarshipClosesAt: string | null;
}

export interface AdminOfferResourcesSummaryDto {
  readonly moduleCount: number;
  readonly publishedModuleCount: number;
  readonly resourceCount: number;
}

export interface AdminOfferAttendanceDto {
  readonly attendanceWindowHours: number;
}

export interface AdminOfferWhatsappDto {
  readonly whatsappGroupUrl: string | null;
  readonly whatsappVisibleFrom: string | null;
}

export interface WizardIssueDto {
  readonly field: string;
  readonly code: WizardIssueCode;
  readonly message: string;
}

export interface WizardStepDto {
  readonly step: number;
  readonly key: WizardStep;
  /** Segmento de `PATCH /admin/offers/{id}/steps/{slug}`. */
  readonly slug: string;
  readonly label: string;
  /** Obligatorio para publicar. */
  readonly requiredToPublish: boolean;
  /** Sin problemas: se puede avanzar. */
  readonly complete: boolean;
  readonly issues: WizardIssueDto[];
}

export interface WizardStatusDto {
  readonly steps: WizardStepDto[];
  /** "Publicar" habilitado. */
  readonly canPublish: boolean;
  /** Problemas que impiden publicar (`field` = `<paso>.<campo>`). */
  readonly publishBlockers: WizardIssueDto[];
}

export interface SessionPreviewHintDto {
  /** Hay regla de horario y fechas: abrir la vista previa de sesiones (HU-29). */
  readonly available: boolean;
}

export interface AdminOfferDetailDto {
  readonly id: Uuid;
  readonly slug: string;
  readonly name: string;
  readonly type: OfferType;
  readonly modality: OfferModality;
  readonly origin: OfferOrigin;
  readonly publicationStatus: PublicationStatus;
  /** Estado del listado (ver tabla de la guía). */
  readonly adminStatus: AdminOfferStatus;
  /** Estado público derivado ("Próximamente" en el sitio). */
  readonly availability: OfferAvailability;
  readonly cohortLabel: string | null;
  readonly startsAt: string | null;
  readonly endsAt: string | null;
  readonly coverImageUrl: string | null;
  readonly counts: AdminOfferCountsDto;
  /** Ruta de la ficha pública (Vista previa). */
  readonly publicPath: string;
  readonly updatedAt: string;
  readonly publishedAt: string | null;
  /** Tiene inscritos o postulaciones: tipo, modalidad y origen quedan bloqueados. */
  readonly hasEnrollments: boolean;
  /** Paso 1. */
  readonly general: AdminOfferGeneralDto;
  /** Paso 2. */
  readonly content: AdminOfferContentDto;
  /** Paso 3. */
  readonly schedule: AdminOfferScheduleDto;
  /** Paso 4. */
  readonly originPricing: AdminOfferOriginPricingDto;
  /** Paso 5 (se gestiona en Contenido del aula). */
  readonly resources: AdminOfferResourcesSummaryDto;
  /** Paso 6. */
  readonly attendance: AdminOfferAttendanceDto;
  /** Paso 7. */
  readonly whatsapp: AdminOfferWhatsappDto;
  readonly wizard: WizardStatusDto;
  readonly sessionPreview: SessionPreviewHintDto;
  readonly createdAt: string;
}

export interface UpdateGeneralStepDto {
  readonly name?: string;
  /** No editable si ya hay inscritos o postulaciones (409 OFFER_HAS_ENROLLMENTS). */
  readonly type?: OfferType;
  /** No editable con inscritos. */
  readonly modality?: OfferModality;
  readonly cohortLabel?: string | null;
  readonly summary?: string;
  /** Key devuelta por `POST /admin/uploads/images` (purpose OFFER_COVER) tras subir el archivo, o una URL https absoluta. Se verifica en storage. */
  readonly coverImageKey?: string | null;
  /** Keys del carrusel (purpose OFFER_CAROUSEL), en orden. */
  readonly carouselImageKeys?: string[];
  /** Temática pública de HU-34. */
  readonly publicTopic?: OfferTopic | null;
  /** Docentes en el orden de la ficha (reemplaza la lista). */
  readonly teacherIds?: Uuid[];
  /** Obligatorio si es presencial. */
  readonly venueName?: string | null;
  readonly venueAddress?: string | null;
  readonly venueCity?: string | null;
  readonly venueMapsUrl?: string | null;
  /** Cupo (null = sin límite). */
  readonly capacity?: number | null;
}

export interface UpdateContentStepDto {
  readonly description?: string;
  /** "¿Qué aprenderás?" */
  readonly learningOutcomes?: string[];
  readonly requirements?: string | null;
  /** Obligatorio en convocatorias. */
  readonly eligibilityText?: string | null;
  /** Países elegibles (ISO-2); vacío = todos. */
  readonly eligibleCountryCodes?: string[];
  readonly requiresTravel?: boolean;
  readonly classroomWelcome?: string | null;
  /** Carga del proyecto final por archivo (solo diplomados). */
  readonly finalProjectSubmissionEnabled?: boolean;
  readonly finalProjectGuidelines?: string | null;
}

export interface UpdateScheduleStepDto {
  /** Apertura de inscripciones (convocatoria: de postulación). */
  readonly enrollmentOpensAt?: string | null;
  readonly enrollmentClosesAt?: string | null;
  readonly startsAt?: string | null;
  readonly endsAt?: string | null;
  /** Obligatoria en diplomados. */
  readonly finalProjectDueAt?: string | null;
  /** Duración total en horas (curso ≤ 9 h; diplomado = 60 h). */
  readonly totalHours?: number | null;
  /** Regla de horario en hora CDMX (genera las sesiones, HU-29). */
  readonly scheduleRule?: ScheduleRuleDto | null;
  /** Color por defecto de las sesiones. */
  readonly calendarCategory?: CalendarCategory;
}

export interface OfferScholarshipTypeInputDto {
  readonly scholarshipTypeId: Uuid;
  /** Sobrescribe el % mínimo del tipo SOLO en esta oferta (null = el del tipo). */
  readonly minPercent?: number | null;
  /** Sobrescribe el % máximo del tipo SOLO en esta oferta (null = el del tipo). */
  readonly maxPercent?: number | null;
  /** Orden en esta oferta (null = el del tipo). */
  readonly sortOrder?: number | null;
  /** Tope de becas de este tipo SOLO en esta oferta (además del cupo global del tipo). null = sin tope propio. */
  readonly maxRecipients?: number | null;
}

export interface UpdateOriginPricingStepDto {
  /** MOODLE oculta precio, cuotas y beca (se limpian). No editable con inscritos. */
  readonly origin?: OfferOrigin;
  readonly isFree?: boolean;
  /** Centavos MXN (> 0 si es de pago). */
  readonly priceMxnCents?: number | null;
  /** Centavos USD (> 0 si es de pago). */
  readonly priceUsdCents?: number | null;
  readonly installmentsEnabled?: boolean;
  readonly installmentsMax?: number | null;
  readonly moodleCourseUrl?: string | null;
  /** Solo diplomados NAS. */
  readonly scholarshipEnabled?: boolean;
  /** Tipos de beca habilitados (REEMPLAZA la lista; antes `scholarshipLevels`). Ids de `GET /admin/scholarship-types`. Un tipo inexistente o desactivado → 422 `SCHOLARSHIP_TYPE_NOT_AVAILABLE` (los desactivados que la oferta ya tenía se pueden conservar). `minPercent`/`maxPercent` opcionales ajustan el rango SOLO en esta oferta (rango inválido → 422 `SCHOLARSHIP_TYPE_INVALID_RANGE`). */
  readonly scholarshipTypes?: OfferScholarshipTypeInputDto[];
  /** Null = ventana de inscripción. */
  readonly scholarshipOpensAt?: string | null;
  readonly scholarshipClosesAt?: string | null;
}

export interface UpdateAttendanceStepDto {
  /** Horas para registrar asistencia tras cada sesión (HU-30). */
  readonly attendanceWindowHours: number;
}

export interface UpdateWhatsappStepDto {
  /** Solo visible para inscritos. */
  readonly whatsappGroupUrl?: string | null;
  /** Desde cuándo lo ven los inscritos (null = desde la inscripción). */
  readonly whatsappVisibleFrom?: string | null;
}

export interface DuplicateOfferRequestDto {
  /** Por defecto "<nombre> (copia)". */
  readonly name?: string;
  readonly cohortLabel?: string | null;
}

export interface ImageUploadUrlRequestDto {
  readonly purpose: ImageUploadPurpose;
  /** Obligatorio para OFFER_COVER / OFFER_CAROUSEL. */
  readonly offerId?: Uuid;
  readonly fileName: string;
  readonly contentType: ImageContentType;
  /** Bytes (máx. 5 MB). */
  readonly sizeBytes: number;
}

export interface ImageUploadUrlDto {
  /** Haz PUT del archivo aquí. */
  readonly uploadUrl: string;
  readonly method: string;
  /** Headers obligatorios del PUT. */
  readonly headers: Record<string, unknown>;
  /** Guárdala en el paso correspondiente. */
  readonly key: string;
  readonly expiresAt: string;
}

export interface AdminTeacherDto {
  readonly id: Uuid;
  readonly slug: string;
  readonly fullName: string;
  readonly bio: string | null;
  readonly cvUrl: string | null;
  readonly photoKey: string | null;
  readonly photoUrl: string | null;
  /** Ofertas donde participa. */
  readonly offerCount: number;
  /** Módulos asignados. */
  readonly moduleCount: number;
  readonly updatedAt: string;
}

export interface CreateTeacherRequestDto {
  readonly fullName: string;
  readonly bio?: string | null;
  /** CV (enlace https). */
  readonly cvUrl?: string | null;
  /** Key de `POST /admin/uploads/images` (TEACHER_PHOTO) o URL https. */
  readonly photoKey?: string | null;
}

export interface UpdateTeacherRequestDto {
  readonly fullName?: string;
  readonly bio?: string | null;
  /** CV (enlace https). */
  readonly cvUrl?: string | null;
  /** Key de `POST /admin/uploads/images` (TEACHER_PHOTO) o URL https. */
  readonly photoKey?: string | null;
}

export interface AdminModuleTeacherDto {
  readonly id: Uuid;
  readonly fullName: string;
}

export interface AdminResourceFileDto {
  readonly key: string;
  readonly fileName: string | null;
  readonly mimeType: string | null;
  readonly sizeBytes: number | null;
  /** URL firmada de descarga (~10 min). */
  readonly downloadUrl: string;
}

export interface AdminLibraryRefDto {
  readonly id: Uuid;
  readonly title: string;
}

export interface AdminResourceDto {
  readonly id: Uuid;
  readonly type: MaterialResourceType;
  readonly title: string;
  readonly description: string | null;
  readonly source: ResourceSource;
  readonly file: AdminResourceFileDto | null;
  readonly url: string | null;
  readonly library: AdminLibraryRefDto | null;
  readonly activityDueAt: string | null;
  readonly position: number;
  readonly visibility: Visibility;
  readonly publishAt: string | null;
  /** Lo ven los inscritos ahora (publicado, fecha cumplida y módulo visible). */
  readonly visibleNow: boolean;
  readonly notifyEnrollees: boolean;
  /** Cuándo se notificó a los inscritos. */
  readonly notifiedAt: string | null;
  readonly updatedAt: string;
}

export interface AdminRecordingRowDto {
  readonly sessionId: Uuid;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly status: SessionStatus;
  readonly recordingUrl: string | null;
  readonly recordingPublishedAt: string | null;
  /** AVAILABLE / AFTER_SESSION / PENDING ("Grabación pendiente") / NOT_APPLICABLE. */
  readonly state: RecordingState;
  /** Sesión ya realizada sin enlace: resaltar. */
  readonly pending: boolean;
}

export interface AdminModuleSectionsDto {
  /** Presentación (la más reciente). */
  readonly presentation: AdminResourceDto | null;
  readonly preReadings: AdminResourceDto[];
  readonly activities: AdminResourceDto[];
  /** Una fila por sesión del módulo (se edita en `PATCH /admin/sessions/{id}`). */
  readonly recordings: AdminRecordingRowDto[];
}

export interface AdminModuleDto {
  readonly id: Uuid;
  /** Número visible ("Módulo 3"). */
  readonly number: number;
  readonly title: string;
  readonly description: string | null;
  readonly teacher: AdminModuleTeacherDto | null;
  readonly visibility: Visibility;
  readonly publishAt: string | null;
  readonly visibleNow: boolean;
  readonly notifyEnrollees: boolean;
  readonly notifiedAt: string | null;
  readonly sections: AdminModuleSectionsDto;
}

export interface AdminModulesDto {
  readonly offerId: Uuid;
  readonly offerName: string;
  readonly modules: AdminModuleDto[];
  /** Sesiones sin módulo asignado. */
  readonly unassignedRecordings: AdminRecordingRowDto[];
  /** Inscritos activos que recibirían avisos. */
  readonly activeEnrollees: number;
}

export interface CreateModuleRequestDto {
  /** La numeración "Módulo N" es automática. */
  readonly title: string;
  readonly description?: string | null;
  /** Docente del módulo (null = docentes de la oferta). */
  readonly teacherId?: Uuid | null;
}

export interface ModuleMutationDto {
  readonly module: AdminModuleDto;
  /** "Se notificó a [n] inscritos" (0 si no se avisó). */
  readonly notifiedCount: number;
}

export interface ReorderModulesRequestDto {
  /** TODOS los módulos de la oferta en el nuevo orden. */
  readonly moduleIds: Uuid[];
}

export interface UpdateModuleRequestDto {
  readonly title?: string;
  readonly description?: string | null;
  readonly teacherId?: Uuid | null;
  /** Oculto por defecto. */
  readonly visibility?: Visibility;
  /** Publicación programada (solo a futuro). Con `visibility: PUBLISHED` el contenido aparece al llegar la fecha (y se notifica entonces). null = inmediata. */
  readonly publishAt?: string | null;
  /** "Notificar a inscritos" (marcada por defecto): al quedar visible se avisa a los inscritos activos por portal y correo (una sola vez). */
  readonly notifyEnrollees?: boolean;
}

export interface ResourceUploadUrlRequestDto {
  readonly type: MaterialResourceType;
  readonly fileName: string;
  /** Presentación: PDF/PPTX · Lecturas: PDF/DOCX/EPUB · Actividades: cualquiera de esos. Máx. 50 MB. */
  readonly contentType: string;
  readonly sizeBytes: number;
}

export interface ResourceUploadUrlDto {
  readonly uploadUrl: string;
  readonly method: string;
  readonly headers: Record<string, unknown>;
  readonly key: string;
  readonly expiresAt: string;
  readonly maxBytes: number;
}

export interface CreateResourceRequestDto {
  readonly title?: string;
  readonly description?: string | null;
  /** Archivo subido con `…/resources/upload-url` (se verifica tipo y tamaño reales). Una sola fuente: `fileKey`, `url` o `libraryResourceId`. */
  readonly fileKey?: string | null;
  /** Nombre visible del archivo (por defecto el de la key). */
  readonly fileName?: string;
  /** Enlace externo https. */
  readonly url?: string | null;
  /** Solo lecturas previas: enlaza un recurso de la Biblioteca (HU-09). */
  readonly libraryResourceId?: Uuid | null;
  /** Solo actividades; dentro del periodo de la oferta. */
  readonly activityDueAt?: string | null;
  /** Oculto por defecto. */
  readonly visibility?: Visibility;
  /** Publicación programada (solo a futuro). Con `visibility: PUBLISHED` el contenido aparece al llegar la fecha (y se notifica entonces). null = inmediata. */
  readonly publishAt?: string | null;
  /** "Notificar a inscritos" (marcada por defecto): al quedar visible se avisa a los inscritos activos por portal y correo (una sola vez). */
  readonly notifyEnrollees?: boolean;
  /** PRESENTATION: una por módulo (una nueva reemplaza a la anterior). */
  readonly type: MaterialResourceType;
}

export interface ResourceMutationDto {
  readonly resource: AdminResourceDto;
  readonly notifiedCount: number;
  /** Presentación anterior reemplazada (borrada). */
  readonly replacedResourceId: string | null;
}

export interface ReorderResourcesRequestDto {
  /** TODOS los recursos del módulo en el nuevo orden. */
  readonly resourceIds: Uuid[];
}

export interface UpdateResourceRequestDto {
  readonly title?: string;
  readonly description?: string | null;
  /** Archivo subido con `…/resources/upload-url` (se verifica tipo y tamaño reales). Una sola fuente: `fileKey`, `url` o `libraryResourceId`. */
  readonly fileKey?: string | null;
  /** Nombre visible del archivo (por defecto el de la key). */
  readonly fileName?: string;
  /** Enlace externo https. */
  readonly url?: string | null;
  /** Solo lecturas previas: enlaza un recurso de la Biblioteca (HU-09). */
  readonly libraryResourceId?: Uuid | null;
  /** Solo actividades; dentro del periodo de la oferta. */
  readonly activityDueAt?: string | null;
  /** Oculto por defecto. */
  readonly visibility?: Visibility;
  /** Publicación programada (solo a futuro). Con `visibility: PUBLISHED` el contenido aparece al llegar la fecha (y se notifica entonces). null = inmediata. */
  readonly publishAt?: string | null;
  /** "Notificar a inscritos" (marcada por defecto): al quedar visible se avisa a los inscritos activos por portal y correo (una sola vez). */
  readonly notifyEnrollees?: boolean;
}

export interface ApplicationOfferVenueDto {
  readonly name: string;
  readonly city: string | null;
}

export interface ApplicationOfferDto {
  readonly id: Uuid;
  /** Para "Ver ficha". */
  readonly slug: string;
  readonly name: string;
  readonly type: OfferType;
  readonly modality: OfferModality;
  readonly cohortLabel: string | null;
  readonly coverImageUrl: string | null;
  readonly startsAt: IsoDateTime | null;
  readonly endsAt: IsoDateTime | null;
  /** Presencial ("Presencial" en la tarjeta). */
  readonly venue: ApplicationOfferVenueDto | null;
}

export interface ApplicationWindowDto {
  /** Ventana de postulación: OPEN "Abierta", UPCOMING "Próximamente", CLOSED "Cerrada". */
  readonly state: WindowStatus;
  readonly opensAt: IsoDateTime | null;
  /** Cierre (cuenta regresiva "Cierra en 5 días", en la zona del usuario). */
  readonly closesAt: IsoDateTime | null;
  /** Motivo si no está abierta (mismos textos que la ficha): SCHOLARSHIP_NOT_OPEN_YET, SCHOLARSHIP_CLOSED, ENROLLMENT_NOT_OPEN_YET, ENROLLMENT_CLOSED ("Convocatoria cerrada"), OFFER_FINISHED. */
  readonly reason: OfferActionReason | null;
}

export interface ApplicationEligibilityDto {
  /** Texto destacado al inicio del formulario. */
  readonly text: string | null;
  /** Vacío = cualquier país. */
  readonly countries: EligibleCountryDto[];
  /** Exige disponibilidad para viajar. */
  readonly requiresTravel: boolean;
  /** ¿Cumple hoy? (país del perfil y respuesta de viaje). false → envío bloqueado. */
  readonly eligible: boolean;
  /** `COUNTRY_NOT_ELIGIBLE` → muestra `text` ("dirigida a …"); `TRAVEL_REQUIRED` → "Debes poder asistir de forma presencial". */
  readonly reasons: ApplicationIneligibilityReason[];
}

export interface MyApplicationRefDto {
  readonly id: Uuid;
  readonly status: ApplicationStatus;
  readonly folio: string;
}

export interface ApplicationOpportunityDto {
  readonly kind: ApplicationKind;
  readonly offer: ApplicationOfferDto;
  readonly window: ApplicationWindowDto;
  /** Costo en tu moneda; null = "Gratuito". */
  readonly price: MoneyDto | null;
  /** Beca: tipos de beca y monto estimado (antes `levels`). Vacío en convocatorias. */
  readonly scholarshipTypes: OfferScholarshipTypeDto[];
  readonly eligibility: ApplicationEligibilityDto | null;
  /** Mi postulación (una por cohorte): en vez de [Postular] → [Ver mi postulación]. */
  readonly myApplication: MyApplicationRefDto | null;
  /** [Postular] habilitado (ventana abierta, sin postulación previa ni inscripción). */
  readonly canApply: boolean;
  /** Ya inscrito en la oferta (no se postula). */
  readonly enrolled: boolean;
}

export interface ApplicationOpportunitiesDto {
  /** Abiertas primero, ordenadas por cierre más próximo; luego las próximas. */
  readonly data: ApplicationOpportunityDto[];
}

export interface ApplicationActionDto {
  /** CONTINUE_DRAFT [Continuar] · JOIN_INTERVIEW [Entrar a la entrevista] (abre `interview.join.url`) · PAY_BALANCE [Pagar saldo] (Fase 05: `/portal/postulaciones/{id}/pago`) · CONTINUE_PAYMENT [Continuar pago] (ya inició un pago: misma pantalla) · UPLOAD_TRANSFER_PROOF [Subir comprobante] (transferencia rechazada) · PAYMENT_IN_VALIDATION "Pago en validación" (deshabilitado, comprobante en revisión) · CONFIRM_PARTICIPATION [Confirmar mi participación] (`POST …/confirm`) · GO_TO_CLASSROOM [Ir a mi aula] · VIEW [Ver mi postulación]. */
  readonly type: ApplicationActionType;
  readonly enabled: boolean;
  /** Si `enabled = false`: WINDOW_CLOSED (borrador en solo lectura), INTERVIEW_NOT_OPEN_YET ("Disponible 10 min antes"), INTERVIEW_LINK_PENDING, INTERVIEW_ENDED, TRANSFER_PENDING_VALIDATION ("El equipo valida tu comprobante en 1–2 días hábiles"). */
  readonly reason: ApplicationActionReason | null;
  /** Cuenta regresiva: inicio de la entrevista o fecha límite de pago/confirmación. */
  readonly dueAt: IsoDateTime | null;
}

export interface TimelineStepDto {
  /** SUBMITTED Enviada · IN_REVIEW En revisión · INTERVIEW Entrevista · RESULT Resultado · PAYMENT Pago del saldo · CONFIRMATION Confirmación · ENROLLED Inscrita. */
  readonly key: ApplicationTimelineStep;
  /** DONE (con fecha), CURRENT (etapa actual), UPCOMING, SKIPPED (no aplicó) o FAILED (No seleccionada / Vencida). */
  readonly state: TimelineStepState;
  readonly at: IsoDateTime | null;
}

export interface SessionJoinDto {
  /** `OPEN` → [Entrar a sesión] con `url`; `NOT_YET` → deshabilitado hasta `opensAt` (cuenta regresiva; vuelve a pedir la sesión al llegar); `LINK_PENDING` "Enlace aún no disponible"; `CANCELLED` "Cancelada"; `ENDED`; `IN_PERSON` (sin enlace). */
  readonly state: SessionJoinState;
  /** Inicio − 10 min (BUSINESS_RULES.SESSION_JOIN_WINDOW_MINUTES_BEFORE). */
  readonly opensAt: IsoDateTime;
  /** join_url (Zoom/Meet) SOLO con `state = OPEN`. Nunca el enlace de anfitrión. */
  readonly url: string | null;
}

export interface InterviewDto {
  readonly id: Uuid;
  readonly startsAt: IsoDateTime;
  readonly endsAt: IsoDateTime;
  /** Referencia CDMX: muestra "11:00 tu hora · 10:00 hora CDMX" (HU-11). */
  readonly timezone: string;
  /** SCHEDULED Agendada · COMPLETED Realizada · CANCELLED · NO_SHOW No asistió. */
  readonly status: InterviewStatus;
  /** Enlace de Zoom: `url` solo con `state = OPEN` (10 minutos antes y hasta el fin). Mismas reglas que las sesiones (HU-12). */
  readonly join: SessionJoinDto;
}

export interface ScholarshipResultDto {
  readonly requestedScholarshipTypeId: Uuid | null;
  readonly requestedScholarshipType: ScholarshipTypeSummaryDto | null;
  readonly assignedScholarshipTypeId: Uuid;
  /** Tipo asignado. `name` es el nombre que tenía al aprobar (no cambia si luego se renombra). */
  readonly assignedScholarshipType: ScholarshipTypeSummaryDto;
  /** % asignado (dentro del rango del tipo en la oferta). */
  readonly assignedPercent: number;
  /** Monto original de la oferta. */
  readonly originalAmount: MoneyDto | null;
  /** Saldo a pagar en tu moneda (HU-23). */
  readonly balance: MoneyDto;
  /** Fecha límite de pago (7 días naturales). */
  readonly dueAt: IsoDateTime | null;
}

export interface ApplicationResponseDeadlineDto {
  /** Qué debe hacer la persona: pagar (saldo / costo) o confirmar su participación. */
  readonly kind: ResponseDeadlineKind;
  readonly dueAt: IsoDateTime | null;
  /** Monto a pagar (null en confirmación). */
  readonly amount: MoneyDto | null;
  /** Comprobante de transferencia "Pendiente de validación" (Fase 05): la postulación no vence. */
  readonly transferPendingValidation: boolean;
  /** Fase 05: el último comprobante fue "Rechazado" (ver motivo en Mis pagos) y puede subir otro. */
  readonly transferRejected: boolean;
  /** Fase 05: ya inició un pago (abrió Stripe o subió comprobante): "Con pago iniciado". */
  readonly paymentStarted: boolean;
}

export interface ApplicationCardDto {
  readonly id: Uuid;
  /** Folio (BEC-… beca, CONV-… convocatoria). Se muestra desde el envío. */
  readonly folio: string;
  readonly kind: ApplicationKind;
  /** Estado global (tabla enum → texto en la guía de la Fase 04). */
  readonly status: ApplicationStatus;
  readonly statusChangedAt: IsoDateTime;
  readonly offer: ApplicationOfferDto;
  /** Envío. */
  readonly submittedAt: IsoDateTime | null;
  /** Último guardado ("Borrador guardado · hh:mm"). */
  readonly updatedAt: IsoDateTime;
  /** Requiere acción (entrevista, pago o confirmación): destácala arriba con cuenta regresiva. */
  readonly requiresAction: boolean;
  /** Acción contextual (un botón). */
  readonly action: ApplicationActionDto;
  /** Línea de tiempo (vertical en mobile). */
  readonly timeline: TimelineStepDto[];
  /** Solo en "Entrevista agendada" (y como referencia después). */
  readonly interview: InterviewDto | null;
  /** Solo becas aprobadas: tipo solicitado y asignado, saldo y fecha límite. */
  readonly scholarshipResult: ScholarshipResultDto | null;
  /** Solo en "Aprobada – …": qué hacer y hasta cuándo. */
  readonly response: ApplicationResponseDeadlineDto | null;
}

export interface CreateApplicationRequestDto {
  /** WhatsApp con indicativo. Se precarga del perfil (HU-14); editable. */
  readonly phone?: PhoneDto;
  /** Edad (entero). Obligatoria en becas. */
  readonly age?: number | null;
  /** Código de iniciativa aliada (opcional; no aplica descuento). */
  readonly partnerCode?: string | null;
  /** Organización (obligatoria en convocatorias). */
  readonly organization?: string | null;
  /** Rol en la organización (obligatorio en convocatorias). */
  readonly organizationRole?: string | null;
  /** Beca: tipo de beca solicitado (antes `requestedLevel`). Solo los tipos activos del diplomado (`form.scholarshipTypes[].scholarshipTypeId`); otro → 400 `SCHOLARSHIP_TYPE_NOT_ENABLED`. Si el tipo tiene `requiresInterview`, habrá entrevista por Zoom. */
  readonly requestedScholarshipTypeId?: Uuid | null;
  /** Beca: carta de intención (800–4000 caracteres al enviar). */
  readonly intentLetter?: string | null;
  /** Convocatoria: "Confirmo que cumplo con la elegibilidad" (obligatoria). */
  readonly eligibilityConfirmed?: boolean;
  /** Convocatoria: experiencia en cuidado del agua (300–2000 al enviar). */
  readonly experience?: string | null;
  /** Convocatoria: motivación y cómo replicará lo aprendido (300–2000 al enviar). */
  readonly motivation?: string | null;
  /** Convocatoria: disponibilidad para viajar (asistencia presencial completa). Debe ser `true` para enviar si la convocatoria lo exige (`false` → `APPLICATION_NOT_ELIGIBLE`). */
  readonly canTravel?: boolean | null;
  /** Enlaces de evidencia (YouTube, Drive, redes), máximo 5. Reemplaza la lista completa. */
  readonly evidenceLinks?: string[];
  /** Términos (veracidad, asistencia, proyecto final, datos y pago del saldo / entrevista por Zoom en convocatorias; una postulación por cohorte). Obligatorio para enviar. */
  readonly termsAccepted?: boolean;
  /** `id` de la oferta (ficha HU-16 o "Becas disponibles" / "Convocatorias abiertas"): diplomado con beca → postulación a beca; convocatoria → postulación a convocatoria. */
  readonly offerId: Uuid;
}

export interface ApplicantDto {
  readonly fullName: string;
  /** No editable. */
  readonly email: string;
  /** WhatsApp con indicativo. */
  readonly phone: PhoneDto;
  readonly countryCode: string;
  readonly countryName: string;
  /** Territorio: estado/departamento. */
  readonly divisionName: string;
  readonly municipalityName: string;
  /** Moneda de cobro (país del perfil). */
  readonly currency: Currency;
}

export interface ApplicationAnswersDto {
  readonly age: number | null;
  readonly partnerCode: string | null;
  readonly organization: string | null;
  readonly organizationRole: string | null;
  /** Tipo de beca solicitado (antes `requestedLevel`). */
  readonly requestedScholarshipTypeId: Uuid | null;
  readonly requestedScholarshipType: ScholarshipTypeSummaryDto | null;
  readonly intentLetter: string | null;
  readonly eligibilityConfirmed: boolean;
  readonly experience: string | null;
  readonly motivation: string | null;
  readonly canTravel: boolean | null;
  readonly evidenceLinks: string[];
  readonly termsAccepted: boolean;
  readonly termsAcceptedAt: IsoDateTime | null;
}

export interface ApplicationDocumentDto {
  readonly id: Uuid;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  /** Ícono / previsualización. */
  readonly mediaType: EvidenceMediaType;
  readonly createdAt: IsoDateTime;
}

export interface FieldIssueDto {
  /** Campo del formulario (o `documents`). */
  readonly field: string;
  readonly code: ApplicationFieldIssueCode;
  readonly message: string;
}

export interface StatusHistoryItemDto {
  readonly status: ApplicationStatus;
  readonly at: IsoDateTime;
}

export interface FileLimitDto {
  readonly mimeTypes: string[];
  readonly maxBytes: number;
}

export interface ApplicationFormLimitsDto {
  readonly letterMinLength: number;
  readonly letterMaxLength: number;
  readonly answerMinLength: number;
  readonly answerMaxLength: number;
  /** Mínimo de archivos (0 en convocatorias: evidencia opcional). */
  readonly minFiles: number;
  readonly maxFiles: number;
  readonly maxLinks: number;
  readonly image: FileLimitDto;
  readonly video: FileLimitDto;
}

export interface ApplicationFormDto {
  readonly window: ApplicationWindowDto;
  /** Beca: tipos de beca activos del diplomado con monto estimado en tu moneda ("el tipo final lo asigna el equipo"; antes `levels`). Vacío en convocatorias. */
  readonly scholarshipTypes: OfferScholarshipTypeDto[];
  /** Costo de la oferta en tu moneda. */
  readonly price: MoneyDto | null;
  readonly eligibility: ApplicationEligibilityDto | null;
  /** Mostrar aviso de entrevista por Zoom: siempre en convocatorias; en becas si el tipo solicitado tiene `requiresInterview`. */
  readonly interviewNotice: boolean;
  readonly limits: ApplicationFormLimitsDto;
}

export interface ApplicationDetailDto {
  readonly id: Uuid;
  /** Folio (BEC-… beca, CONV-… convocatoria). Se muestra desde el envío. */
  readonly folio: string;
  readonly kind: ApplicationKind;
  /** Estado global (tabla enum → texto en la guía de la Fase 04). */
  readonly status: ApplicationStatus;
  readonly statusChangedAt: IsoDateTime;
  readonly offer: ApplicationOfferDto;
  /** Envío. */
  readonly submittedAt: IsoDateTime | null;
  /** Último guardado ("Borrador guardado · hh:mm"). */
  readonly updatedAt: IsoDateTime;
  /** Requiere acción (entrevista, pago o confirmación): destácala arriba con cuenta regresiva. */
  readonly requiresAction: boolean;
  /** Acción contextual (un botón). */
  readonly action: ApplicationActionDto;
  /** Línea de tiempo (vertical en mobile). */
  readonly timeline: TimelineStepDto[];
  /** Solo en "Entrevista agendada" (y como referencia después). */
  readonly interview: InterviewDto | null;
  /** Solo becas aprobadas: tipo solicitado y asignado, saldo y fecha límite. */
  readonly scholarshipResult: ScholarshipResultDto | null;
  /** Solo en "Aprobada – …": qué hacer y hasta cuándo. */
  readonly response: ApplicationResponseDeadlineDto | null;
  /** Borrador editable (ventana abierta y estado DRAFT). */
  readonly editable: boolean;
  /** Datos precargados del perfil (HU-14). */
  readonly applicant: ApplicantDto;
  readonly answers: ApplicationAnswersDto;
  readonly documents: ApplicationDocumentDto[];
  /** Pendientes para poder enviar (solo en borrador): validaciones en línea; mientras no esté vacío, "Enviar postulación" sigue deshabilitado. */
  readonly missingRequirements: FieldIssueDto[];
  /** Historial de estados con fecha y hora. */
  readonly history: StatusHistoryItemDto[];
  readonly form: ApplicationFormDto;
}

export interface UpdateApplicationRequestDto {
  /** WhatsApp con indicativo. Se precarga del perfil (HU-14); editable. */
  readonly phone?: PhoneDto;
  /** Edad (entero). Obligatoria en becas. */
  readonly age?: number | null;
  /** Código de iniciativa aliada (opcional; no aplica descuento). */
  readonly partnerCode?: string | null;
  /** Organización (obligatoria en convocatorias). */
  readonly organization?: string | null;
  /** Rol en la organización (obligatorio en convocatorias). */
  readonly organizationRole?: string | null;
  /** Beca: tipo de beca solicitado (antes `requestedLevel`). Solo los tipos activos del diplomado (`form.scholarshipTypes[].scholarshipTypeId`); otro → 400 `SCHOLARSHIP_TYPE_NOT_ENABLED`. Si el tipo tiene `requiresInterview`, habrá entrevista por Zoom. */
  readonly requestedScholarshipTypeId?: Uuid | null;
  /** Beca: carta de intención (800–4000 caracteres al enviar). */
  readonly intentLetter?: string | null;
  /** Convocatoria: "Confirmo que cumplo con la elegibilidad" (obligatoria). */
  readonly eligibilityConfirmed?: boolean;
  /** Convocatoria: experiencia en cuidado del agua (300–2000 al enviar). */
  readonly experience?: string | null;
  /** Convocatoria: motivación y cómo replicará lo aprendido (300–2000 al enviar). */
  readonly motivation?: string | null;
  /** Convocatoria: disponibilidad para viajar (asistencia presencial completa). Debe ser `true` para enviar si la convocatoria lo exige (`false` → `APPLICATION_NOT_ELIGIBLE`). */
  readonly canTravel?: boolean | null;
  /** Enlaces de evidencia (YouTube, Drive, redes), máximo 5. Reemplaza la lista completa. */
  readonly evidenceLinks?: string[];
  /** Términos (veracidad, asistencia, proyecto final, datos y pago del saldo / entrevista por Zoom en convocatorias; una postulación por cohorte). Obligatorio para enviar. */
  readonly termsAccepted?: boolean;
}

export interface EvidenceUploadRequestDto {
  readonly fileName: string;
  /** Content-Type exacto que enviarás en el PUT. */
  readonly contentType: EvidenceContentType;
  /** Tamaño en bytes (imágenes ≤ 10 MB; videos ≤ 100 MB). */
  readonly sizeBytes: number;
}

export interface ApplicationUploadUrlDto {
  readonly uploadUrl: string;
  readonly method: 'PUT';
  /** Headers obligatorios del PUT. */
  readonly headers: Record<string, unknown>;
  /** Envíala a `POST …/documents` para confirmar el archivo. */
  readonly key: string;
  readonly expiresAt: IsoDateTime;
}

export interface ConfirmDocumentRequestDto {
  /** `key` devuelta por `…/documents/upload-url`, tras hacer el PUT. */
  readonly key: string;
  /** Nombre a mostrar. */
  readonly fileName?: string;
}

export interface AccessUrlDto {
  readonly kind: ResourceKind;
  readonly url: string;
  /** Vencimiento de la URL firmada (null para enlaces externos). Al vencer, pide otra. */
  readonly expiresAt: IsoDateTime | null;
  readonly fileName: string | null;
}

export interface AdminApplicantDto {
  readonly userId: Uuid;
  readonly name: string;
  readonly email: string;
  readonly countryCode: string;
}

export interface AdminOfferRefDto {
  readonly id: Uuid;
  readonly name: string;
  readonly slug: string;
}

export interface AdminInterviewRefDto {
  readonly status: InterviewStatus;
  readonly startsAt: string;
}

export interface AdminApplicationListItemDto {
  readonly id: Uuid;
  readonly folio: string;
  readonly kind: ApplicationKind;
  readonly status: ApplicationStatus;
  readonly applicant: AdminApplicantDto;
  readonly offer: AdminOfferRefDto;
  /** Tipo de beca solicitado (antes `requestedLevel`). */
  readonly requestedScholarshipTypeId: Uuid | null;
  readonly requestedScholarshipType: ScholarshipTypeSummaryDto | null;
  /** Tipo de beca asignado (antes `assignedLevel`). */
  readonly assignedScholarshipTypeId: Uuid | null;
  /** `name` = nombre que tenía el tipo al aprobar. */
  readonly assignedScholarshipType: ScholarshipTypeSummaryDto | null;
  readonly assignedPercent: number | null;
  readonly submittedAt: string | null;
  /** Insignia "Requiere entrevista". */
  readonly requiresInterview: boolean;
  /** Entrevista vigente. */
  readonly interview: AdminInterviewRefDto | null;
  /** Número de evaluaciones del comité. */
  readonly evaluationCount: number;
  /** Mi evaluación (null = insignia "Sin mi evaluación"). */
  readonly myEvaluation: EvaluationRecommendation | null;
  /** Plazo de pago/confirmación. */
  readonly responseDueAt: string | null;
}

export interface AdminApplicationContactDto {
  readonly name: string;
  readonly email: string;
  readonly phoneCountryCode: string;
  readonly phoneNumber: string;
  readonly countryCode: string;
  readonly divisionName: string;
  readonly municipalityName: string;
  readonly age: number | null;
  readonly organization: string | null;
  readonly organizationRole: string | null;
  readonly partnerCode: string | null;
}

export interface AdminApplicationAnswersDto {
  /** Beca: carta de intención. */
  readonly intentLetter: string | null;
  /** Convocatoria: experiencia. */
  readonly experience: string | null;
  /** Convocatoria: motivación. */
  readonly motivation: string | null;
  /** Convocatoria: puede viajar. */
  readonly canTravel: boolean | null;
  readonly eligibilityConfirmed: boolean;
  readonly evidenceLinks: string[];
}

export interface AdminApplicationDocumentDto {
  readonly id: Uuid;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  /** URL firmada de descarga (~10 min). */
  readonly url: string;
  readonly expiresAt: string;
}

export interface AdminPersonRefDto {
  readonly id: Uuid;
  readonly fullName: string;
}

export interface AdminStatusEventDto {
  readonly fromStatus: ApplicationStatus | null;
  readonly toStatus: ApplicationStatus;
  readonly actorType: ActorType;
  readonly actor: AdminPersonRefDto | null;
  /** Nota interna (nunca visible al postulante). */
  readonly note: string | null;
  readonly at: string;
}

export interface AdminInterviewDto {
  readonly id: Uuid;
  readonly status: InterviewStatus;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly joinUrl: string;
  readonly completedAt: string | null;
  readonly scheduledBy: AdminPersonRefDto | null;
}

export interface AdminEvaluationDto {
  readonly id: Uuid;
  readonly evaluator: AdminPersonRefDto;
  readonly recommendation: EvaluationRecommendation;
  /** Tipo de beca sugerido (antes `suggestedLevel`). */
  readonly suggestedScholarshipTypeId: Uuid | null;
  readonly suggestedScholarshipType: ScholarshipTypeSummaryDto | null;
  readonly comment: string | null;
  readonly updatedAt: string;
}

export interface EvaluationSummaryDto {
  readonly approve: number;
  readonly notSelect: number;
  readonly unsure: number;
  readonly total: number;
  /** Tipo más sugerido (empate → el de menor %). */
  readonly mostSuggestedScholarshipTypeId: Uuid | null;
  /** Antes `mostSuggestedLevel`. */
  readonly mostSuggestedScholarshipType: ScholarshipTypeSummaryDto | null;
  readonly label: string;
}

export interface MoneyAmountDto {
  readonly amountCents: number;
  readonly currency: Currency;
}

export interface AdminScholarshipTypeOptionDto {
  readonly scholarshipTypeId: Uuid;
  /** Con el rango EFECTIVO en la oferta. `requiresInterview` exige entrevista "Realizada". */
  readonly scholarshipType: ScholarshipTypeSummaryDto;
  /** false = tipo desactivado (se puede asignar si la oferta ya lo tenía). */
  readonly active: boolean;
  /** Cupo global del tipo y propio de la oferta; `isFull` → no se puede asignar (409). */
  readonly quota: OfferScholarshipQuotaDto;
  /** Saldo con el % máximo del tipo en la moneda del postulante. */
  readonly balanceAtMaxPercent: MoneyAmountDto | null;
}

export interface AdminDecisionDto {
  /** Puedo registrar la decisión (permiso + estado). */
  readonly canDecide: boolean;
  readonly interviewRequired: boolean;
  /** Hay una entrevista "Realizada". */
  readonly hasCompletedInterview: boolean;
  /** `APPLICATION_INTERVIEW_REQUIRED` = "Esta postulación requiere entrevista por Zoom" (aplica a convocatorias siempre y a becas cuyo tipo asignado/solicitado tiene `requiresInterview`). */
  readonly blockedReason: string | null;
  /** Precio en la moneda del postulante. */
  readonly price: MoneyAmountDto | null;
  /** Tipos de beca habilitados en la oferta (antes `levels`). */
  readonly scholarshipTypes: AdminScholarshipTypeOptionDto[];
  readonly assignedScholarshipTypeId: Uuid | null;
  readonly assignedScholarshipType: ScholarshipTypeSummaryDto | null;
  readonly assignedPercent: number | null;
  readonly balance: MoneyAmountDto | null;
  readonly responseDueAt: string | null;
  readonly decidedAt: string | null;
  readonly decidedBy: AdminPersonRefDto | null;
  /** Nota interna de la decisión. */
  readonly decisionNote: string | null;
  /** Estado del correo de la decisión: `FAILED` → "Correo no enviado" + [Reintentar envío]. */
  readonly emailStatus: EmailStatus | null;
}

export interface AdminApplicationEmailDto {
  /** Id de la notificación (para reintentar). */
  readonly notificationId: Uuid;
  readonly type: NotificationType;
  readonly title: string;
  readonly emailStatus: EmailStatus;
  readonly emailSentAt: string | null;
  readonly createdAt: string;
}

export interface AdminApplicationDetailDto {
  readonly id: Uuid;
  readonly folio: string;
  readonly kind: ApplicationKind;
  readonly status: ApplicationStatus;
  readonly applicant: AdminApplicantDto;
  readonly offer: AdminOfferRefDto;
  /** Tipo de beca solicitado (antes `requestedLevel`). */
  readonly requestedScholarshipTypeId: Uuid | null;
  readonly requestedScholarshipType: ScholarshipTypeSummaryDto | null;
  /** Tipo de beca asignado (antes `assignedLevel`). */
  readonly assignedScholarshipTypeId: Uuid | null;
  /** `name` = nombre que tenía el tipo al aprobar. */
  readonly assignedScholarshipType: ScholarshipTypeSummaryDto | null;
  readonly assignedPercent: number | null;
  readonly submittedAt: string | null;
  /** Insignia "Requiere entrevista". */
  readonly requiresInterview: boolean;
  /** Entrevista vigente. */
  readonly interview: AdminInterviewRefDto | null;
  /** Número de evaluaciones del comité. */
  readonly evaluationCount: number;
  /** Mi evaluación (null = insignia "Sin mi evaluación"). */
  readonly myEvaluation: EvaluationRecommendation | null;
  /** Plazo de pago/confirmación. */
  readonly responseDueAt: string | null;
  readonly contact: AdminApplicationContactDto;
  readonly answers: AdminApplicationAnswersDto;
  /** Fotos/videos de evidencia. */
  readonly documents: AdminApplicationDocumentDto[];
  /** Historial (más antiguo primero). */
  readonly history: AdminStatusEventDto[];
  /** Entrevistas (más reciente primero). */
  readonly interviews: AdminInterviewDto[];
  readonly evaluations: AdminEvaluationDto[];
  readonly evaluationSummary: EvaluationSummaryDto;
  readonly myEvaluationDetail: AdminEvaluationDto | null;
  readonly decision: AdminDecisionDto;
  /** Avisos enviados al postulante. */
  readonly emails: AdminApplicationEmailDto[];
  /** [Anterior] en la bandeja. */
  readonly prevId: Uuid | null;
  /** [Siguiente] en la bandeja. */
  readonly nextId: Uuid | null;
  /** Se pasó a "En revisión" al abrir el detalle en esta petición. */
  readonly reviewStarted: boolean;
}

export interface UpsertEvaluationRequestDto {
  /** Aprobar / No seleccionar / Tengo dudas. */
  readonly recommendation: EvaluationRecommendation;
  /** Solo becas: tipo de beca sugerido, habilitado en la oferta (antes `suggestedLevel`). Otro → 400 `SCHOLARSHIP_TYPE_NOT_ENABLED`. */
  readonly suggestedScholarshipTypeId?: Uuid | null;
  readonly comment?: Record<string, unknown>;
}

export interface ScheduleInterviewRequestDto {
  readonly startsAt: string;
  readonly endsAt: string;
  /** URL https de zoom.us. */
  readonly joinUrl: string;
}

export interface CompleteInterviewRequestDto {
  /** "Realizada" o "No asistió". */
  readonly outcome?: InterviewOutcome;
}

export interface CancelInterviewRequestDto {
  readonly note?: string;
}

export interface DecisionPreviewDto {
  readonly decision: ApplicationDecision;
  /** Estado resultante. */
  readonly status: ApplicationStatus;
  readonly assignedScholarshipTypeId: Uuid | null;
  readonly assignedScholarshipType: ScholarshipTypeSummaryDto | null;
  readonly assignedPercent: number | null;
  /** Saldo a pagar (5,100 MXN con 50% sobre 10,200). */
  readonly balance: MoneyAmountDto | null;
  /** Plazo (7 días, sin superar el inicio). */
  readonly responseDueAt: string | null;
  readonly interviewRequired: boolean;
  /** `SCHOLARSHIP_TYPE_FULL` si el tipo ya no tiene cupo (global o de la oferta); `APPLICATION_INTERVIEW_REQUIRED` si falta la entrevista. */
  readonly blockedReason: string | null;
  /** Vista previa del correo/notificación (asunto y cuerpo). */
  readonly email: Record<string, unknown>;
}

export interface ApproveApplicationRequestDto {
  /** Obligatorio en becas (antes `assignedLevel`): tipo habilitado en la oferta (otro → 400 `SCHOLARSHIP_TYPE_NOT_ENABLED`). */
  readonly assignedScholarshipTypeId?: Uuid;
  /** Beca: % final, entero dentro del rango EFECTIVO del tipo en la oferta (fuera → 400 `INVALID`). Si el rango es fijo se toma solo. */
  readonly assignedPercent?: number;
  /** Nota interna (historial; nunca visible). */
  readonly note?: string;
  /** Párrafo editable que se agrega al correo y a la notificación del postulante. */
  readonly message?: string;
  /** Confirmación de la vista previa del correo (debe ser true). */
  readonly emailPreviewConfirmed: boolean;
}

export interface RejectApplicationRequestDto {
  /** Nota interna. */
  readonly note?: string;
  /** Párrafo editable del correo. */
  readonly message?: string;
  readonly emailPreviewConfirmed: boolean;
}

export interface RetryEmailRequestDto {
  /** Notificación a reenviar (por defecto, el último correo fallido de la postulación). */
  readonly notificationId?: Uuid;
}

export interface RetryEmailResultDto {
  readonly notificationId: Uuid;
  readonly emailStatus: EmailStatus;
  readonly emailSentAt: string | null;
}

export interface FunnelOfferDto {
  readonly id: Uuid;
  readonly name: string;
  readonly type: OfferType;
  readonly startsAt: string | null;
  /** Postulaciones enviadas. */
  readonly applications: number;
  /** Inscripciones que ocupan cupo (todas las vías). */
  readonly enrollments: number;
}

export interface FunnelStageDto {
  readonly key: FunnelStage;
  readonly label: string;
  readonly count: number;
  /** % sobre postulados (entero). */
  readonly percentOfApplied: number;
  /** % sobre la etapa anterior (entero). */
  readonly percentOfPrevious: number;
}

export interface OfferFunnelDto {
  readonly offer: FunnelOfferDto;
  /** Postulados → Aprobados → Con pago iniciado → Inscritos. */
  readonly stages: FunnelStageDto[];
  /** Inscritos ÷ postulados. */
  readonly conversionPercent: number;
  readonly inReview: number;
  /** "Aprobada – pendiente de pago". */
  readonly pendingPayment: number;
  /** "Aprobada – confirma tu participación". */
  readonly pendingConfirmation: number;
  /** Vencidas (pérdidas). */
  readonly expired: number;
  readonly notSelected: number;
  /** Plazo ≤ 2 días (alerta). */
  readonly dueSoon: number;
  /** Inscripciones sin postulación (pago directo, Moodle, gratuitas). */
  readonly directEnrollments: number;
}

export interface FollowUpPhoneDto {
  readonly countryCode: string;
  readonly number: string;
  /** null = sin teléfono válido con indicativo (botón WhatsApp deshabilitado). */
  readonly whatsappUrl: string | null;
}

export interface FollowUpItemDto {
  readonly applicationId: Uuid;
  readonly folio: string;
  readonly kind: ApplicationKind;
  readonly status: ApplicationStatus;
  readonly name: string;
  readonly email: string;
  readonly phone: FollowUpPhoneDto;
  readonly countryCode: string;
  /** Tipo de beca asignado (antes `assignedLevel`). */
  readonly assignedScholarshipTypeId: Uuid | null;
  readonly assignedScholarshipType: ScholarshipTypeSummaryDto | null;
  readonly assignedPercent: number | null;
  readonly balance: MoneyAmountDto | null;
  readonly responseDueAt: string | null;
  /** Días restantes (negativo = vencida). */
  readonly remainingDays: number | null;
  /** Vence en 2 días o menos (destacar arriba). */
  readonly dueSoon: boolean;
  /** Comprobante de transferencia "Pendiente de validación". */
  readonly pendingTransfer: boolean;
  /** "Con pago iniciado". */
  readonly paymentStarted: boolean;
  /** Último contacto (recordatorio, WhatsApp o nota). */
  readonly lastContactAt: string | null;
  readonly lastOutcome: FollowUpOutcome | null;
  /** Se puede enviar recordatorio (máx. 1 cada 24 h). */
  readonly canRemind: boolean;
  /** Cuándo vuelve a habilitarse el recordatorio. */
  readonly remindAvailableAt: string | null;
}

export interface CloseEnrollmentRequestDto {
  readonly reason?: string;
}

export interface CloseEnrollmentResultDto {
  readonly offerId: Uuid;
  readonly enrollmentClosesAt: string;
}

export interface FollowUpTimelineItemDto {
  readonly kind: FollowUpTimelineKind;
  readonly at: string;
  readonly title: string;
  readonly detail: string | null;
  readonly outcome: FollowUpOutcome | null;
  /** Autor (equipo). */
  readonly author: AdminPersonRefDto | null;
}

export interface FollowUpDetailDto {
  readonly applicationId: Uuid;
  readonly folio: string;
  readonly kind: ApplicationKind;
  readonly status: ApplicationStatus;
  readonly name: string;
  readonly email: string;
  readonly phone: FollowUpPhoneDto;
  readonly countryCode: string;
  /** Tipo de beca asignado (antes `assignedLevel`). */
  readonly assignedScholarshipTypeId: Uuid | null;
  readonly assignedScholarshipType: ScholarshipTypeSummaryDto | null;
  readonly assignedPercent: number | null;
  readonly balance: MoneyAmountDto | null;
  readonly responseDueAt: string | null;
  /** Días restantes (negativo = vencida). */
  readonly remainingDays: number | null;
  /** Vence en 2 días o menos (destacar arriba). */
  readonly dueSoon: boolean;
  /** Comprobante de transferencia "Pendiente de validación". */
  readonly pendingTransfer: boolean;
  /** "Con pago iniciado". */
  readonly paymentStarted: boolean;
  /** Último contacto (recordatorio, WhatsApp o nota). */
  readonly lastContactAt: string | null;
  readonly lastOutcome: FollowUpOutcome | null;
  /** Se puede enviar recordatorio (máx. 1 cada 24 h). */
  readonly canRemind: boolean;
  /** Cuándo vuelve a habilitarse el recordatorio. */
  readonly remindAvailableAt: string | null;
  /** Más reciente primero. */
  readonly timeline: FollowUpTimelineItemDto[];
}

export interface FollowUpNoteDto {
  readonly id: Uuid;
  readonly kind: FollowUpNoteKind;
  readonly outcome: FollowUpOutcome | null;
  readonly body: string;
  readonly author: AdminPersonRefDto | null;
  readonly createdAt: string;
}

export interface FollowUpNotesDto {
  /** Más reciente primero. */
  readonly data: FollowUpNoteDto[];
}

export interface CreateFollowUpNoteRequestDto {
  readonly body: string;
  /** Sin respuesta / Pagará pronto / Solicita cuotas / Desiste. */
  readonly outcome?: FollowUpOutcome;
}

export interface ReminderResultDto {
  readonly sentAt: string;
  /** Próximo recordatorio posible. */
  readonly nextAvailableAt: string;
  readonly emailStatus: EmailStatus | null;
  /** Nota automática registrada. */
  readonly note: FollowUpNoteDto;
}

export interface WhatsappRequestDto {
  /** Plantilla editable con {nombre}, {saldo}, {link_pago}. Omitir = plantilla por defecto. */
  readonly template?: string;
}

export interface WhatsappResultDto {
  /** Abrir en otra pestaña. */
  readonly url: string;
  readonly text: string;
  /** Nota automática registrada. */
  readonly note: FollowUpNoteDto;
}

export interface ExtendDeadlineRequestDto {
  /** Nueva fecha límite (futura, ≤ inicio de clases). */
  readonly responseDueAt: string;
  readonly reason: string;
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

export interface SessionRecordingDto {
  /** `AVAILABLE` [Ver grabación]; `AFTER_SESSION` "Disponible después de la sesión"; `PENDING` "Grabación pendiente"; `NOT_APPLICABLE` sin grabación. */
  readonly state: RecordingState;
  /** Enlace externo. */
  readonly url: string | null;
}

export interface SessionAttendanceDto {
  readonly session: AttendanceSessionChipDto;
  readonly summary: AttendanceSummaryDto;
  /** Filas filtradas (status, countryCode, q). */
  readonly rows: SessionAttendanceRowDto[];
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

export interface AdminSessionModuleRefDto {
  readonly id: Uuid;
  /** "Módulo N" (orden actual de los módulos). */
  readonly number: number;
  readonly title: string;
}

export interface AdminSessionFlagsDto {
  /** Reprogramada (tiene hora original). */
  readonly edited: boolean;
  readonly cancelled: boolean;
  /** En línea sin enlace de participante ("Sin enlace"). */
  readonly missingLink: boolean;
  /** En línea, ya terminó y sin grabación ("Grabación pendiente"). */
  readonly recordingPending: boolean;
}

export interface AdminSessionAttendanceCountDto {
  /** Registros de asistencia de la sesión. */
  readonly registered: number;
  /** Inscritos vigentes de la oferta (ACTIVE, COMPLETED, SUSPENDED). */
  readonly enrolled: number;
}

export interface AdminSessionDto {
  readonly id: Uuid;
  readonly offerId: Uuid;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly status: SessionStatus;
  /** Chip de HU-30 (Programada / Registro abierto / Cerrada / Cancelada). */
  readonly state: AdminSessionState;
  readonly category: CalendarCategory;
  readonly module: AdminSessionModuleRefDto | null;
  /** Enlace de participante. */
  readonly joinUrl: string | null;
  /** Enlace de ANFITRIÓN (solo panel; nunca al participante). */
  readonly hostUrl: string | null;
  readonly recordingUrl: string | null;
  readonly recordingPublishedAt: string | null;
  /** Override de la ventana (h); null = la de la oferta. */
  readonly attendanceWindowHours: number | null;
  /** Ventana efectiva (h). */
  readonly effectiveAttendanceWindowHours: number;
  /** Hora original si se reprogramó. */
  readonly originalStartsAt: string | null;
  /** Motivo de la reprogramación/cancelación. */
  readonly changeReason: string | null;
  readonly cancelledAt: string | null;
  readonly flags: AdminSessionFlagsDto;
  readonly attendance: AdminSessionAttendanceCountDto;
}

export interface AdminSessionListDto {
  readonly data: AdminSessionDto[];
}

export interface ScheduleRuleBodyDto {
  /** Días ISO (1 = lunes … 7 = domingo). */
  readonly weekdays: string[];
  /** Inicio en hora CDMX (HH:mm). */
  readonly startTime: string;
  /** Fin en hora CDMX (HH:mm), posterior al inicio. */
  readonly endTime: string;
  /** Fechas CDMX que se omiten sin reprogramar (recesos). */
  readonly excludedDates?: string[];
  /** Omitir festivos oficiales de México. */
  readonly excludeMexicanHolidays?: boolean;
}

export interface GenerateSessionsRequestDto {
  /** Regla (paso "Regla" + "Excepciones"). Omitir = la regla guardada en la oferta (HU-27 paso 3). Si se envía y se confirma, se guarda en la oferta. */
  readonly rule?: ScheduleRuleBodyDto;
  /** Primer día (CDMX). Default: inicio de la oferta. Dentro del periodo de la oferta. */
  readonly startDate?: string;
  /** Último día (CDMX, inclusivo). Default: fin de la oferta. */
  readonly endDate?: string;
  /** Enlace recurrente de participante (zoom.us o meet.google.com; solo en línea). */
  readonly joinUrl?: string;
  /** Enlace recurrente de anfitrión (zoom.us o meet.google.com). */
  readonly hostUrl?: string;
  /** Repartir las sesiones entre los módulos en orden. */
  readonly assignModules?: boolean;
  /** Fechas importantes automáticas a crear/actualizar (solo las que existen en la oferta). */
  readonly importantDates?: ImportantDateKind[];
}

export interface SessionPreviewItemDto {
  /** Fecha CDMX. */
  readonly date: string;
  readonly startsAt: string;
  readonly endsAt: string;
  /** Nueva / Excluida / Conflicto. */
  readonly status: SessionPreviewStatus;
  /** Receso manual o festivo de México. */
  readonly exclusionReason: SessionExclusionReason | null;
  readonly module: AdminSessionModuleRefDto | null;
}

export interface SessionPreviewSummaryDto {
  /** Sesiones nuevas. */
  readonly sessionCount: number;
  /** Horas de las sesiones nuevas. */
  readonly newHours: number;
  /** Horas de las sesiones ya existentes (no canceladas). */
  readonly existingHours: number;
  /** Total de la oferta tras crear (existentes + nuevas). */
  readonly totalHours: number;
  readonly excludedCount: number;
  readonly conflictCount: number;
  readonly label: string;
}

export interface ImportantDatePreviewDto {
  readonly kind: ImportantDateKind;
  readonly title: string;
  readonly startsAt: string;
  readonly audience: LibraryAudience;
  /** Ya existe (se actualizará). */
  readonly exists: boolean;
}

export interface SessionPreviewDto {
  readonly items: SessionPreviewItemDto[];
  readonly summary: SessionPreviewSummaryDto;
  /** Bloquean "Crear sesiones". */
  readonly violations: 'COURSE_MAX_HOURS_EXCEEDED'[];
  /** Solo advertencia. */
  readonly warnings: 'DIPLOMA_HOURS_MISMATCH'[];
  /** "Crear sesiones" habilitado. */
  readonly canConfirm: boolean;
  /** Motivo del bloqueo ("Los cursos tienen una duración máxima de 9 horas"). */
  readonly blockedReason: string | null;
  readonly importantDates: ImportantDatePreviewDto[];
}

export interface GenerateSessionsResultDto {
  readonly createdSessions: number;
  /** Fechas importantes creadas o actualizadas. */
  readonly importantDates: number;
  readonly message: string;
  readonly sessions: AdminSessionDto[];
}

export interface CreateSessionRequestDto {
  readonly startsAt: string;
  readonly endsAt: string;
  /** Módulo de la misma oferta. */
  readonly moduleId?: Uuid;
  /** Default: categoría de la oferta. */
  readonly category?: CalendarCategory;
  readonly joinUrl?: string;
  readonly hostUrl?: string;
}

export interface UpdateSessionRequestDto {
  /** null = sin módulo. */
  readonly moduleId?: Uuid | null;
  readonly category?: CalendarCategory;
  /** Por sesión (zoom.us o meet.google.com). null = quitar. */
  readonly joinUrl?: string | null;
  readonly hostUrl?: string | null;
  /** HU-28: enlace https de la grabación (Zoom Cloud, YouTube no listado, Vimeo, Drive). null = quitar. */
  readonly recordingUrl?: string | null;
  /** Override de la ventana (h); null = la de la oferta. */
  readonly attendanceWindowHours?: number | null;
  /** "Notificar a inscritos" al publicar la grabación. */
  readonly notifyRecording?: boolean;
}

export interface SessionChangeResultDto {
  readonly session: AdminSessionDto;
  /** Personas notificadas (portal + correo). */
  readonly notifiedCount: number;
}

export interface RescheduleSessionRequestDto {
  readonly startsAt: string;
  readonly endsAt: string;
  /** Motivo obligatorio (se envía a los inscritos). */
  readonly reason: string;
}

export interface CancelSessionRequestDto {
  /** Motivo obligatorio (se envía a los inscritos). */
  readonly reason: string;
}

export interface AttendanceSessionChipDto {
  readonly sessionId: Uuid;
  readonly startsAt: string;
  readonly endsAt: string;
  readonly state: AdminSessionState;
  /** Apertura del registro (fin de la sesión). */
  readonly opensAt: string;
  /** Cierre del registro. */
  readonly closesAt: string;
  readonly registered: number;
  readonly total: number;
  readonly percent: number;
}

export interface AttendanceSessionChipsDto {
  readonly data: AttendanceSessionChipDto[];
}

export interface ParticipantAttendanceRowDto {
  readonly userId: Uuid;
  readonly fullName: string;
  readonly email: string;
  readonly countryCode: string;
  readonly origin: OfferOrigin;
  readonly enrollmentStatus: EnrollmentStatus;
  readonly attended: number;
  /** Sesiones ya realizadas (no canceladas). */
  readonly heldSessions: number;
  /** null si aún no hay sesiones realizadas. */
  readonly percent: number | null;
  /** Alerta bajo 80% (solo visual). */
  readonly belowThreshold: boolean;
}

export interface ParticipantAttendanceDto {
  readonly heldSessions: number;
  /** Umbral de alerta (%). */
  readonly thresholdPercent: number;
  readonly rows: ParticipantAttendanceRowDto[];
}

export interface AttendanceSummaryDto {
  readonly registered: number;
  /** Inscritos vigentes (sin filtros). */
  readonly total: number;
  readonly percent: number;
  readonly label: string;
}

export interface AttendancePersonRefDto {
  readonly id: Uuid;
  readonly fullName: string;
}

export interface SessionAttendanceRowDto {
  readonly userId: Uuid;
  readonly fullName: string;
  readonly email: string;
  readonly countryCode: string;
  /** NAS o "Vía Moodle". */
  readonly origin: OfferOrigin;
  readonly enrollmentStatus: EnrollmentStatus;
  readonly status: AttendanceStatus;
  readonly registeredAt: string | null;
  /** Participante / Manual. */
  readonly source: AttendanceSource | null;
  readonly comment: string | null;
  /** Quién la marcó (manual). */
  readonly recordedBy: AttendancePersonRefDto | null;
  /** Motivo de la marca manual. */
  readonly manualReason: string | null;
}

export interface MarkAttendanceRequestDto {
  /** Personas (1–200). Selección múltiple o "Pasar lista en sitio". */
  readonly userIds: Uuid[];
  /** Motivo obligatorio. */
  readonly reason: string;
}

export interface MarkAttendanceResultDto {
  readonly marked: number;
  /** Ya estaban registradas (se omiten). */
  readonly alreadyRegistered: number;
}

export interface UnmarkAttendanceResultDto {
  readonly unmarked: number;
}

export interface RemindAttendanceResultDto {
  /** Personas pendientes notificadas (máx. un recordatorio por día). */
  readonly notified: number;
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
  /** `CLASSROOM` → Aula (`offerId`); `OFFER` → ficha `/escuela/oferta/{slug}`; `APPLICATION` (Fase 04, entrevistas) → mi postulación `/portal/postulaciones/{applicationId}`. */
  readonly kind: CalendarLinkKind;
  readonly offerId: Uuid | null;
  readonly slug: string | null;
  /** Fase 04: postulación de la entrevista (`kind = APPLICATION`). */
  readonly applicationId: Uuid | null;
}

export interface CalendarItemDto {
  readonly id: Uuid;
  /** `SESSION` = clase generada desde el horario (no editable); `EVENT` = evento manual o fecha importante; `ACTIVITY` = fecha de una actividad de módulo (HU-08, "Fecha importante"); `APPLICATION` = entrevista por Zoom de una postulación (Fase 04, "Fecha importante"). */
  readonly source: CalendarItemSource;
  /** Tipo: SESSION, ACTIVITY_DUE, INTERVIEW (entrevista de postulación, Fase 04), MANUAL (webinar/encuentro) o fecha importante automática (ENROLLMENT_OPENS, ENROLLMENT_CLOSES, OFFER_STARTS, SCHOLARSHIP_DEADLINE, FINAL_PROJECT). */
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

export interface AdminCalendarOfferRefDto {
  readonly id: Uuid;
  readonly name: string;
}

export interface AdminCalendarItemDto {
  readonly source: AdminCalendarSource;
  /** Id de la sesión o del evento. */
  readonly id: Uuid;
  readonly kind: AdminCalendarItemKind;
  readonly title: string;
  /** Formación (azul), Territorio (verde), Comunidad (naranja), Eventos (morado), Fechas importantes (rojo). */
  readonly category: CalendarCategory;
  readonly startsAt: string;
  readonly endsAt: string | null;
  readonly allDay: boolean;
  readonly status: SessionStatus;
  readonly offer: AdminCalendarOfferRefDto | null;
  /** Solo eventos. */
  readonly audience: LibraryAudience | null;
  /** Sesión reprogramada (ícono "editada"). */
  readonly edited: boolean;
  /** En línea sin enlace (ícono "sin enlace"). */
  readonly missingLink: boolean;
}

export interface AdminCalendarDto {
  readonly data: AdminCalendarItemDto[];
}

export interface AdminCalendarEventDto {
  readonly id: Uuid;
  readonly kind: CalendarEventKind;
  readonly title: string;
  readonly description: string | null;
  readonly category: CalendarCategory;
  readonly audience: LibraryAudience;
  readonly offer: AdminCalendarOfferRefDto | null;
  readonly startsAt: string;
  readonly endsAt: string | null;
  readonly allDay: boolean;
  readonly location: string | null;
  readonly joinUrl: string | null;
  readonly status: SessionStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateCalendarEventRequestDto {
  readonly title: string;
  readonly description?: string;
  /** Default Eventos (morado). */
  readonly category?: CalendarCategory;
  /** Todas las personas registradas o solo inscritos de `offerId`. */
  readonly audience: LibraryAudience;
  /** Obligatoria con OFFER_ENROLLED; opcional ("Ver oferta") con ALL_REGISTERED. */
  readonly offerId?: Uuid;
  readonly startsAt: string;
  readonly endsAt?: string;
  readonly allDay?: boolean;
  readonly location?: string;
  /** Enlace https (solo lo ve la audiencia). */
  readonly joinUrl?: string;
}

export interface UpdateCalendarEventRequestDto {
  readonly title?: string;
  readonly description?: string | null;
  readonly category?: CalendarCategory;
  readonly audience?: LibraryAudience;
  readonly offerId?: Uuid | null;
  readonly startsAt?: string;
  readonly endsAt?: string | null;
  readonly allDay?: boolean;
  readonly location?: string | null;
  readonly joinUrl?: string | null;
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

export interface ApplicationsWidgetDto {
  /** Postulación más reciente de este tipo (mismo estado que "Mis postulaciones"). null → invitar a postular (enlace a Becas / Convocatorias). */
  readonly latest: ApplicationCardDto | null;
  /** Postulaciones de este tipo que requieren acción. */
  readonly actionRequired: number;
  /** Becas / convocatorias con postulación abierta ahora. */
  readonly openCount: number;
  /** Convocatorias abiertas publicadas desde tu última visita a "Convocatorias abiertas" (todas si nunca la abriste). En Becas siempre 0. */
  readonly newCount: number;
}

export interface PaymentOfferRefDto {
  readonly id: Uuid;
  readonly slug: string;
  readonly name: string;
  readonly type: OfferType;
  readonly cohortLabel: string | null;
  readonly startsAt: IsoDateTime | null;
  readonly endsAt: IsoDateTime | null;
}

export interface CardDto {
  readonly brand: string | null;
  /** Últimos 4 dígitos. */
  readonly last4: string | null;
}

export interface PaymentAlertDto {
  /** INSTALLMENT_FAILED "Cobro fallido" ([Actualizar tarjeta] / [Pagar ahora]) · PLAN_DELINQUENT "En mora" · TRANSFER_REJECTED "Rechazada" ([Subir comprobante]) · TRANSFER_PENDING "Pendiente de validación" · INSTALLMENT_UPCOMING "Próximo cobro" (informativo). */
  readonly type: PaymentAlertType;
  readonly offer: PaymentOfferRefDto;
  readonly amount: MoneyDto;
  /** Fecha del cobro / fecha límite / fallo. */
  readonly date: IsoDateTime | null;
  readonly planId: Uuid | null;
  readonly paymentId: Uuid | null;
  readonly applicationId: Uuid | null;
  readonly card: CardDto | null;
}

export interface DashboardPaymentsDto {
  /** Cuotas que se cobrarán en los próximos 7 días (monto, fecha y tarjeta): aviso informativo. */
  readonly upcomingInstallments: PaymentAlertDto[];
  /** Cobro fallido / En mora / transferencia rechazada: banner destacado → Mis pagos. */
  readonly alerts: PaymentAlertDto[];
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
  /** Widget Becas (Fase 04, siempre visible): estado de la postulación más relevante (`latest`, misma tarjeta y textos que "Mis postulaciones") → enlaza a Mis postulaciones. `latest = null` → invitar a postular ("Postula a una beca", `openCount` becas abiertas). */
  readonly scholarships: ApplicationsWidgetDto | null;
  /** Widget Convocatorias (Fase 04): `newCount` = convocatorias abiertas nuevas desde tu última visita a "Convocatorias abiertas" y estado de mi postulación (`latest`). */
  readonly openCalls: ApplicationsWidgetDto | null;
  /** Fase 05: aviso informativo de cuota próxima (7 días: monto, fecha del cobro automático y tarjeta, HU-06/24) y banners de cobro fallido / en mora / transferencia (→ Mis pagos). */
  readonly payments: DashboardPaymentsDto | null;
  /** Bloques que no se pudieron cargar: muestra "No se pudo cargar esta información" + reintento (el reintento puede usar el endpoint propio del bloque: /me/enrollments, /me/calendar, /library, /me/notifications/unread-count, /me/applications?kind=…, /me/payments/summary). */
  readonly failedBlocks: DashboardBlock[];
}

export interface QuoteApplicationDto {
  readonly id: Uuid;
  readonly folio: string;
  readonly kind: ApplicationKind;
  readonly status: ApplicationStatus;
  /** Tipo de beca asignado (antes `assignedLevel`). */
  readonly assignedScholarshipTypeId: Uuid | null;
  /** `name` = nombre del tipo al aprobar. */
  readonly assignedScholarshipType: ScholarshipTypeSummaryDto | null;
  readonly assignedPercent: number | null;
  /** Monto original. */
  readonly originalAmount: MoneyDto | null;
  /** Fecha límite. */
  readonly dueAt: IsoDateTime | null;
}

export interface QuoteMethodDto {
  readonly method: PaymentMethod;
  readonly available: boolean;
  /** Tarjeta: PAYMENTS_NOT_CONFIGURED. Transferencia: NOT_MEXICO / CURRENCY_NOT_MXN / NOT_A_BALANCE / NOT_CONFIGURED (NOT_MEXICO → no mostrar la opción "Solo México"). */
  readonly reason: string | null;
}

export interface PlanInstallmentDto {
  readonly id: Uuid;
  readonly sequence: number;
  readonly amount: MoneyDto;
  readonly dueAt: IsoDateTime;
  /** SCHEDULED "Programada" · PROCESSING "En cobro" · PAID "Pagada" · FAILED "Fallida" · CANCELLED. */
  readonly status: InstallmentStatus;
  readonly paidAt: IsoDateTime | null;
  /** Intentos de cobro automático realizados. */
  readonly attempts: number;
  /** Próximo reintento automático. */
  readonly nextRetryAt: IsoDateTime | null;
  readonly failureMessage: string | null;
}

export interface QuoteInstallmentOptionDto {
  readonly count: number;
  readonly available: boolean;
  /** LAST_INSTALLMENT_AFTER_END: la última cuota caería después del fin de la oferta. */
  readonly reason: 'LAST_INSTALLMENT_AFTER_END' | null;
  /** Monto por cuota (la última lleva el ajuste). */
  readonly perInstallment: MoneyDto;
  /** Calendario: la 1.ª "Se cobra al confirmar". */
  readonly schedule: PlanInstallmentDto[];
}

export interface QuoteInstallmentsDto {
  /** Máximo de la oferta. */
  readonly max: number;
  readonly options: QuoteInstallmentOptionDto[];
}

export interface BankTransferDetailsDto {
  readonly accountHolder: string;
  readonly bankName: string;
  readonly clabe: string;
  /** Referencia única (pégala en el concepto). */
  readonly reference: string;
  /** Monto a transferir en MXN. */
  readonly amount: MoneyDto;
}

export interface QuoteBlockerDto {
  /** Mismo `code` que respondería `POST /me/payments/checkout`: ENROLLMENT_ALREADY_EXISTS ("Ya estás inscrito · Ir a mi aula"), OFFER_SOLD_OUT ("Cupo agotado"), ENROLLMENT_CLOSED, PAYMENT_NOT_ALLOWED, PAYMENT_BALANCE_NOT_DUE, APPLICATION_DEADLINE_PASSED, PAYMENT_TRANSFER_PENDING. */
  readonly code: string;
  /** Datos del motivo (p. ej. `reason`: ENROLLMENT_NOT_OPEN_YET / ENROLLMENT_CLOSED / OFFER_FINISHED / SOLD_OUT / SCHOLARSHIP_NOT_OPEN_YET / SCHOLARSHIP_CLOSED / PRICE_NOT_AVAILABLE / TRANSFER_PENDING_VALIDATION / MOODLE / OPEN_CALL / FREE / PRICE_NOT_AVAILABLE / PAY_BALANCE). */
  readonly meta: {
    readonly [key: string]: unknown;
  };
}

export interface InstallmentRefDto {
  readonly sequence: number;
  readonly count: number;
}

export interface TransferInfoDto {
  /** Referencia única (concepto del SPEI). */
  readonly reference: string;
  /** Monto declarado por la persona. */
  readonly declaredAmount: MoneyDto | null;
  readonly paidOn: string | null;
  readonly trackingKey: string | null;
  readonly proofFileName: string | null;
  readonly submittedAt: IsoDateTime | null;
  readonly reviewedAt: IsoDateTime | null;
  /** Si "Rechazada": ILLEGIBLE "Comprobante ilegible" · AMOUNT_MISMATCH "El monto no coincide" · NOT_FOUND "No encontramos la transferencia" · OTHER "Otro motivo" (ver `rejectionNote`). */
  readonly rejectionReason: TransferRejectionReason | null;
  readonly rejectionNote: string | null;
}

export interface CheckoutLinkDto {
  readonly url: string;
  readonly expiresAt: IsoDateTime;
}

export interface PaymentDto {
  readonly id: Uuid;
  /** Folio del recibo. */
  readonly folio: string;
  /** FULL_PRICE "Pago completo" · BALANCE "Saldo tras beca" (o "Pago de convocatoria") · INSTALLMENT "Cuota n de N" (ver `installment`). */
  readonly concept: PaymentConcept;
  /** Concepto ya redactado (recibo). */
  readonly conceptLabel: string;
  readonly installment: InstallmentRefDto | null;
  readonly method: PaymentMethod;
  /** Ver tabla de textos en docs/frontend/fase-05-pagos.md. */
  readonly status: PaymentStatus;
  readonly amount: MoneyDto;
  /** Reembolsado (si aplica). */
  readonly refunded: MoneyDto | null;
  readonly offer: PaymentOfferRefDto;
  readonly applicationId: Uuid | null;
  readonly planId: Uuid | null;
  readonly card: CardDto | null;
  readonly transfer: TransferInfoDto | null;
  /** "Descargar comprobante" (solo Pagado o Validada): `GET /me/payments/{id}/receipt`. */
  readonly receiptAvailable: boolean;
  /** Recibo de Stripe (opcional, además del PDF propio). */
  readonly stripeReceiptUrl: string | null;
  /** Motivo del rechazo. */
  readonly failureMessage: string | null;
  /** Solo PENDING con checkout abierto: [Continuar pago] → redirigir a `url`. */
  readonly checkout: CheckoutLinkDto | null;
  readonly createdAt: IsoDateTime;
  readonly paidAt: IsoDateTime | null;
  readonly failedAt: IsoDateTime | null;
}

export interface PaymentQuoteDto {
  readonly concept: PlanConcept;
  readonly offer: PaymentOfferRefDto;
  /** Solo saldo tras beca. */
  readonly application: QuoteApplicationDto | null;
  /** Total a pagar (calculado por el servidor). */
  readonly amount: MoneyDto | null;
  readonly methods: QuoteMethodDto[];
  /** null si la oferta no tiene cuotas. */
  readonly installments: QuoteInstallmentsDto | null;
  /** Solo si la transferencia está disponible. */
  readonly bankTransfer: BankTransferDetailsDto | null;
  /** Si no se puede pagar: motivo (botón deshabilitado). */
  readonly blocker: QuoteBlockerDto | null;
  /** Checkout abierto → [Continuar pago]. */
  readonly openCheckout: PaymentDto | null;
  /** Comprobante en validación o el último rechazado. */
  readonly latestTransfer: PaymentDto | null;
}

export interface StartCheckoutRequestDto {
  /** HU-22/24: oferta a pagar (precio completo). Envía `offerId` O `applicationId`. */
  readonly offerId?: Uuid;
  /** HU-23/24: postulación "Aprobada – pendiente de pago" (saldo tras beca). */
  readonly applicationId?: Uuid;
  /** HU-24: número de cuotas (2–4, según `quote.installments.options[].available`). Omitir = pago único. La 1.ª cuota se cobra en Stripe Checkout y guarda la tarjeta para las siguientes. */
  readonly installmentCount?: number;
  /** HU-22: "Acepto los términos de inscripción y la política de cancelación y reembolso". Debe ser true. */
  readonly termsAccepted: boolean;
  /** HU-24: "Autorizo a la Escuela a cobrar automáticamente en mi tarjeta las cuotas". Obligatorio (true) cuando hay `installmentCount`. */
  readonly autoDebitAuthorized?: boolean;
}

export interface CheckoutSessionDto {
  /** Consulta su estado con `GET /me/payments/{paymentId}`. */
  readonly paymentId: Uuid;
  /** Redirige aquí. */
  readonly checkoutUrl: string;
  readonly expiresAt: IsoDateTime;
  /** true = se reutilizó el checkout abierto (Continuar pago). */
  readonly reused: boolean;
}

export interface PaymentPlanDto {
  readonly id: Uuid;
  /** CURRENT "Al día" · PAST_DUE "Cobro fallido" · DELINQUENT "En mora" · COMPLETED "Completado" · CANCELLED "Cancelado" · PENDING_ACTIVATION (checkout de la 1.ª cuota sin completar). */
  readonly status: PaymentPlanStatus;
  readonly concept: PlanConcept;
  readonly offer: PaymentOfferRefDto;
  readonly total: MoneyDto;
  readonly installmentCount: number;
  /** "1 de 3 cuotas pagadas". */
  readonly paidCount: number;
  readonly paidAmount: MoneyDto;
  /** Pendiente (incluye cuotas fallidas). */
  readonly pendingAmount: MoneyDto;
  /** Próximo cobro. */
  readonly nextCharge: PlanInstallmentDto | null;
  /** Tarjeta asociada (marca y últimos 4). */
  readonly card: CardDto | null;
  /** Primer cobro fallido sin regularizar. */
  readonly failedSince: IsoDateTime | null;
  /** Cuándo pasa (o pasó) a "En mora" si no se regulariza. */
  readonly delinquencyAt: IsoDateTime | null;
  readonly daysSinceFailure: number | null;
  /** Acceso al Aula suspendido por mora. */
  readonly accessSuspended: boolean;
  /** [Pagar ahora]: hay cuotas fallidas (`POST /me/payments/plans/{id}/pay-now`). */
  readonly canPayNow: boolean;
  /** [Actualizar tarjeta]: plan vigente (`POST /me/payments/plans/{id}/card-update`). */
  readonly canUpdateCard: boolean;
  readonly installments: PlanInstallmentDto[];
  readonly activatedAt: IsoDateTime | null;
}

export interface PaymentsSummaryDto {
  /** Planes vigentes (arriba en Mis pagos). */
  readonly activePlans: PaymentPlanDto[];
  /** Avisos destacados (fallidos, mora, transferencias). */
  readonly alerts: PaymentAlertDto[];
  readonly hasPayments: boolean;
  /** Sin pagos pero con formaciones Moodle: "Tus formaciones de Moodle se pagaron fuera". */
  readonly moodleOnly: boolean;
}

export interface PaymentPlansDto {
  readonly data: PaymentPlanDto[];
}

export interface CardUpdateSessionDto {
  readonly checkoutUrl: string;
  readonly expiresAt: IsoDateTime;
}

export interface TransferUploadUrlRequestDto {
  /** Postulación "Aprobada – pendiente de pago". */
  readonly applicationId: Uuid;
  readonly fileName: string;
  /** Content-Type exacto que enviarás en el PUT. */
  readonly contentType: TransferProofContentType;
  /** Tamaño en bytes (≤ 5 MB). */
  readonly sizeBytes: number;
}

export interface TransferUploadUrlDto {
  readonly uploadUrl: string;
  readonly method: string;
  readonly headers: Record<string, unknown>;
  readonly key: string;
  readonly expiresAt: IsoDateTime;
}

export interface SubmitTransferRequestDto {
  readonly applicationId: Uuid;
  /** `key` devuelta por `…/transfers/upload-url`, tras hacer el PUT. */
  readonly key: string;
  readonly fileName?: string;
  /** Monto que la persona declara haber transferido (centavos MXN). Solo informativo: el saldo esperado lo calcula el servidor y el equipo captura el monto recibido al validar. */
  readonly declaredAmountCents: number;
  /** Fecha de la transferencia (YYYY-MM-DD, ≤ hoy). */
  readonly paidOn: string;
  /** Clave de rastreo SPEI (letras y números). */
  readonly trackingKey: string;
}

export interface AdminPayerDto {
  readonly id: Uuid;
  readonly fullName: string;
  readonly email: string;
  readonly countryCode: string;
  /** Teléfono con indicativo ("Contactar"). */
  readonly phone: string | null;
}

export interface AdminStripeRefsDto {
  /** ID de Stripe (HU-33). */
  readonly paymentIntentId: string | null;
  readonly checkoutSessionId: string | null;
  readonly chargeId: string | null;
  readonly receiptUrl: string | null;
}

export interface AdminUserRefDto {
  readonly id: Uuid;
  readonly fullName: string;
}

export interface AdminTransferInfoDto {
  /** Referencia única por postulación. */
  readonly reference: string;
  /** Saldo esperado (MXN). */
  readonly expectedAmount: MoneyDto;
  /** Monto que declaró la persona. */
  readonly declaredAmount: MoneyDto | null;
  /** Fecha declarada. */
  readonly declaredPaidOn: string | null;
  readonly trackingKey: string | null;
  readonly proofFileName: string | null;
  readonly proofMimeType: string | null;
  readonly proofSizeBytes: number | null;
  /** Envío del comprobante. */
  readonly submittedAt: IsoDateTime | null;
  /** Capturado por el equipo al validar. */
  readonly receivedAmount: MoneyDto | null;
  readonly receivedOn: string | null;
  readonly reviewedAt: IsoDateTime | null;
  readonly reviewedBy: AdminUserRefDto | null;
  readonly rejectionReason: TransferRejectionReason | null;
  readonly rejectionNote: string | null;
}

export interface AdminPaymentDto {
  readonly id: Uuid;
  readonly folio: string;
  readonly concept: PaymentConcept;
  /** Completo / saldo tras beca / cuota n de N. */
  readonly conceptLabel: string;
  readonly installment: InstallmentRefDto | null;
  readonly method: PaymentMethod;
  readonly status: PaymentStatus;
  readonly amount: MoneyDto;
  /** Reembolsado (confirmado). 0 si no hay. */
  readonly refunded: MoneyDto;
  /** Aún reembolsable (pagado − reembolsado − en proceso). */
  readonly refundable: MoneyDto;
  readonly payer: AdminPayerDto;
  readonly offer: PaymentOfferRefDto;
  readonly applicationId: Uuid | null;
  readonly enrollmentId: Uuid | null;
  readonly planId: Uuid | null;
  readonly card: CardDto | null;
  readonly stripe: AdminStripeRefsDto;
  /** Solo transferencias. */
  readonly transfer: AdminTransferInfoDto | null;
  readonly failureMessage: string | null;
  readonly createdAt: IsoDateTime;
  readonly paidAt: IsoDateTime | null;
  readonly failedAt: IsoDateTime | null;
  readonly refundedAt: IsoDateTime | null;
}

export interface CurrencyTotalsDto {
  readonly currency: Currency;
  /** Pagos con tarjeta pagados + transferencias validadas. */
  readonly collected: MoneyDto;
  readonly refunded: MoneyDto;
  /** Cobrado − reembolsado. */
  readonly net: MoneyDto;
  readonly paymentCount: number;
}

export interface PendingTransfersSummaryDto {
  /** Contador de la pestaña "Transferencias por conciliar". */
  readonly count: number;
  readonly amount: MoneyDto;
}

export interface PlansSummaryDto {
  /** Cobro fallido. */
  readonly pastDue: number;
  /** En mora. */
  readonly delinquent: number;
  /** Con acceso suspendido. */
  readonly accessSuspended: number;
}

export interface AdminPaymentsSummaryDto {
  /** Siempre MXN y USD por separado (nunca se suman). */
  readonly currencies: CurrencyTotalsDto[];
  readonly pendingTransfers: PendingTransfersSummaryDto;
  readonly plans: PlansSummaryDto;
  /** Reembolsos "en proceso" en Stripe. */
  readonly pendingRefunds: number;
}

export interface AdminRefundDto {
  readonly id: Uuid;
  readonly paymentId: Uuid;
  readonly paymentFolio: string;
  readonly amount: MoneyDto;
  /** CARD = vía Stripe; BANK_TRANSFER = registrado (hecho fuera). */
  readonly method: PaymentMethod;
  readonly status: RefundStatus;
  readonly reason: string;
  readonly stripeRefundId: string | null;
  readonly failureMessage: string | null;
  readonly createdBy: AdminUserRefDto | null;
  readonly payer: AdminPayerDto;
  readonly offer: PaymentOfferRefDto;
  readonly createdAt: IsoDateTime;
}

export interface AdminPaymentActionsDto {
  /** [Reembolsar] (requiere payments.manage). */
  readonly canRefund: boolean;
  /** [Validar] / [Rechazar] transferencia pendiente. */
  readonly canReview: boolean;
}

export interface AdminPaymentDetailDto {
  readonly id: Uuid;
  readonly folio: string;
  readonly concept: PaymentConcept;
  /** Completo / saldo tras beca / cuota n de N. */
  readonly conceptLabel: string;
  readonly installment: InstallmentRefDto | null;
  readonly method: PaymentMethod;
  readonly status: PaymentStatus;
  readonly amount: MoneyDto;
  /** Reembolsado (confirmado). 0 si no hay. */
  readonly refunded: MoneyDto;
  /** Aún reembolsable (pagado − reembolsado − en proceso). */
  readonly refundable: MoneyDto;
  readonly payer: AdminPayerDto;
  readonly offer: PaymentOfferRefDto;
  readonly applicationId: Uuid | null;
  readonly enrollmentId: Uuid | null;
  readonly planId: Uuid | null;
  readonly card: CardDto | null;
  readonly stripe: AdminStripeRefsDto;
  /** Solo transferencias. */
  readonly transfer: AdminTransferInfoDto | null;
  readonly failureMessage: string | null;
  readonly createdAt: IsoDateTime;
  readonly paidAt: IsoDateTime | null;
  readonly failedAt: IsoDateTime | null;
  readonly refundedAt: IsoDateTime | null;
  readonly refunds: AdminRefundDto[];
  readonly actions: AdminPaymentActionsDto;
}

export interface RefundRequestDto {
  /** Monto a reembolsar (centavos, en la moneda del pago). ≤ pagado − reembolsado − en proceso. */
  readonly amountCents: number;
  readonly reason: string;
}

export interface ValidateTransferRequestDto {
  /** Monto recibido en la cuenta (centavos MXN). Menor al saldo esperado → 422 `PAYMENT_TRANSFER_AMOUNT_MISMATCH` (`meta.differenceCents`): solo se puede rechazar. */
  readonly receivedAmountCents: number;
  /** Fecha en que se recibió (YYYY-MM-DD, ≤ hoy). */
  readonly receivedOn: string;
}

export interface RejectTransferRequestDto {
  /** Ilegible / Monto no coincide / No encontrado / Otro. */
  readonly reason: TransferRejectionReason;
  /** Detalle visible para la persona. Obligatorio con `OTHER`. */
  readonly note?: string;
}

export interface AdminPaymentPlanDto {
  readonly id: Uuid;
  /** CURRENT "Al día" · PAST_DUE "Cobro fallido" · DELINQUENT "En mora" · COMPLETED "Completado" · CANCELLED "Cancelado" · PENDING_ACTIVATION (checkout de la 1.ª cuota sin completar). */
  readonly status: PaymentPlanStatus;
  readonly concept: PlanConcept;
  readonly offer: PaymentOfferRefDto;
  readonly total: MoneyDto;
  readonly installmentCount: number;
  /** "1 de 3 cuotas pagadas". */
  readonly paidCount: number;
  readonly paidAmount: MoneyDto;
  /** Pendiente (incluye cuotas fallidas). */
  readonly pendingAmount: MoneyDto;
  /** Próximo cobro. */
  readonly nextCharge: PlanInstallmentDto | null;
  /** Tarjeta asociada (marca y últimos 4). */
  readonly card: CardDto | null;
  /** Primer cobro fallido sin regularizar. */
  readonly failedSince: IsoDateTime | null;
  /** Cuándo pasa (o pasó) a "En mora" si no se regulariza. */
  readonly delinquencyAt: IsoDateTime | null;
  readonly daysSinceFailure: number | null;
  /** Acceso al Aula suspendido por mora. */
  readonly accessSuspended: boolean;
  /** [Pagar ahora]: hay cuotas fallidas (`POST /me/payments/plans/{id}/pay-now`). */
  readonly canPayNow: boolean;
  /** [Actualizar tarjeta]: plan vigente (`POST /me/payments/plans/{id}/card-update`). */
  readonly canUpdateCard: boolean;
  readonly installments: PlanInstallmentDto[];
  readonly activatedAt: IsoDateTime | null;
  readonly payer: AdminPayerDto;
  readonly enrollmentId: Uuid | null;
  readonly enrollmentStatus: EnrollmentStatus | null;
  /** Acceso suspendido por mora (automática o manual). */
  readonly accessSuspendedAt: IsoDateTime | null;
  readonly delinquentAt: IsoDateTime | null;
  readonly cancelledAt: IsoDateTime | null;
  readonly cancelReason: string | null;
  /** Acciones habilitadas por estado (los botones requieren además `payments.manage`): RETRY (Cobro fallido/En mora), MARK_DELINQUENT (Cobro fallido), SUSPEND_ACCESS (solo En mora), RESTORE_ACCESS (suspendido), CANCEL. */
  readonly availableActions: PaymentPlanAction[];
}

export interface PlanActionReasonRequestDto {
  /** Motivo obligatorio (queda en la auditoría y en la inscripción/plan). */
  readonly reason: string;
}

export interface AuditActorDto {
  /** null si la cuenta se borró. */
  readonly id: Uuid | null;
  readonly email: string;
  readonly fullName: string | null;
}

export interface AuditLogDto {
  readonly id: Uuid;
  readonly actor: AuditActorDto;
  /** Acción estable `dominio.verbo`. */
  readonly action: string;
  readonly entityType: string;
  readonly entityId: string | null;
  readonly summary: string;
  /** `{ before, after }` solo con los campos que cambiaron (textos largos recortados). */
  readonly changes: {
    readonly [key: string]: unknown;
  } | null;
  readonly createdAt: string;
}
