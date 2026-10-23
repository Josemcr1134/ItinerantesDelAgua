import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from './api-config';
import { PaginationMetaDto } from './models.generated';

/** Respuesta paginada de la API. */
export interface Paginated<T> {
  readonly data: readonly T[];
  readonly meta: PaginationMetaDto;
}

/** Parámetros de paginación (`pageSize` máximo 100). */
export interface PageQuery {
  readonly page?: number;
  readonly pageSize?: number;
}

/** Valor admitido en la query string; los arrays se envían como claves repetidas. */
export type QueryValue =
  string | number | boolean | null | undefined | readonly (string | number)[];
export type Query = Readonly<Record<string, QueryValue>>;

export interface RequestOptions {
  readonly query?: Query;
  readonly context?: HttpContext;
  readonly headers?: Readonly<Record<string, string>>;
}

/** Archivo descargado de la API: contenido y nombre sugerido. */
export interface DownloadedFile {
  readonly blob: Blob;
  readonly fileName: string;
}

/** Lista para las queries que la API recibe separadas por coma (`?status=A,B`). */
export function commaList(values: readonly string[] | undefined): string | undefined {
  return values?.length ? values.join(',') : undefined;
}

/** Construye `HttpParams` ignorando valores vacíos. */
export function toHttpParams(query: Query = {}): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    if (Array.isArray(value)) {
      value.forEach((item) => (params = params.append(key, String(item))));
    } else {
      params = params.set(key, String(value));
    }
  }
  return params;
}

/** Cliente HTTP base de la API: antepone la URL base y serializa la query. */
@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  url(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  get<T>(path: string, options: RequestOptions = {}): Observable<T> {
    return this.http.get<T>(this.url(path), this.httpOptions(options));
  }

  post<T>(path: string, body: unknown = null, options: RequestOptions = {}): Observable<T> {
    return this.http.post<T>(this.url(path), body, this.httpOptions(options));
  }

  put<T>(path: string, body: unknown, options: RequestOptions = {}): Observable<T> {
    return this.http.put<T>(this.url(path), body, this.httpOptions(options));
  }

  patch<T>(path: string, body: unknown, options: RequestOptions = {}): Observable<T> {
    return this.http.patch<T>(this.url(path), body, this.httpOptions(options));
  }

  delete<T>(path: string, options: RequestOptions = {}): Observable<T> {
    return this.http.delete<T>(this.url(path), this.httpOptions(options));
  }

  /**
   * Descarga un archivo (p. ej. un CSV) con la sesión. El nombre sale de
   * `Content-Disposition` o, si la API no lo expone, de `fallbackName`.
   */
  getFile(
    path: string,
    fallbackName: string,
    options: RequestOptions = {},
  ): Observable<DownloadedFile> {
    return this.http
      .get(this.url(path), {
        ...this.httpOptions(options),
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((response) => ({
          blob: response.body ?? new Blob([]),
          fileName: fileNameFrom(response.headers.get('content-disposition')) ?? fallbackName,
        })),
      );
  }

  private httpOptions(options: RequestOptions) {
    return {
      params: toHttpParams(options.query),
      context: options.context,
      headers: options.headers ? { ...options.headers } : undefined,
    };
  }
}

/** `attachment; filename="x.csv"` (o `filename*=UTF-8''x.csv`) → `x.csv`. */
function fileNameFrom(disposition: string | null): string | null {
  if (!disposition) return null;
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
  if (encoded) return decodeURIComponent(encoded[1]);
  return /filename="?([^";]+)"?/i.exec(disposition)?.[1] ?? null;
}
