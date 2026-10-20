import type { Response } from 'express';

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message: string;
  data: T | null;
}

/**
 * Sends a standardized success HTTP response.
 *
 * @param res Express response object
 * @param message Human-readable message describing the outcome
 * @param data Payload to return to client (defaults to null if undefined)
 * @param statusCode HTTP status code (defaults to 200 OK)
 */
export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    status: 'success',
    message,
    data: data !== undefined ? data : null,
  });
};

/**
 * Sends a standardized error HTTP response.
 *
 * @param res Express response object
 * @param message Human-readable error description
 * @param data Optional error details (e.g. validation issues, defaults to null)
 * @param statusCode HTTP status code (defaults to 400 Bad Request)
 */
export const sendError = (
  res: Response,
  message: string,
  data: unknown = null,
  statusCode: number = 400
): Response<ApiResponse> => {
  return res.status(statusCode).json({
    status: 'error',
    message,
    data: data !== undefined ? data : null,
  });
};
