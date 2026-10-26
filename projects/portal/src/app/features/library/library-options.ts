import { LibraryItemType } from 'data-access';

/** Nombre de cada tipo de recurso (Figma HU-09). */
export const RESOURCE_TYPE_LABELS: Readonly<Record<LibraryItemType, string>> = {
  PDF: 'PDF',
  BOOK: 'Libro',
  VIDEO: 'Video',
  AUDIO: 'Audio',
  ARTICLE: 'Artículo',
  EXTERNAL: 'Enlace',
  COURSE_MATERIAL: 'Material de curso',
};

/** Filtros del Figma (`?tipo=`); "Todos" no lleva parámetro. */
export const RESOURCE_FILTERS = [
  { slug: 'pdf', type: 'PDF' },
  { slug: 'libro', type: 'BOOK' },
  { slug: 'video', type: 'VIDEO' },
  { slug: 'audio', type: 'AUDIO' },
  { slug: 'articulo', type: 'ARTICLE' },
] as const satisfies readonly { slug: string; type: LibraryItemType }[];

export const filterBySlug = (slug: string | undefined) =>
  RESOURCE_FILTERS.find((filter) => filter.slug === slug) ?? null;

/** Ilustraciones del Figma para los recursos sin miniatura. */
export const LIBRARY_COVERS = [
  'assets/library/cover-woman.webp',
  'assets/library/cover-tree.webp',
  'assets/library/cover-clouds.webp',
  'assets/library/cover-branch.webp',
  'assets/library/cover-man.webp',
  'assets/library/cover-farmer.webp',
  'assets/library/cover-hen.webp',
  'assets/library/cover-river.webp',
  'assets/library/cover-corn.webp',
] as const;
