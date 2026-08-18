import { NextResponse } from "next/server";

// Standard API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: number;
}

// Helper to create consistent JSON responses
export function createResponse<T>(
  data: T,
  status: number = 200,
  headers?: HeadersInit,
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    timestamp: Date.now(),
  };
  return NextResponse.json(response, { status, headers });
}

// Success responses
export function success<T>(
  data: T,
  status: number = 200,
  headers?: HeadersInit,
): NextResponse<ApiResponse<T>> {
  return createResponse(data, status, headers);
}

// Error responses
export function error(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown,
  headers?: HeadersInit,
): NextResponse<ApiResponse<never>> {
  const response: ApiResponse = {
    success: false,
    error: { code, message, details },
    timestamp: Date.now(),
  };
  return NextResponse.json(response, { status, headers });
}

// Common error helpers
export function badRequest(
  message: string,
  details?: unknown,
): NextResponse<ApiResponse<never>> {
  return error("BAD_REQUEST", message, 400, details);
}

export function unauthorized(
  message: string = "Unauthorized",
  details?: unknown,
): NextResponse<ApiResponse<never>> {
  return error("UNAUTHORIZED", message, 401, details);
}

export function forbidden(
  message: string = "Forbidden",
  details?: unknown,
): NextResponse<ApiResponse<never>> {
  return error("FORBIDDEN", message, 403, details);
}

export function notFound(
  message: string = "Not Found",
  details?: unknown,
): NextResponse<ApiResponse<never>> {
  return error("NOT_FOUND", message, 404, details);
}

export function serverError(
  message: string = "Internal Server Error",
  details?: unknown,
): NextResponse<ApiResponse<never>> {
  return error("SERVER_ERROR", message, 500, details);
}

// Empty responses (for DELETE, etc.)
export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

// Redirect response
export function redirect(url: string, status: number = 302): NextResponse {
  return NextResponse.redirect(url, status);
}
