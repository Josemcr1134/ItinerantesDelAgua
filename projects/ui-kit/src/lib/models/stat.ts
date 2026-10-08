/** Cifra destacada con unidad opcional y etiqueta descriptiva. */
export interface UiStat {
  readonly value: string;
  readonly unit?: string;
  readonly label: string;
}
