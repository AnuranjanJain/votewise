// ============================================================
// VoteWise — Shared API Route Utilities
// Centralized response helpers, security headers, and validation
// wrappers to eliminate duplication across API routes.
// ============================================================

import { NextResponse } from 'next/server';
import { type ValidationResult } from './validators';

/**
 * Standard security headers applied to every API response.
 * Prevents clickjacking, MIME-type sniffing, and caching of
 * sensitive data.
 */
export const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-DNS-Prefetch-Control': 'off',
  'X-Download-Options': 'noopen',
  'X-Permitted-Cross-Domain-Policies': 'none',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self), payment=(), usb=(), browsing-topics=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Origin-Agent-Cluster': '?1',
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
} as const;

/**
 * Creates a successful JSON response with security headers.
 *
 * @param data The response payload
 * @param status HTTP status code (defaults to 200)
 * @returns A NextResponse with security headers attached
 *
 * @example
 * ```ts
 * return successResponse({ result: 'ok' });
 * return successResponse({ created: true }, 201);
 * ```
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status, headers: SECURITY_HEADERS });
}

/**
 * Creates an error JSON response with security headers.
 *
 * @param message Human-readable error description
 * @param status HTTP status code (defaults to 500)
 * @param extra Additional fields to include in the response body
 * @returns A NextResponse with error payload and security headers
 *
 * @example
 * ```ts
 * return errorResponse('Not found', 404);
 * return errorResponse('Failed', 500, { fallback: data });
 * ```
 */
export function errorResponse(
  message: string,
  status: number = 500,
  extra?: Record<string, unknown>
): NextResponse {
  return NextResponse.json(
    { error: message, ...extra },
    { status, headers: SECURITY_HEADERS }
  );
}

/**
 * Creates a 400 validation-error response from a ValidationResult.
 *
 * @param result The failed validation result
 * @returns A NextResponse with 400 status and the validation error message
 */
export function validationError(result: ValidationResult): NextResponse {
  return errorResponse(result.error ?? 'Validation failed', 400);
}

/**
 * Safely parses the JSON body from a Request.
 * Returns null if parsing fails (malformed JSON, empty body, etc.).
 *
 * @param request The incoming Request object
 * @returns The parsed body or null
 */
export async function safeParseBody<T = Record<string, unknown>>(
  request: Request
): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Creates a standard health-check / service-info GET response.
 *
 * @param serviceName Display name of the API service
 * @param extra Additional metadata to include
 * @returns A NextResponse with service status
 */
export function serviceInfoResponse(
  serviceName: string,
  extra?: Record<string, unknown>
): NextResponse {
  return successResponse({ status: 'ok', service: serviceName, ...extra });
}
