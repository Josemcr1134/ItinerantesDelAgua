/** Cifra destacada con unidad opcional y etiqueta descriptiva. */
export interface UiStat {
  readonly value: string;
  readonly unit?: string;
  /** Admite saltos de línea (`\n`) para respetar los cortes del diseño. */
  readonly label: string;
  /** Fracción del anillo que se muestra llena (0–1), solo en stat-circle. */
  readonly progress?: number;
}
