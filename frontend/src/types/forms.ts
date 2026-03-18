// User intake information
export interface UserDetails {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

// Question types for the questionnaire
export type QuestionType = "radio" | "select" | "multi-select" | "compound";

// Option for select/radio/multi-select
export interface Option {
  value: string;
  label: string;
}

// Compound input sub-field (e.g., feet, inches for height)
export interface CompoundField {
  name: string;
  label: string;
  type: "text" | "number" | "select";
  placeholder?: string;
  options?: Option[]; // For select type compound fields
}

// Conditional logic for showing/hiding questions
export interface QuestionDependency {
  questionId: string; // The question that this one depends on
  value: string | string[]; // The value(s) that trigger this question to show
  operator?: "equals" | "includes"; // equals for single value, includes for arrays
}

// Question definition (from JSON schema)
export interface Question {
  questionId: string;
  questionType: QuestionType;
  question: string;
  description?: string;
  options?: Option[]; // For radio, select, multi-select
  required: boolean;
  compoundFields?: CompoundField[]; // For compound inputs
  help?: string;
  dependsOn?: QuestionDependency; // Optional conditional visibility
}

// Consult metadata
export interface ConsultMetadata {
  timezone: string; // User's timezone (e.g., 'America/New_York')
  submittedAt: string; // ISO 8601 UTC timestamp
}

// Single question response
export interface QuestionResponse {
  questionId: string;
  questionType: QuestionType;
  answer: string; // Unified answer format - everything is a string
}

// Complete form submission data
export interface FormSubmissionData {
  userDetails: UserDetails;
  responses: QuestionResponse[];
  metadata?: ConsultMetadata;
}

// Answer value for form questions (internal representation during form editing)
export type QuestionAnswerValue =
  | string
  | string[]
  | Record<string, string>
  | undefined;

// Form values for multi-select (internal use during form filling)
export interface FormValues {
  userDetails: UserDetails;
  questionAnswers: Record<string, QuestionAnswerValue>;
}
