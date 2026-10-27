import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { ApiClient, DownloadedFile } from '../api-client';
import { silentRequest } from '../http-context';
import { Uuid } from '../models.generated';
import { ApiBody, ApiQuery, ApiResponse } from '../operations.generated';
import { uploadToSignedUrl } from './admin-offers.api';

/** Datos del comprobante de transferencia (además del archivo). */
export interface TransferProofInput {
  readonly applicationId: Uuid;
  /** Monto transferido declarado (centavos MXN). */
  readonly declaredAmountCents: number;
  /** YYYY-MM-DD. */
  readonly paidOn: string;
  readonly trackingKey: string;
}

/**
 * Pagos del participante (Fase 05, HU-22 a HU-26): resumen y checkout de
 * Stripe (completo, saldo tras beca o en cuotas), transferencia con
 * comprobante (México), Mis pagos, planes de cuotas y recibos.
 */
@Injectable({ providedIn: 'root' })
export class PaymentsApi {
  private readonly api = inject(ApiClient);
  private readonly http = inject(HttpClient);
  private readonly base = '/api/v1/me/payments';

  /** Resumen de pago: `offerId` (precio completo) O `applicationId` (saldo tras beca). */
  quote(query: ApiQuery<'Payments_quote'>) {
    return this.api.get<ApiResponse<'Payments_quote'>>(`${this.base}/quote`, {
      query: { ...query },
    });
  }

  /** Inicia el checkout de Stripe: redirigir a `checkoutUrl`. */
  checkout(body: ApiBody<'Payments_start'>) {
    return this.api.post<ApiResponse<'Payments_start'>>(`${this.base}/checkout`, body);
  }

  list(query: ApiQuery<'Payments_list'> = {}) {
    return this.api.get<ApiResponse<'Payments_list'>>(this.base, { query: { ...query } });
  }

  summary() {
    return this.api.get<ApiResponse<'Payments_summary'>>(`${this.base}/summary`);
  }

  plans() {
    return this.api.get<ApiResponse<'Payments_plans'>>(`${this.base}/plans`);
  }

  plan(planId: Uuid) {
    return this.api.get<ApiResponse<'Payments_plan'>>(
      `${this.base}/plans/${encodeURIComponent(planId)}`,
    );
  }

  /** [Actualizar tarjeta]: checkout de Stripe en modo `setup`. */
  updateCard(planId: Uuid) {
    return this.api.post<ApiResponse<'Payments_cardUpdate'>>(
      `${this.base}/plans/${encodeURIComponent(planId)}/card-update`,
    );
  }

  /** [Pagar ahora]: cobra las cuotas fallidas con la tarjeta registrada. */
  payNow(planId: Uuid) {
    return this.api.post<ApiResponse<'Payments_payNow'>>(
      `${this.base}/plans/${encodeURIComponent(planId)}/pay-now`,
    );
  }

  /**
   * Estado de un pago. `silent`: consulta repetida al volver de Stripe
   * ("Procesando pago…"), sin el loader general.
   */
  get(id: Uuid, options: { silent?: boolean } = {}) {
    return this.api.get<ApiResponse<'Payments_get'>>(
      `${this.base}/${encodeURIComponent(id)}`,
      options.silent ? { context: silentRequest() } : {},
    );
  }

  /** Cancela un checkout abierto (libera el cupo retenido). */
  cancel(id: Uuid) {
    return this.api.post<void>(`${this.base}/${encodeURIComponent(id)}/cancel`);
  }

  /** Recibo PDF (solo pagos "Pagado" o transferencias "Validada"). */
  receipt(id: Uuid, fallbackName = 'comprobante.pdf'): Observable<DownloadedFile> {
    return this.api.getFile(`${this.base}/${encodeURIComponent(id)}/receipt`, fallbackName);
  }

  /** URL temporal del comprobante de transferencia enviado. */
  transferProof(id: Uuid) {
    return this.api.get<ApiResponse<'Payments_transferProof'>>(
      `${this.base}/${encodeURIComponent(id)}/transfer-proof`,
    );
  }

  /** Comprobante de transferencia en 3 pasos: URL firmada, PUT a storage y envío. */
  submitTransfer(
    file: File,
    data: TransferProofInput,
  ): Observable<ApiResponse<'Payments_submitTransfer'>> {
    const target$ = this.api.post<ApiResponse<'Payments_transferUploadUrl'>>(
      `${this.base}/transfers/upload-url`,
      {
        applicationId: data.applicationId,
        fileName: file.name,
        contentType: file.type as ApiBody<'Payments_transferUploadUrl'>['contentType'],
        sizeBytes: file.size,
      },
    );
    return uploadToSignedUrl(this.http, target$, file).pipe(
      switchMap((key) =>
        this.api.post<ApiResponse<'Payments_submitTransfer'>>(`${this.base}/transfers`, {
          ...data,
          key,
          fileName: file.name,
        }),
      ),
    );
  }
}
