/**
 * Express middleware functions
 */

import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../types";

/**
 * Global error handler middleware
 */
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  console.error("Error:", error);

  const statusCode =
    error instanceof Error && "statusCode" in error
      ? (error as any).statusCode
      : 500;
  const message =
    error instanceof Error ? error.message : "Internal server error";

  const response: ApiResponse = {
    success: false,
    error: message,
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
}

/**
 * 404 handler middleware
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const response: ApiResponse = {
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(response);
}

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`,
    );
  });
  next();
}
