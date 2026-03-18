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
 * Validates that all required fields are filled
 */
export function validateFormData(
  formValues: FormValues,
  questions: Question[],
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Validate user details
  if (!formValues.userDetails.fullName.trim()) {
    errors["fullName"] = "Full name is required";
  }
  if (!formValues.userDetails.email.trim()) {
    errors["email"] = "Email is required";
  } else if (!isValidEmail(formValues.userDetails.email)) {
    errors["email"] = "Please enter a valid email";
  }
  if (!formValues.userDetails.phone.trim()) {
    errors["phone"] = "Phone number is required";
  }
  if (!formValues.userDetails.dateOfBirth.trim()) {
    errors["dateOfBirth"] = "Date of birth is required";
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
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
