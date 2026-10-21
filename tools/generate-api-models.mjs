#!/usr/bin/env node
// Genera las interfaces TypeScript de la API a partir de su especificación
// OpenAPI (components.schemas). Sin dependencias.
//
// Uso: node tools/generate-api-models.mjs [openapi.json] [salida.ts]
//   por defecto: docs/api/openapi.json → projects/data-access/src/lib/api/models.generated.ts
import { readFileSync, writeFileSync } from 'node:fs';

const [input = 'docs/api/openapi.json', output = 'projects/data-access/src/lib/api/models.generated.ts'] =
  process.argv.slice(2);
const spec = JSON.parse(readFileSync(input, 'utf8'));
const schemas = spec.components?.schemas ?? {};

const refName = (ref) => ref.split('/').pop();
const literal = (v) => (typeof v === 'string' ? `'${v.replace(/'/g, "\\'")}'` : String(v));
const doc = (text, indent = '') =>
  text ? `${indent}/** ${String(text).replace(/\*\//g, '*\\/').replace(/\n+/g, ` ${''}`).trim()} */\n` : '';

/** Convierte un esquema en una expresión de tipo TypeScript. */
function typeOf(schema) {
  if (!schema) return 'unknown';
  // Algunos esquemas traen el subesquema dentro de `type`.
  if (schema.type && typeof schema.type === 'object') return withNull(typeOf(schema.type), schema);
  if (schema.$ref) return withNull(refName(schema.$ref), schema);
  if (schema.allOf) {
    const parts = schema.allOf.map(typeOf);
    return withNull(parts.length === 1 ? parts[0] : parts.join(' & '), schema);
  }
  if (schema.oneOf || schema.anyOf) return withNull((schema.oneOf ?? schema.anyOf).map(typeOf).join(' | '), schema);
  if (schema.enum) return withNull(schema.enum.map(literal).join(' | '), schema);
  if (schema.const !== undefined) return literal(schema.const);
  const types = Array.isArray(schema.type) ? schema.type : [schema.type];
  const mapped = types.map((t) => {
    switch (t) {
      case 'string':
        return 'string';
      case 'number':
      case 'integer':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'null':
        return 'null';
      case 'array':
        return `${wrap(typeOf(schema.items))}[]`;
      case 'object':
        return objectType(schema);
      default:
        return schema.properties ? objectType(schema) : 'unknown';
    }
  });
  return withNull(mapped.join(' | '), schema);
}

const wrap = (t) => (/[|&]/.test(t) ? `(${t})` : t);
const withNull = (t, schema) => (schema.nullable ? `${t} | null` : t);

function objectType(schema, indent = '') {
  const props = schema.properties ?? {};
  const required = new Set(schema.required ?? []);
  const lines = Object.entries(props).map(([name, prop]) => {
    const key = /^[A-Za-z_$][\w$]*$/.test(name) ? name : `'${name}'`;
    const opt = required.has(name) ? '' : '?';
    return `${doc(prop.description, indent + '  ')}${indent}  readonly ${key}${opt}: ${typeOf(prop)};`;
  });
  if (schema.additionalProperties) {
    const extra = schema.additionalProperties === true ? 'unknown' : typeOf(schema.additionalProperties);
    lines.push(`${indent}  readonly [key: string]: ${extra};`);
  }
  return lines.length ? `{\n${lines.join('\n')}\n${indent}}` : 'Record<string, unknown>';
}

let out = `// ⚠️ Archivo generado por tools/generate-api-models.mjs a partir de
// docs/api/openapi.json (${spec.info?.title ?? 'API'}). No editar a mano:
// regenerar con \`node tools/generate-api-models.mjs\`.
/* eslint-disable */\n\n`;

for (const [name, schema] of Object.entries(schemas)) {
  out += doc(schema.description);
  const isObject = schema.type === 'object' || (schema.properties && !schema.enum);
  if (isObject) {
    out += `export interface ${name} ${objectType(schema)}\n\n`;
  } else {
    out += `export type ${name} = ${typeOf(schema)};\n\n`;
  }
}

writeFileSync(output, out.trimEnd() + '\n');
console.log(`✔ ${Object.keys(schemas).length} esquemas → ${output}`);
