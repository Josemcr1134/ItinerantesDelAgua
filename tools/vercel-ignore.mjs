#!/usr/bin/env node
/**
 * "Ignored Build Step" de Vercel: decide si una app del workspace se vuelve a
 * desplegar. Sale con 0 para omitir el build y con 1 para hacerlo (así lo
 * interpreta Vercel).
 *
 * Cada proyecto de Vercel define la variable `APP` con el nombre de su app en
 * `angular.json` (`public-site`, `admin`, `portal`). Se compara con el último
 * despliegue correcto (`VERCEL_GIT_PREVIOUS_SHA`) y se despliega solo si
 * cambió la app, alguna librería que usa (por sus imports, también las
 * indirectas, y por lo que su build toma de otras carpetas en `angular.json`)
 * o un archivo común del workspace. Ante cualquier duda, despliega.
 *
 * Uso local: `APP=admin VERCEL_GIT_PREVIOUS_SHA=<sha> node tools/vercel-ignore.mjs`
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** Archivos comunes: si cambian, se despliegan todas las apps. */
const SHARED_FILES = [
  'package.json',
  'package-lock.json',
  'angular.json',
  'tsconfig.json',
  'vercel.json',
  '.npmrc',
  '.nvmrc',
  'tools/vercel-ignore.mjs',
];

const DEPLOY = 1;
const SKIP = 0;

function finish(code, reason) {
  console.log(`[vercel-ignore] ${code === DEPLOY ? 'Desplegar' : 'Omitir'}: ${reason}`);
  process.exit(code);
}

function git(...args) {
  return execFileSync('git', args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }).trim();
}

/** `tsconfig.json` admite comentarios: se quitan antes de leerlo. */
function readJsonc(path) {
  const text = readFileSync(path, 'utf8')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
  return JSON.parse(text);
}

/** Archivos `.ts` de una carpeta (recursivo). */
function tsFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === 'node_modules' ? [] : tsFiles(path);
    return path.endsWith('.ts') ? [path] : [];
  });
}

/** Carpetas de las que depende la app: la suya, sus librerías (transitivas) y lo que su build referencia. */
function dependencies(app, angular) {
  const project = angular.projects[app];
  const roots = new Map(Object.entries(angular.projects).map(([name, p]) => [name, `${p.root}/`]));
  const libraries = Object.keys(readJsonc('tsconfig.json').compilerOptions?.paths ?? {});
  const result = new Set([`${project.root}/`]);

  // Lo que el build de la app toma de otros proyectos (estilos, fuentes, ilustraciones…).
  const build = JSON.stringify(project.architect?.build ?? {});
  for (const root of roots.values()) if (build.includes(root)) result.add(root);

  // Librerías importadas, también las que importan esas librerías.
  const pending = [project.root];
  const seen = new Set();
  while (pending.length) {
    const dir = pending.pop();
    if (seen.has(dir)) continue;
    seen.add(dir);
    const source = tsFiles(join(dir, 'src'))
      .map((file) => readFileSync(file, 'utf8'))
      .join('\n');
    for (const lib of libraries) {
      if (!roots.has(lib) || !new RegExp(`from ['"]${lib}['"]`).test(source)) continue;
      const root = roots.get(lib);
      result.add(root);
      pending.push(root.slice(0, -1));
    }
  }
  return [...result];
}

const app = process.env.APP;
const angular = JSON.parse(readFileSync('angular.json', 'utf8'));
if (!app || !angular.projects[app]) {
  finish(
    DEPLOY,
    `falta la variable APP o no es una app de angular.json (${app ?? 'sin definir'}).`,
  );
}

const previous = process.env.VERCEL_GIT_PREVIOUS_SHA;
if (!previous) finish(DEPLOY, 'no hay un despliegue anterior con qué comparar.');

// Vercel clona con poca historia: si el commit anterior no está, se intenta traer.
try {
  git('cat-file', '-e', `${previous}^{commit}`);
} catch {
  try {
    git('fetch', '--quiet', '--depth=200', 'origin', previous);
  } catch {
    finish(DEPLOY, `no se encontró el commit del despliegue anterior (${previous.slice(0, 7)}).`);
  }
}

let changed;
try {
  changed = git('diff', '--name-only', previous, 'HEAD').split('\n').filter(Boolean);
} catch {
  finish(DEPLOY, 'no se pudieron comparar los cambios.');
}

const folders = dependencies(app, angular);
const relevant = changed.filter(
  (file) => SHARED_FILES.includes(file) || folders.some((folder) => file.startsWith(folder)),
);

if (relevant.length) {
  const list = relevant.slice(0, 5).join(', ') + (relevant.length > 5 ? '…' : '');
  finish(DEPLOY, `${app} cambió (${list}).`);
}
finish(
  SKIP,
  `ningún cambio afecta a ${app} desde ${previous.slice(0, 7)} (depende de ${folders.join(', ')}).`,
);
