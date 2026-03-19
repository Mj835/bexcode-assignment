/**
 * Validation utilities for consultation submissions
 */

import { ConsultationSubmission, ValidationError } from "../types";

/**
 * Type guard to check if value is a UserDetails object
 */
function isUserDetails(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Type guard to check if value is a string
 */
function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * Validate user details with comprehensive checks
 */
export function validateUserDetails(userDetails: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!isUserDetails(userDetails)) {
    errors.push({ field: "userDetails", message: "User details are required" });
    return errors;
  }

  const details = userDetails as Record<string, unknown>;

  // Full name validation
  const fullName = details.fullName;
  if (!isString(fullName) || !fullName.trim()) {
    errors.push({ field: "fullName", message: "Full name is required" });
  } else {
    const trimmed = fullName.trim();
    if (trimmed.length < 2) {
      errors.push({
        field: "fullName",
        message: "Full name must be at least 2 characters",
      });
    } else if (trimmed.length > 100) {
      errors.push({
        field: "fullName",
        message: "Full name must not exceed 100 characters",
      });
    } else if (
      !/^[a-zA-ZàáäâèéëêìíïîòóöôùúüûñçÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛÑÇ\s\-']+$/.test(
        trimmed,
      )
    ) {
      errors.push({
        field: "fullName",
        message:
          "Full name can only contain letters, spaces, hyphens, and apostrophes",
      });
    }
  }

  // Email validation
  const email = details.email;
  if (!isString(email)) {
    errors.push({ field: "email", message: "Email is required" });
  } else {
    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      errors.push({ field: "email", message: "Invalid email format" });
    } else if (trimmedEmail.length > 254) {
      errors.push({ field: "email", message: "Email address is too long" });
    }
  }

  // Phone validation
  const phone = details.phone;
  if (!isString(phone) || !phone.trim()) {
    errors.push({ field: "phone", message: "Phone number is required" });
  } else {
    const trimmedPhone = phone.trim();
    const digitsOnly = trimmedPhone.replace(/\D/g, "");

    if (digitsOnly.length < 10) {
      errors.push({
        field: "phone",
        message: "Phone number must have at least 10 digits",
      });
    } else if (digitsOnly.length > 15) {
      errors.push({
        field: "phone",
        message: "Phone number must not exceed 15 digits",
      });
    } else if (!/^[\d\s\-\(\)\+]+$/.test(trimmedPhone)) {
      errors.push({
        field: "phone",
        message:
          "Phone number can only contain digits and formatting characters",
      });
    }
  }

  // Date of birth validation
  const dateOfBirth = details.dateOfBirth;
  if (!isString(dateOfBirth)) {
    errors.push({ field: "dateOfBirth", message: "Date of birth is required" });
  } else {
    const date = new Date(dateOfBirth);
    if (isNaN(date.getTime())) {
      errors.push({
        field: "dateOfBirth",
        message: "Invalid date format for date of birth",
      });
    } else {
      const today = new Date();
      if (date > today) {
        errors.push({
          field: "dateOfBirth",
          message: "Date of birth cannot be in the future",
        });
      }

      // Calculate age
      let age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < date.getDate())
      ) {
        age--;
      }

      if (age < 13) {
        errors.push({
          field: "dateOfBirth",
          message: "You must be at least 13 years old",
        });
      }

      if (age > 150) {
        errors.push({
          field: "dateOfBirth",
          message: "Please enter a valid date of birth",
        });
      }
    }
  }

  return errors;
}

/**
 * Validate question responses
 */
export function validateResponses(responses: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!Array.isArray(responses)) {
    errors.push({ field: "responses", message: "Responses must be an array" });
    return errors;
  }

  if (responses.length === 0) {
    errors.push({
      field: "responses",
      message: "At least one response is required",
    });
    return errors;
  }

  responses.forEach((response, index) => {
    if (!isUserDetails(response)) {
      errors.push({
        field: `responses[${index}]`,
        message: "Response must be an object",
      });
      return;
    }

    const resp = response as Record<string, unknown>;

    if (!resp.questionId) {
      errors.push({
        field: `responses[${index}].questionId`,
        message: "Question ID is required",
      });
    }

    const questionType = resp.questionType;
    if (!isString(questionType)) {
      errors.push({
        field: `responses[${index}].questionType`,
        message: "Question type is required",
      });
    } else if (
      !["radio", "select", "multi-select", "compound"].includes(questionType)
    ) {
      errors.push({
        field: `responses[${index}].questionType`,
        message: "Invalid question type",
      });
    }

    const answer = resp.answer;
    if (answer === undefined || answer === null) {
      errors.push({
        field: `responses[${index}].answer`,
        message: "Answer is required",
      });
    } else if (!isString(answer)) {
      errors.push({
        field: `responses[${index}].answer`,
        message: "Answer must be a string",
      });
    } else if (answer.trim() === "") {
      errors.push({
        field: `responses[${index}].answer`,
        message: "Answer cannot be empty",
      });
    }
  });

  return errors;
}

/**
 * Validate metadata
 */
export function validateMetadata(metadata: unknown): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!isUserDetails(metadata)) {
    errors.push({ field: "metadata", message: "Metadata is required" });
    return errors;
  }

  const meta = metadata as Record<string, unknown>;

  const timezone = meta.timezone;
  if (!isString(timezone) || !timezone.trim()) {
    errors.push({
      field: "metadata.timezone",
      message: "Timezone is required",
    });
  }

  const submittedAt = meta.submittedAt;
  if (!isString(submittedAt)) {
    errors.push({
      field: "metadata.submittedAt",
      message: "Submitted timestamp is required",
    });
  } else {
    const date = new Date(submittedAt);
    if (isNaN(date.getTime())) {
      errors.push({
        field: "metadata.submittedAt",
        message: "Invalid timestamp format (must be ISO 8601)",
      });
    }
  }

  return errors;
}

/**
 * Complete validation of consultation submission
 */
export function validateConsultationSubmission(
  data: unknown,
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!isUserDetails(data)) {
    errors.push({
      field: "root",
      message: "Request body must be an object",
    });
    return errors;
  }

  const submission = data as Record<string, unknown>;

  errors.push(...validateUserDetails(submission.userDetails));
  errors.push(...validateResponses(submission.responses));
  errors.push(...validateMetadata(submission.metadata));

  return errors;
}
