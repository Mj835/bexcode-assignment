import type {
  Question,
  QuestionResponse,
  FormSubmissionData,
  FormValues,
} from "../types/forms";
import { createConsultMetadata } from "./timezone";
import { isQuestionVisible } from "./conditionalLogic";

/**
 * Parses form responses into standardized format
 * Each question produces exactly one answer field
 * Only includes visible questions (respects conditional dependencies)
 */
export function parseFormResponses(
  formValues: FormValues,
  questions: Question[],
): FormSubmissionData {
  // Filter to only include visible questions based on dependencies
  const visibleQuestions = questions.filter((q) =>
    isQuestionVisible(q, formValues.questionAnswers),
  );

  const responses: QuestionResponse[] = visibleQuestions.map((question) => {
    const answer = formValues.questionAnswers[question.questionId];

    // Convert the answer to standardized string format based on question type
    let standardizedAnswer: string = "";

    switch (question.questionType) {
      case "radio":
        standardizedAnswer = typeof answer === "string" ? answer : "";
        break;

      case "select":
        standardizedAnswer = typeof answer === "string" ? answer : "";
        break;

      case "multi-select":
        // Multi-select returns array, join with comma and space
        if (Array.isArray(answer)) {
          standardizedAnswer = answer.join(" , ");
        } else {
          standardizedAnswer = typeof answer === "string" ? answer : "";
        }
        break;

      case "compound":
        // Compound fields are stored as object, format them into readable string
        if (
          typeof answer === "object" &&
          answer !== null &&
          !Array.isArray(answer)
        ) {
          standardizedAnswer = formatCompoundAnswer(
            answer as Record<string, string>,
            question,
          );
        } else {
          standardizedAnswer = typeof answer === "string" ? answer : "";
        }
        break;

      default:
        standardizedAnswer = typeof answer === "string" ? answer : "";
    }

    return {
      questionId: question.questionId,
      questionType: question.questionType,
      answer: standardizedAnswer.trim(),
    };
  });

  return {
    userDetails: formValues.userDetails,
    responses,
    metadata: createConsultMetadata(),
  };
}

/**
 * Formats compound field answers into readable string
 * Example: { feet: 5, inches: 6 } -> "5 feet 6 inches"
 */
function formatCompoundAnswer(
  answer: Record<string, string>,
  question: Question,
): string {
  if (!question.compoundFields) {
    return JSON.stringify(answer);
  }

  const parts = question.compoundFields
    .map((field) => {
      const value = answer[field.name];
      if (value !== undefined && value !== "") {
        return `${value} ${field.label}`;
      }
      return null;
    })
    .filter(Boolean);

  return parts.join(" ");
}

/**
 * Validates that all required fields are filled with proper format
 */
export function validateFormData(
  formValues: FormValues,
  questions: Question[],
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Validate user details
  const nameError = validateName(formValues.userDetails.fullName);
  if (nameError) {
    errors["fullName"] = nameError;
  }

  const emailError = validateEmail(formValues.userDetails.email);
  if (emailError) {
    errors["email"] = emailError;
  }

  const phoneError = validatePhone(formValues.userDetails.phone);
  if (phoneError) {
    errors["phone"] = phoneError;
  }

  const dobError = validateDateOfBirth(formValues.userDetails.dateOfBirth);
  if (dobError) {
    errors["dateOfBirth"] = dobError;
  }

  // Validate questionnaire responses
  questions.forEach((question) => {
    // Only validate if question is required AND visible based on dependencies
    if (
      question.required &&
      isQuestionVisible(question, formValues.questionAnswers)
    ) {
      const answer = formValues.questionAnswers[question.questionId];

      if (question.questionType === "multi-select") {
        if (!Array.isArray(answer) || answer.length === 0) {
          errors[`q_${question.questionId}`] =
            "Please select at least one option";
        }
      } else if (question.questionType === "compound") {
        if (typeof answer === "object") {
          const hasValue = Object.values(answer).some(
            (val) => val !== undefined && val !== "",
          );
          if (!hasValue) {
            errors[`q_${question.questionId}`] =
              "Please fill in all required fields";
          }
        } else if (!answer) {
          errors[`q_${question.questionId}`] = "This field is required";
        }
      } else {
        if (!answer || (typeof answer === "string" && !answer.trim())) {
          errors[`q_${question.questionId}`] = "This field is required";
        }
      }
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validates full name
 * - Required
 * - Minimum 2 characters
 * - Maximum 100 characters
 * - Only letters, spaces, hyphens, and apostrophes allowed
 */
function validateName(name: string): string | null {
  if (!name || !name.trim()) {
    return "Full name is required";
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    return "Full name must be at least 2 characters";
  }

  if (trimmedName.length > 100) {
    return "Full name must not exceed 100 characters";
  }

  // Allow letters (including accented), spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-ZàáäâèéëêìíïîòóöôùúüûñçÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛÑÇ\s\-']+$/;
  if (!nameRegex.test(trimmedName)) {
    return "Full name can only contain letters, spaces, hyphens, and apostrophes";
  }

  return null;
}

/**
 * Validates email address
 * - Required
 * - Valid email format
 * - Check for common typos
 */
function validateEmail(email: string): string | null {
  if (!email || !email.trim()) {
    return "Email is required";
  }

  const trimmedEmail = email.trim().toLowerCase();

  // RFC 5322 simplified email validation
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return "Please enter a valid email format";
  }

  // Additional validation
  if (trimmedEmail.length > 254) {
    return "Email address is too long";
  }

  // Check for common typos
  const commonTypos = [
    "gmial.com",
    "gmai.com",
    "yahooo.com",
    "hotnail.com",
    "hotmial.com",
  ];
  const domain = trimmedEmail.split("@")[1];
  if (commonTypos.includes(domain)) {
    return `Did you mean ${domain.replace("gmial", "gmail").replace("gmai", "gmail").replace("yahooo", "yahoo").replace("hotnail", "hotmail").replace("hotmial", "hotmail")}?`;
  }

  return null;
}

/**
 * Validates phone number
 * - Required
 * - Minimum 10 digits
 * - Maximum 15 digits (international standard)
 * - Only digits and optional formatting characters allowed
 */
function validatePhone(phone: string): string | null {
  if (!phone || !phone.trim()) {
    return "Phone number is required";
  }

  const trimmedPhone = phone.trim();

  // Extract only digits
  const digitsOnly = trimmedPhone.replace(/\D/g, "");

  if (digitsOnly.length < 10) {
    return "Phone number must have at least 10 digits";
  }

  if (digitsOnly.length > 15) {
    return "Phone number must not exceed 15 digits";
  }

  // Allow only digits, spaces, hyphens, parentheses, and plus sign
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  if (!phoneRegex.test(trimmedPhone)) {
    return "Phone number can only contain digits and formatting characters";
  }

  return null;
}

/**
 * Validates date of birth
 * - Required
 * - Valid date format
 * - Not in the future
 * - Minimum age of 13 years
 * - Maximum age of 150 years
 */
function validateDateOfBirth(dob: string): string | null {
  if (!dob || !dob.trim()) {
    return "Date of birth is required";
  }

  const date = new Date(dob);

  if (isNaN(date.getTime())) {
    return "Please enter a valid date";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date > today) {
    return "Date of birth cannot be in the future";
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
    return "You must be at least 13 years old";
  }

  if (age > 150) {
    return "Please enter a valid date of birth";
  }

  return null;
}

/**
 * Simple email validation (used elsewhere if needed)
 */
