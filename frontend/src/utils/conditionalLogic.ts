import type { Question, QuestionAnswerValue } from "../types/forms";

/**
 * Checks if a question should be visible based on its dependencies
 * Returns true if question has no dependencies or if dependency is satisfied
 */
export function isQuestionVisible(
  question: Question,
  allAnswers: Record<string, QuestionAnswerValue>,
): boolean {
  // If no dependency, always show
  if (!question.dependsOn) {
    return true;
  }

  const {
    questionId: dependsOnId,
    value: expectedValue,
    operator = "equals",
  } = question.dependsOn;

  // Get the answer to the question this one depends on
  const dependentAnswer = allAnswers[dependsOnId];

  // If dependent question hasn't been answered, hide this question
  if (dependentAnswer === undefined) {
    return false;
  }

  // Check based on operator
  if (operator === "includes") {
    // For multi-select, check if dependent answer includes any expected value
    if (Array.isArray(dependentAnswer) && Array.isArray(expectedValue)) {
      return dependentAnswer.some((answer) =>
        expectedValue.includes(answer as string),
      );
    } else if (Array.isArray(dependentAnswer)) {
      return dependentAnswer.includes(expectedValue as string);
    }
    return false;
  }

  // Default: 'equals' operator
  if (Array.isArray(expectedValue)) {
    return expectedValue.includes(dependentAnswer as string);
  }
  return dependentAnswer === expectedValue;
}

/**
 * Filters visible questions based on current answers
 * Only questions without unmet dependencies are returned
 */
export function getVisibleQuestions(
  questions: Question[],
  allAnswers: Record<string, QuestionAnswerValue>,
): Question[] {
  return questions.filter((question) =>
    isQuestionVisible(question, allAnswers),
  );
}

/**
 * Gets all dependent questions for a specific question
 * Useful for clearing dependent answers when parent answer changes
 */
export function getDependentQuestions(
  parentQuestionId: string,
  questions: Question[],
): Question[] {
  return questions.filter(
    (question) => question.dependsOn?.questionId === parentQuestionId,
  );
}

/**
 * Clears answers for all dependent questions when parent answer changes
 * Returns updated answers object
 */
export function clearDependentAnswers(
  parentQuestionId: string,
  questions: Question[],
  currentAnswers: Record<string, QuestionAnswerValue>,
): Record<string, QuestionAnswerValue> {
  const updatedAnswers = { ...currentAnswers };
  const dependentQuestions = getDependentQuestions(parentQuestionId, questions);

  dependentQuestions.forEach((question) => {
    delete updatedAnswers[question.questionId];
  });

  return updatedAnswers;
}
