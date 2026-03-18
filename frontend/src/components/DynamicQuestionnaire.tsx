import React from "react";
import type { Question, QuestionAnswerValue } from "../types/forms";
import {
  getVisibleQuestions,
  clearDependentAnswers,
} from "../utils/conditionalLogic";
import "../styles/DynamicQuestionnaire.css";

interface DynamicQuestionnaireProps {
  questions: Question[];
  answers: Record<string, QuestionAnswerValue>;
  onChange: (
    questionId: string,
    answer: QuestionAnswerValue,
    clearedAnswers?: Record<string, QuestionAnswerValue>,
  ) => void;
  errors: Record<string, string>;
}

export const DynamicQuestionnaire: React.FC<DynamicQuestionnaireProps> = ({
  questions,
  answers,
  onChange,
  errors,
}) => {
  // Filter to only show visible questions based on dependencies
  const visibleQuestions = getVisibleQuestions(questions, answers);

  const handleAnswerChange = (
    questionId: string,
    answer: QuestionAnswerValue,
  ) => {
    // Clear dependent answers when parent answer changes
    const updatedAnswers = clearDependentAnswers(
      questionId,
      questions,
      answers,
    );
    // Update via parent's onChange handler with both new answer and cleared dependents
    onChange(questionId, answer, updatedAnswers);
  };

  const renderQuestion = (question: Question) => {
    const errorKey = `q_${question.questionId}`;
    const hasError = !!errors[errorKey];

    switch (question.questionType) {
      case "radio":
        return renderRadioQuestion(question, hasError, errorKey);
      case "select":
        return renderSelectQuestion(question, hasError, errorKey);
      case "multi-select":
        return renderMultiSelectQuestion(question, hasError, errorKey);
      case "compound":
        return renderCompoundQuestion(question, hasError, errorKey);
      default:
        return null;
    }
  };

  const renderRadioQuestion = (
    question: Question,
    hasError: boolean,
    errorKey: string,
  ) => {
    const answer = (
      typeof answers[question.questionId] === "string"
        ? answers[question.questionId]
        : ""
    ) as string;

    return (
      <div key={question.questionId} className="question-container">
        <label className="question-label">
          {question.question}
          {question.required && <span className="required">*</span>}
          {question.dependsOn && (
            <span className="conditional-indicator">Conditional</span>
          )}
        </label>
        {question.description && (
          <p className="question-description">{question.description}</p>
        )}

        <div className={`radio-group ${hasError ? "error" : ""}`}>
          {question.options?.map((option) => (
            <div key={option.value} className="radio-option">
              <input
                type="radio"
                id={`${question.questionId}_${option.value}`}
                name={question.questionId}
                value={option.value}
                checked={answer === option.value}
                onChange={(e) =>
                  handleAnswerChange(question.questionId, e.target.value)
                }
              />
              <label htmlFor={`${question.questionId}_${option.value}`}>
                {option.label}
              </label>
            </div>
          ))}
        </div>

        {hasError && <span className="error-message">{errors[errorKey]}</span>}
      </div>
    );
  };

  const renderSelectQuestion = (
    question: Question,
    hasError: boolean,
    errorKey: string,
  ) => {
    const answer = (
      typeof answers[question.questionId] === "string"
        ? answers[question.questionId]
        : ""
    ) as string;

    return (
      <div key={question.questionId} className="question-container">
        <label htmlFor={question.questionId} className="question-label">
          {question.question}
          {question.required && <span className="required">*</span>}
          {question.dependsOn && (
            <span className="conditional-indicator">Conditional</span>
          )}
        </label>
        {question.description && (
          <p className="question-description">{question.description}</p>
        )}

        <select
          id={question.questionId}
          value={answer}
          onChange={(e) =>
            handleAnswerChange(question.questionId, e.target.value)
          }
          className={`form-select ${hasError ? "error" : ""}`}
        >
          <option value="">-- Select an option --</option>
          {question.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {hasError && <span className="error-message">{errors[errorKey]}</span>}
      </div>
    );
  };

  const renderMultiSelectQuestion = (
    question: Question,
    hasError: boolean,
    errorKey: string,
  ) => {
    const answer = (
      Array.isArray(answers[question.questionId])
        ? answers[question.questionId]
        : []
    ) as string[];

    const handleCheckboxChange = (value: string, checked: boolean) => {
      const updatedAnswer = checked
        ? [...answer, value]
        : answer.filter((v: string) => v !== value);
      handleAnswerChange(question.questionId, updatedAnswer);
    };

    return (
      <div key={question.questionId} className="question-container">
        <label className="question-label">
          {question.question}
          {question.required && <span className="required">*</span>}
          {question.dependsOn && (
            <span className="conditional-indicator">Conditional</span>
          )}
        </label>
        {question.description && (
          <p className="question-description">{question.description}</p>
        )}

        <div className={`checkbox-group ${hasError ? "error" : ""}`}>
          {question.options?.map((option) => (
            <div key={option.value} className="checkbox-option">
              <input
                type="checkbox"
                id={`${question.questionId}_${option.value}`}
                checked={answer.includes(option.value)}
                onChange={(e) =>
                  handleCheckboxChange(option.value, e.target.checked)
                }
              />
              <label htmlFor={`${question.questionId}_${option.value}`}>
                {option.label}
              </label>
            </div>
          ))}
        </div>

        {hasError && <span className="error-message">{errors[errorKey]}</span>}
      </div>
    );
  };

  const renderCompoundQuestion = (
    question: Question,
    hasError: boolean,
    errorKey: string,
  ) => {
    const answer = (answers[question.questionId] || {}) as Record<
      string,
      string
    >;

    const handleFieldChange = (fieldName: string, value: string) => {
      handleAnswerChange(question.questionId, {
        ...answer,
        [fieldName]: value,
      });
    };

    return (
      <div key={question.questionId} className="question-container">
        <label className="question-label">
          {question.question}
          {question.required && <span className="required">*</span>}
          {question.dependsOn && (
            <span className="conditional-indicator">Conditional</span>
          )}
        </label>
        {question.description && (
          <p className="question-description">{question.description}</p>
        )}

        <div className={`compound-fields ${hasError ? "error" : ""}`}>
          {question.compoundFields?.map((field) => (
            <div key={field.name} className="compound-field">
              <label htmlFor={`${question.questionId}_${field.name}`}>
                {field.label}
              </label>

              {field.type === "select" && field.options ? (
                <select
                  id={`${question.questionId}_${field.name}`}
                  value={answer[field.name] || ""}
                  onChange={(e) =>
                    handleFieldChange(field.name, e.target.value)
                  }
                  className="form-input"
                >
                  <option value="">Select...</option>
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  id={`${question.questionId}_${field.name}`}
                  type={field.type}
                  placeholder={field.placeholder || ""}
                  value={answer[field.name] || ""}
                  onChange={(e) =>
                    handleFieldChange(field.name, e.target.value)
                  }
                  className="form-input"
                />
              )}
            </div>
          ))}
        </div>

        {hasError && <span className="error-message">{errors[errorKey]}</span>}
      </div>
    );
  };

  return (
    <div className="dynamic-questionnaire">
      <h2>Health Questionnaire</h2>
      <p className="questionnaire-description">
        Please answer all questions carefully
      </p>
      <div className="questions-list">
        {visibleQuestions.map((question) => renderQuestion(question))}
      </div>
    </div>
  );
};
