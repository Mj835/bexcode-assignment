/**
 * Shared type definitions for the consultation API
 */

// Question types
export type QuestionType = "radio" | "select" | "multi-select" | "compound";

// Single answer to a question
export interface QuestionResponse {
  questionId: string;
  questionType: QuestionType;
  answer: string; // Always a string, even for compound/multi-select (semicolon-separated values)
}

// User information
export interface UserDetails {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

// Metadata about the consultation submission
export interface ConsultMetadata {
  timezone: string; // e.g., "America/New_York"
  submittedAt: string; // ISO 8601 UTC timestamp
}

// Complete consultation submission
export interface ConsultationSubmission {
  userDetails: UserDetails;
  responses: QuestionResponse[];
  metadata: ConsultMetadata;
}

// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Validation error details
export interface ValidationError {
  field: string;
  message: string;
}
