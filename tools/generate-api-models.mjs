#!/usr/bin/env node
// Genera el tipado TypeScript de la API a partir de su especificación OpenAPI.
// Sin dependencias.
//
//   models.generated.ts      DTO (components.schemas), enums con nombre y alias.
//   operations.generated.ts  Query de cada endpoint y el mapa `ApiOperations`
//                            (método, ruta, query, cuerpo y respuesta).
//
// Uso:
//   node tools/generate-api-models.mjs            regenera los archivos
//   node tools/generate-api-models.mjs --check    falla si no están al día
//   node tools/generate-api-models.mjs --spec otra.json
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import prettier from 'prettier';

const args = process.argv.slice(2);
const check = args.includes('--check');
const specIndex = args.indexOf('--spec');
const input = specIndex >= 0 ? args[specIndex + 1] : 'docs/api/openapi.json';
const outDir = 'projects/data-access/src/lib/api';

const spec = JSON.parse(readFileSync(input, 'utf8'));
const schemas = spec.components?.schemas ?? {};

// --- Nombres de los enums inline ---------------------------------------------
// La API declara la mayoría de los enums dentro de cada propiedad. Aquí se les
// da un nombre estable según sus valores, para reutilizarlos en filtros, selects
// y etiquetas. Un enum nuevo sin nombre hace fallar la generación.
const ENUM_NAMES = {
  'MXN|USD': 'Currency',
  'PAID|FREE|EXTERNAL_ENROLLMENT': 'PricingKind',
  'PROFILE|TIMEZONE|DEFAULT': 'CurrencySource',
  'DIPLOMA|COURSE|WORKSHOP|EVENT|OPEN_CALL': 'OfferType',
  'ONLINE_LIVE|IN_PERSON': 'OfferModality',
  'NAS|MOODLE': 'OfferOrigin',
  'ENROLLMENT_OPEN|UPCOMING|ENROLLMENT_CLOSED|FINISHED': 'OfferAvailability',
  'OPEN|UPCOMING|CLOSED': 'WindowStatus',
  'OFFER|CATALOG|NONE': 'TopicLinkKind',
  'SPECIALIZED_TRAINING|ONLINE_COURSES_WORKSHOPS|HANDS_ON_LEARNING': 'TopicGroup',
  'ENROLLMENT_OPEN|UPCOMING|ENROLLMENT_CLOSED|OPEN_CALL|NO_SCHEDULED_DATES': 'TopicAvailability',
  'TRAINING|TERRITORY|COMMUNITY|EVENTS|IMPORTANT_DATES': 'CalendarCategory',
  'PENDING_PAYMENT|ACTIVE|COMPLETED|SUSPENDED|CANCELLED': 'EnrollmentStatus',
  'ACTIVE|COMPLETED': 'FormationPhase',
  'ACTIVE|COMPLETED|ALL': 'FormationPhaseFilter',
  'HAS_NEXT_SESSION|NO_UPCOMING_SESSIONS|FINISHED': 'ScheduleStatus',
  'TRAINING|APPLICATIONS|PAYMENTS|GENERAL': 'NotificationCategory',
  'NORMAL|HIGH': 'NotificationPriority',
  'NOT_YET|OPEN|LINK_PENDING|ENDED|CANCELLED|IN_PERSON': 'SessionJoinState',
  'AVAILABLE|AFTER_SESSION|PENDING|NOT_APPLICABLE': 'RecordingState',
  'PENDING|REGISTERED|NOT_REGISTERED|NOT_APPLICABLE': 'AttendanceStatus',
  'NOT_OPEN_YET|OPEN|CLOSED|NOT_APPLICABLE': 'AttendanceWindowState',
  'PARTICIPANT|MANUAL': 'AttendanceSource',
  'SCHEDULED|CANCELLED': 'SessionStatus',
  'ZOOM|GOOGLE_MEET|OTHER': 'SessionPlatform',
  'UPCOMING|PAST': 'SessionScope',
  'UPCOMING|IN_PROGRESS|COMPLETED': 'ModuleStatus',
  'DISABLED|OPEN|CLOSED': 'SubmissionState',
  'PRESENTATION|PRE_READING|ACTIVITY': 'MaterialResourceType',
  'FILE|EXTERNAL_LINK': 'ResourceKind',
  'CLASSROOM|OFFER|APPLICATION|NONE': 'CalendarLinkKind',
  'SESSION|EVENT|ACTIVITY|APPLICATION': 'CalendarItemSource',
  'PDF|ARTICLE|BOOK|VIDEO|AUDIO|EXTERNAL|COURSE_MATERIAL': 'LibraryItemType',
  'ALL_REGISTERED|OFFER_ENROLLED': 'LibraryAudience',
  'nextActivity|formations|upcomingEvents|recommendedResources|notifications|scholarships|openCalls|payments':
    'DashboardBlock',

  // --- Postulaciones (becas y convocatorias) ---
  'SCHOLARSHIP|OPEN_CALL': 'ApplicationKind',
  'COUNTRY_NOT_ELIGIBLE|TRAVEL_REQUIRED': 'ApplicationIneligibilityReason',
  'CONTINUE_DRAFT|JOIN_INTERVIEW|PAY_BALANCE|CONTINUE_PAYMENT|UPLOAD_TRANSFER_PROOF|PAYMENT_IN_VALIDATION|CONFIRM_PARTICIPATION|GO_TO_CLASSROOM|VIEW':
    'ApplicationActionType',
  'WINDOW_CLOSED|INTERVIEW_NOT_OPEN_YET|INTERVIEW_LINK_PENDING|INTERVIEW_ENDED|TRANSFER_PENDING_VALIDATION':
    'ApplicationActionReason',
  'SUBMITTED|IN_REVIEW|INTERVIEW|RESULT|PAYMENT|CONFIRMATION|ENROLLED': 'ApplicationTimelineStep',
  'DONE|CURRENT|UPCOMING|SKIPPED|FAILED': 'TimelineStepState',
  'SCHEDULED|COMPLETED|CANCELLED|NO_SHOW': 'InterviewStatus',
  'COMPLETED|NO_SHOW': 'InterviewOutcome',
  'PAYMENT|CONFIRMATION': 'ResponseDeadlineKind',
  'IMAGE|VIDEO': 'EvidenceMediaType',
  'REQUIRED|MIN_LENGTH|MAX_LENGTH|MIN_FILES|MUST_ACCEPT|SCHOLARSHIP_TYPE_NOT_ENABLED|SCHOLARSHIP_TYPE_FULL|NOT_APPLICABLE':
    'ApplicationFieldIssueCode',
  'image/jpeg|image/png|image/heic|video/mp4|video/quicktime': 'EvidenceContentType',
  'APPROVE|NOT_SELECT|UNSURE': 'EvaluationRecommendation',
  'APPROVE|REJECT': 'ApplicationDecision',
  'PARTICIPANT|STAFF|SYSTEM': 'ActorType',
  'NOT_REQUESTED|PENDING|SENT|FAILED': 'EmailStatus',
  'SUBMITTED_ASC|SUBMITTED_DESC|DUE_ASC': 'ApplicationSort',
  // Filtro de la bandeja: todos los estados salvo el borrador.
  'SUBMITTED|IN_REVIEW|INTERVIEW_SCHEDULED|APPROVED_PENDING_PAYMENT|APPROVED_PENDING_CONFIRMATION|ENROLLED|NOT_SELECTED|EXPIRED':
    'SubmittedApplicationStatus',
  // --- Seguimiento ---
  'APPLIED|APPROVED|PAYMENT_STARTED|ENROLLED': 'FunnelStage',
  'NO_RESPONSE|WILL_PAY_SOON|REQUESTS_INSTALLMENTS|WITHDRAWS': 'FollowUpOutcome',
  'STATUS_CHANGE|NOTE|REMINDER_SENT|WHATSAPP_CONTACT|PAYMENT': 'FollowUpTimelineKind',
  'NOTE|REMINDER_SENT|WHATSAPP_CONTACT': 'FollowUpNoteKind',
  'PENDING|EXPIRED': 'FollowUpTab',
  // --- Panel: ofertas, contenido y sesiones ---
  'admin.access|offers.read|offers.write|offers.publish|attendance.read|attendance.write|applications.read|applications.evaluate|applications.interview|applications.decide|followup.read|followup.manage|payments.read|payments.manage|users.manage|audit.read|site.write|scholarship_types.write':
    'Permission',
  'DRAFT|PUBLISHED|ARCHIVED': 'PublicationStatus',
  'DRAFT|PUBLISHED|ENROLLMENT_CLOSED|FINISHED|ARCHIVED': 'AdminOfferStatus',
  'REQUIRED|MIN_LENGTH|MAX_LENGTH|INVALID|NOT_APPLICABLE|COURSE_MAX_HOURS_EXCEEDED|DIPLOMA_HOURS_MISMATCH':
    'WizardIssueCode',
  'GENERAL|CONTENT|SCHEDULE|ORIGIN_PRICING|RESOURCES|ATTENDANCE|WHATSAPP': 'WizardStep',
  'OFFER_COVER|OFFER_CAROUSEL|TEACHER_PHOTO': 'ImageUploadPurpose',
  'image/jpeg|image/png|image/webp': 'ImageContentType',
  'FILE|URL|LIBRARY|NONE': 'ResourceSource',
  'HIDDEN|PUBLISHED': 'Visibility',
  'SCHEDULED|REGISTRATION_OPEN|CLOSED|CANCELLED': 'AdminSessionState',
  'ENROLLMENT_OPENS|ENROLLMENT_CLOSES|OFFER_STARTS|SCHOLARSHIP_DEADLINE|FINAL_PROJECT':
    'ImportantDateKind',
  'NEW|EXCLUDED|CONFLICT': 'SessionPreviewStatus',
  'MANUAL|MX_HOLIDAY': 'SessionExclusionReason',
  'SESSION|EVENT': 'AdminCalendarSource',
  'SESSION|MANUAL|ENROLLMENT_OPENS|ENROLLMENT_CLOSES|OFFER_STARTS|SCHOLARSHIP_DEADLINE|FINAL_PROJECT':
    'AdminCalendarItemKind',
  'MANUAL|ENROLLMENT_OPENS|ENROLLMENT_CLOSES|OFFER_STARTS|SCHOLARSHIP_DEADLINE|FINAL_PROJECT':
    'CalendarEventKind',
  'STARTS_AT_ASC|STARTS_AT_DESC': 'CalendarSort',
  'UPDATED_DESC|STARTS_AT_ASC|NAME_ASC': 'AdminOfferSort',
  'NAME_ASC|CREATED_DESC|LAST_LOGIN_DESC': 'AdminUserSort',
  // --- Pagos ---
  'INSTALLMENT_FAILED|PLAN_DELINQUENT|TRANSFER_REJECTED|TRANSFER_PENDING|INSTALLMENT_UPCOMING':
    'PaymentAlertType',
  'CARD|BANK_TRANSFER': 'PaymentMethod',
  'SCHEDULED|PROCESSING|PAID|FAILED|CANCELLED': 'InstallmentStatus',
  'ILLEGIBLE|AMOUNT_MISMATCH|NOT_FOUND|OTHER': 'TransferRejectionReason',
  'FULL_PRICE|BALANCE|INSTALLMENT': 'PaymentConcept',
  'FULL_PRICE|BALANCE': 'PlanConcept',
  'PENDING|PAID|FAILED|CANCELLED|REFUNDED|PENDING_VALIDATION|VALIDATED|REJECTED': 'PaymentStatus',
  'PENDING_ACTIVATION|CURRENT|PAST_DUE|DELINQUENT|COMPLETED|CANCELLED': 'PaymentPlanStatus',
  'application/pdf|image/jpeg|image/png': 'TransferProofContentType',
  'PENDING|SUCCEEDED|FAILED': 'RefundStatus',
  'RETRY|MARK_DELINQUENT|SUSPEND_ACCESS|RESTORE_ACCESS|CANCEL': 'PaymentPlanAction',
  'CREATED_DESC|CREATED_ASC|PAID_DESC|AMOUNT_DESC': 'PaymentSort',
  'PENDING_VALIDATION|VALIDATED|REJECTED|REFUNDED': 'TransferStatus',
  'FAILED_SINCE_ASC|CREATED_DESC': 'PaymentPlanSort',
};
// Enums nombrados por la propiedad donde aparecen (valores largos o variables).
const ENUM_NAMES_BY_PROPERTY = {
  'ApplicationCardDto.status': 'ApplicationStatus',
  'ErrorResponseDto.code': 'ErrorCode',
  'OfferSummaryDto.publicTopic': 'OfferTopic',
  'OfferActionDto.type': 'OfferActionType',
  'OfferActionDto.reason': 'OfferActionReason',
  'NotificationDto.type': 'NotificationType',
  'FinalProjectUploadRequestDto.contentType': 'FinalProjectContentType',
  'CalendarItemDto.kind': 'CalendarItemKind',
};

// Los enums que la API ya declara con nombre (Role, UserStatus…) se reutilizan
// cuando sus valores aparecen inline en otro esquema.
const NAMED_SCHEMA_ENUMS = new Set();
for (const [name, schema] of Object.entries(schemas)) {
  const values = schema.enum?.filter((v) => v !== null);
  if (values?.length > 1) {
    ENUM_NAMES[values.join('|')] ??= name;
    NAMED_SCHEMA_ENUMS.add(name);
  }
}

// Los nombrados por propiedad aplican a todas las apariciones de esos valores.
for (const [where, name] of Object.entries(ENUM_NAMES_BY_PROPERTY)) {
  const [schemaName, prop] = where.split('.');
  let node = schemas[schemaName]?.properties?.[prop];
  while (node && !node.enum) node = typeof node.type === 'object' ? node.type : node.items;
  if (!node) throw new Error(`No existe ${where} en la especificación.`);
  ENUM_NAMES[node.enum.filter((v) => v !== null).join('|')] = name;
}

// Formatos de texto con alias legible (siguen siendo `string`).
const FORMAT_ALIASES = {
  'date-time': ['IsoDateTime', 'Fecha y hora ISO 8601 (p. ej. `2026-03-01T15:00:00.000Z`).'],
  date: ['IsoDate', 'Fecha ISO 8601 sin hora (`2026-03-01`).'],
  uuid: ['Uuid', 'Identificador UUID.'],
};

// --- Utilidades ----------------------------------------------------------------
const refName = (ref) => ref.split('/').pop();
const literal = (v) => (typeof v === 'string' ? `'${v.replace(/'/g, "\\'")}'` : String(v));
const doc = (text, indent = '') =>
  text
    ? `${indent}/** ${String(text)
        .replace(/\*\//g, '*\\/')
        .replace(/\s*\n+\s*/g, ' ')
        .trim()} */\n`
    : '';
const wrap = (t) => (/[|&]/.test(t) ? `(${t})` : t);
const pascal = (s) => s.replace(/(^|[_\s-]+)(\w)/g, (_, __, c) => c.toUpperCase());
const constName = (name) => name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase() + '_VALUES';

const namedEnums = new Map(); // nombre → valores
const usedFormats = new Set();
const missing = [];

function enumName(values, where) {
  const signature = values.join('|');
  const name = ENUM_NAMES[signature];
  if (!name) {
    missing.push(`${where}: ${signature}`);
    return null;
  }
  const previous = namedEnums.get(name);
  if (previous && previous.join('|') !== signature) {
    throw new Error(`El enum ${name} tiene valores distintos en ${where}.`);
  }
  if (NAMED_SCHEMA_ENUMS.has(name)) {
    return name; // ya se declara como esquema
  }
  if (schemas[name]) {
    throw new Error(`El nombre ${name} choca con un esquema de la API.`);
  }
  namedEnums.set(name, values);
  return name;
}

/** Convierte un esquema en una expresión de tipo TypeScript. */
function typeOf(schema, where = '') {
  if (!schema) return 'unknown';
  // Algunos esquemas traen el subesquema dentro de `type`.
  if (schema.type && typeof schema.type === 'object')
    return withNull(typeOf(schema.type, where), schema);
  if (schema.$ref) return withNull(refName(schema.$ref), schema);
  if (schema.allOf) {
    const parts = schema.allOf.map((s) => typeOf(s, where));
    return withNull(parts.length === 1 ? parts[0] : parts.join(' & '), schema);
  }
  if (schema.oneOf || schema.anyOf) {
    return withNull(
      (schema.oneOf ?? schema.anyOf).map((s) => typeOf(s, where)).join(' | '),
      schema,
    );
  }
  if (schema.enum) {
    const values = schema.enum.filter((v) => v !== null);
    const name = values.length > 1 ? enumName(values, where) : null;
    const nullable = schema.nullable || schema.enum.includes(null);
    return (name ?? values.map(literal).join(' | ')) + (nullable ? ' | null' : '');
  }
  if (schema.const !== undefined) return literal(schema.const);
  const types = Array.isArray(schema.type) ? schema.type : [schema.type];
  const mapped = types.map((t) => {
    switch (t) {
      case 'string': {
        const alias = FORMAT_ALIASES[schema.format];
        if (alias) usedFormats.add(schema.format);
        return alias ? alias[0] : 'string';
      }
      case 'number':
      case 'integer':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'null':
        return 'null';
      case 'array':
        return `${wrap(typeOf(schema.items, where))}[]`;
      case 'object':
        return objectType(schema, '', where);
      default:
        return schema.properties ? objectType(schema, '', where) : 'unknown';
    }
  });
  return withNull(mapped.join(' | '), schema);
}

const withNull = (t, schema) => (schema.nullable ? `${t} | null` : t);

function objectType(schema, indent = '', where = '') {
  const props = schema.properties ?? {};
  const required = new Set(schema.required ?? []);
  const lines = Object.entries(props).map(([name, prop]) => {
    const key = /^[A-Za-z_$][\w$]*$/.test(name) ? name : `'${name}'`;
    const opt = required.has(name) ? '' : '?';
    return `${doc(prop.description, indent + '  ')}${indent}  readonly ${key}${opt}: ${typeOf(prop, `${where}.${name}`)};`;
  });
  if (schema.additionalProperties) {
    const extra =
      schema.additionalProperties === true ? 'unknown' : typeOf(schema.additionalProperties, where);
    lines.push(`${indent}  readonly [key: string]: ${extra};`);
  }
  return lines.length ? `{\n${lines.join('\n')}\n${indent}}` : 'Record<string, unknown>';
}

const header = (what) => `// ⚠️ Archivo generado por tools/generate-api-models.mjs a partir de
// ${input} (${spec.info?.title ?? 'API'} ${spec.info?.version ?? ''}).
// ${what} No editar a mano: regenerar con \`npm run api:models\`.
/* eslint-disable */\n\n`;

// --- models.generated.ts ---------------------------------------------------------
let body = '';
for (const [name, schema] of Object.entries(schemas)) {
  body += doc(schema.description);
  const isObject = schema.type === 'object' || (schema.properties && !schema.enum);
  if (isObject) {
    body += `export interface ${name} ${objectType(schema, '', name)}\n\n`;
  } else if (schema.enum) {
    const values = schema.enum.filter((v) => v !== null);
    body += `export const ${constName(name)} = [${values.map(literal).join(', ')}] as const;\n`;
    body += `export type ${name} = (typeof ${constName(name)})[number];\n\n`;
  } else {
    body += `export type ${name} = ${typeOf(schema, name)};\n\n`;
  }
}

// --- operations.generated.ts -------------------------------------------------------
const operations = [];
const queryTypes = [];
const modelImports = new Set();
const collect = (t) =>
  (t.match(/\b[A-Z][A-Za-z0-9]*\b/g) ?? []).forEach((n) => modelImports.add(n));

/** Respuesta `{ data: T[], meta: PaginationMetaDto }` → `Paginated<T>`. */
function responseType(schema, where) {
  const props = schema?.properties;
  if (props?.data?.type === 'array' && props.meta?.$ref?.endsWith('/PaginationMetaDto')) {
    const item = typeOf(props.data.items, where);
    collect(item);
    return `Paginated<${item}>`;
  }
  if (!schema) return 'void';
  const t = typeOf(schema, where);
  collect(t);
  return t;
}

for (const [path, ops] of Object.entries(spec.paths ?? {})) {
  for (const [method, op] of Object.entries(ops)) {
    if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue;
    const id = op.operationId ?? `${method}_${path}`;
    const where = pascal(id);
    const params = op.parameters ?? [];

    // Query: solo parámetros `in: query` (las cabeceras las pone la app).
    const query = params.filter((p) => p.in === 'query');
    let queryName = 'never';
    if (query.length) {
      queryName = `${where}Query`;
      const lines = query.map((p) => {
        let t = typeOf(p.schema, `${where}?${p.name}`);
        if (t.endsWith('[]')) t = `readonly ${t}`;
        collect(t);
        const opt = p.required ? '' : '?';
        return `${doc(p.description, '  ')}  readonly ${p.name}${opt}: ${t};`;
      });
      queryTypes.push(
        `/** Query de \`${method.toUpperCase()} ${path}\`. */\nexport interface ${queryName} {\n${lines.join('\n')}\n}\n`,
      );
    }

    const pathParams = params.filter((p) => p.in === 'path').map((p) => p.name);
    const json = op.requestBody?.content?.['application/json']?.schema;
    const requestBody = json ? typeOf(json, where) : 'never';
    if (json) collect(requestBody);
    const success = Object.entries(op.responses ?? {}).find(([code]) => code.startsWith('2'));
    const response = responseType(success?.[1]?.content?.['application/json']?.schema, where);

    operations.push(
      `${doc(op.summary, '  ')}  readonly ${id}: {\n` +
        `    readonly method: '${method.toUpperCase()}';\n` +
        `    readonly path: '${path}';\n` +
        `    readonly pathParams: ${pathParams.length ? pathParams.map(literal).join(' | ') : 'never'};\n` +
        `    readonly query: ${queryName};\n` +
        `    readonly body: ${requestBody};\n` +
        `    readonly response: ${response};\n` +
        `  };`,
    );
  }
}

if (missing.length) {
  console.error('✘ Enums sin nombre (agrégalos a ENUM_NAMES o ENUM_NAMES_BY_PROPERTY):');
  missing.forEach((m) => console.error('  - ' + m));
  process.exit(1);
}

// Enums y alias al inicio de los modelos.
let prelude = '';
for (const format of usedFormats) {
  const [alias, description] = FORMAT_ALIASES[format];
  prelude += `/** ${description} */\nexport type ${alias} = string;\n\n`;
}
for (const [name, values] of [...namedEnums].sort(([a], [b]) => a.localeCompare(b))) {
  prelude += `export const ${constName(name)} = [${values.map(literal).join(', ')}] as const;\n`;
  prelude += `export type ${name} = (typeof ${constName(name)})[number];\n\n`;
}

const models = header('DTO, enums y alias de la API.') + prelude + body;

const declared = new Set([
  ...Object.keys(schemas),
  ...namedEnums.keys(),
  ...[...usedFormats].map((f) => FORMAT_ALIASES[f][0]),
]);
const imports = [...modelImports].filter((n) => declared.has(n)).sort();
const operationsFile =
  header('Query y contrato de cada endpoint.') +
  `import type { Paginated } from './api-client';\n` +
  `import type {\n${imports.map((n) => `  ${n},`).join('\n')}\n} from './models.generated';\n\n` +
  queryTypes.join('\n') +
  `\n/**\n * Contrato de cada endpoint, indexado por \`operationId\`. Los servicios lo usan\n` +
  ` * (\`ApiResponse<'Offers_list'>\`) para que un cambio en la API se note al compilar.\n */\n` +
  `export interface ApiOperations {\n${operations.join('\n')}\n}\n\n` +
  `export type ApiOperationId = keyof ApiOperations;\n` +
  `/** Respuesta correcta de un endpoint. */\n` +
  `export type ApiResponse<Id extends ApiOperationId> = ApiOperations[Id]['response'];\n` +
  `/** Cuerpo JSON de un endpoint. */\n` +
  `export type ApiBody<Id extends ApiOperationId> = ApiOperations[Id]['body'];\n` +
  `/** Query de un endpoint. */\n` +
  `export type ApiQuery<Id extends ApiOperationId> = ApiOperations[Id]['query'];\n`;

// --- Escritura / comprobación -------------------------------------------------------------
const files = {
  [join(outDir, 'models.generated.ts')]: models,
  [join(outDir, 'operations.generated.ts')]: operationsFile,
};
let stale = false;
for (const [file, raw] of Object.entries(files)) {
  const options = (await prettier.resolveConfig(file)) ?? {};
  const content = await prettier.format(raw, { ...options, filepath: file });
  if (check) {
    const current = existsSync(file) ? readFileSync(file, 'utf8') : '';
    if (current !== content) {
      console.error(`✘ ${file} no está al día con ${input}.`);
      stale = true;
    }
  } else {
    writeFileSync(file, content);
  }
}
if (check) {
  if (stale) {
    console.error('  Ejecuta `npm run api:models`.');
    process.exit(1);
  }
  console.log('✔ El tipado de la API está al día.');
} else {
  console.log(
    `✔ ${Object.keys(schemas).length} esquemas, ${namedEnums.size} enums y ${operations.length} operaciones → ${outDir}`,
  );
}
