import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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

  private httpOptions(options: RequestOptions) {
    return {
      params: toHttpParams(options.query),
      context: options.context,
      headers: options.headers ? { ...options.headers } : undefined,
    };
  }
}
