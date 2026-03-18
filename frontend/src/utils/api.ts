import type { FormSubmissionData } from "../types/forms";

/**
 * Base API configuration
 */
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * API Response type
 */
interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}

/**
 * Consultation submission response
 */
interface SubmissionResponse {
  id: string;
  message: string;
}

/**
 * Generic consultation data type
 */
interface ConsultationData extends Record<string, unknown> {
  id: string;
}

/**
 * Health check response
 */
interface HealthCheckResponse {
  message: string;
}

/**
 * All possible API errors that can occur
 */
export class ApiError extends Error {
  status: number;
  validationErrors?: string[];

  constructor(status: number, message: string, validationErrors?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.validationErrors = validationErrors;
  }
}

/**
 * Submit consultation form data to backend
 */
export async function submitConsultation(
  data: FormSubmissionData,
): Promise<SubmissionResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/consultations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result: ApiResponse<SubmissionResponse> = await response.json();

    if (!response.ok || !result.success) {
      // Handle validation errors
      if (response.status === 400) {
        const errorData = result.data as unknown as Record<string, unknown>;
        const errors = errorData?.errors as string[] | undefined;
        if (errors && errors.length > 0) {
          throw new ApiError(
            response.status,
            result.error || "Validation failed",
            errors,
          );
        }
      }

      throw new ApiError(
        response.status,
        result.error || "Failed to submit consultation",
        undefined,
      );
    }

    if (!result.data) {
      throw new ApiError(500, "Invalid response format from server");
    }

    return result.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new ApiError(
        0,
        "Network error. Is the backend running?",
        undefined,
      );
    }

    throw new ApiError(
      500,
      error instanceof Error ? error.message : "Unknown error occurred",
      undefined,
    );
  }
}

/**
 * Get consultation statistics
 */
export async function getConsultationStats(): Promise<ConsultationData> {
  try {
    const response = await fetch(`${API_BASE_URL}/consultations/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new ApiError(response.status, "Failed to fetch statistics");
    }

    const result: ApiResponse<ConsultationData> = await response.json();

    if (!result.success || !result.data) {
      throw new ApiError(500, "Invalid response format");
    }

    return result.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      500,
      error instanceof Error ? error.message : "Failed to fetch statistics",
    );
  }
}
