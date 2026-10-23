import { inject, Injectable } from '@angular/core';
import { ApiClient, commaList } from '../api-client';
import { ApiBody, ApiQuery, ApiResponse } from '../operations.generated';

export type AdminPaymentsQuery = ApiQuery<'AdminPayments_list'>;
export type AdminTransfersQuery = ApiQuery<'AdminPayments_transfers'>;
export type AdminPaymentPlansQuery = ApiQuery<'AdminPayments_plansList'>;
export type AdminRefundsQuery = ApiQuery<'AdminPayments_refunds'>;

/**
 * Pagos (HU-33): pagos con tarjeta y transferencias, reembolsos y planes de
 * cuotas. Consultar: `payments.read` (todo el equipo); actuar (reembolsar,
 * validar o rechazar transferencias, acciones de planes): `payments.manage`.
 * MXN y USD nunca se suman.
 */
@Injectable({ providedIn: 'root' })
export class AdminPaymentsApi {
  private readonly api = inject(ApiClient);

  private payment(id: string, rest = ''): string {
    return `/api/v1/admin/payments/${encodeURIComponent(id)}${rest}`;
  }

  private transfer(id: string, rest: string): string {
    return `/api/v1/admin/transfers/${encodeURIComponent(id)}${rest}`;
  }

  private plan(id: string, rest = ''): string {
    return `/api/v1/admin/payment-plans/${encodeURIComponent(id)}${rest}`;
  }

  // --- Pagos ---

  /** Por defecto excluye los checkouts abandonados (`CANCELLED`). */
  list(query: AdminPaymentsQuery = {}) {
    return this.api.get<ApiResponse<'AdminPayments_list'>>('/api/v1/admin/payments', {
      query: { ...query, status: commaList(query.status) },
    });
  }

  /** Cobrado, reembolsado y neto por moneda, más los contadores de las pestañas. */
  summary(query: ApiQuery<'AdminPayments_summary'> = {}) {
    return this.api.get<ApiResponse<'AdminPayments_summary'>>('/api/v1/admin/payments/summary', {
      query: { ...query },
    });
  }

  /** Incluye transferencia, reembolsos y las acciones permitidas (`actions`). */
  detail(id: string) {
    return this.api.get<ApiResponse<'AdminPayments_detail'>>(this.payment(id));
  }

  /** URL firmada (~10 min) del comprobante de una transferencia. */
  proof(id: string) {
    return this.api.get<ApiResponse<'AdminPayments_proof'>>(this.payment(id, '/proof'));
  }

  /** Total o parcial: tarjeta → Stripe; transferencia → se registra (hecho fuera). */
  refund(id: string, body: ApiBody<'AdminPayments_refund'>) {
    return this.api.post<ApiResponse<'AdminPayments_refund'>>(this.payment(id, '/refund'), body);
  }

  refunds(query: AdminRefundsQuery = {}) {
    return this.api.get<ApiResponse<'AdminPayments_refunds'>>('/api/v1/admin/refunds', {
      query: { ...query },
    });
  }

  // --- Transferencias ---

  /** Por defecto, las pendientes de validar (la más antigua primero). */
  transfers(query: AdminTransfersQuery = {}) {
    return this.api.get<ApiResponse<'AdminPayments_transfers'>>('/api/v1/admin/transfers', {
      query: { ...query },
    });
  }

  /** Con el monto completo activa la inscripción; menor → 422 (solo se puede rechazar). */
  validateTransfer(id: string, body: ApiBody<'AdminPayments_validateTransfer'>) {
    return this.api.post<ApiResponse<'AdminPayments_validateTransfer'>>(
      this.transfer(id, '/validate'),
      body,
    );
  }

  /** La persona puede subir otro comprobante (se le avisa el motivo). */
  rejectTransfer(id: string, body: ApiBody<'AdminPayments_rejectTransfer'>) {
    return this.api.post<ApiResponse<'AdminPayments_rejectTransfer'>>(
      this.transfer(id, '/reject'),
      body,
    );
  }

  // --- Planes de cuotas ---

  /** Por defecto excluye `PENDING_ACTIVATION`; los de más días con cobro fallido primero. */
  plans(query: AdminPaymentPlansQuery = {}) {
    return this.api.get<ApiResponse<'AdminPayments_plansList'>>('/api/v1/admin/payment-plans', {
      query: { ...query, status: commaList(query.status) },
    });
  }

  planDetail(id: string) {
    return this.api.get<ApiResponse<'AdminPayments_plan'>>(this.plan(id));
  }

  /** Cobra ya las cuotas fallidas con la tarjeta registrada. */
  retryPlan(id: string) {
    return this.api.post<ApiResponse<'AdminPayments_retry'>>(this.plan(id, '/retry'));
  }

  /** "Cobro fallido" → "En mora" (con la regla actual, también suspende el acceso). */
  markDelinquent(id: string) {
    return this.api.post<ApiResponse<'AdminPayments_markDelinquent'>>(
      this.plan(id, '/mark-delinquent'),
    );
  }

  suspendAccess(id: string, body: ApiBody<'AdminPayments_suspendAccess'>) {
    return this.api.post<ApiResponse<'AdminPayments_suspendAccess'>>(
      this.plan(id, '/suspend-access'),
      body,
    );
  }

  restoreAccess(id: string, body: ApiBody<'AdminPayments_restoreAccess'>) {
    return this.api.post<ApiResponse<'AdminPayments_restoreAccess'>>(
      this.plan(id, '/restore-access'),
      body,
    );
  }

  /** No se cobran más cuotas; la inscripción no cambia. */
  cancelPlan(id: string, body: ApiBody<'AdminPayments_cancel'>) {
    return this.api.post<ApiResponse<'AdminPayments_cancel'>>(this.plan(id, '/cancel'), body);
  }
}
