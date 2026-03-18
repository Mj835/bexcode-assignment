import { useState } from "react";
import { IntakeConsultForm } from "./components/IntakeConsultForm";
import { DynamicQuestionnaire } from "./components/DynamicQuestionnaire";
import { parseFormResponses, validateFormData } from "./utils/responseParser";
import { formatMetadata } from "./utils/timezone";
import { submitConsultation, ApiError } from "./utils/api";
import type {
  UserDetails,
  FormValues,
  Question,
  FormSubmissionData,
  QuestionAnswerValue,
} from "./types/forms";
import questionnairesData from "./data/questionnaire.json";
import "./App.css";

function App() {
  const [formValues, setFormValues] = useState<FormValues>({
    userDetails: {
      fullName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
    },
    questionAnswers: {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedData, setSubmittedData] = useState<FormSubmissionData | null>(
    null,
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submissionId, setSubmissionId] = useState<string | null>(null);

  const questions: Question[] = questionnairesData.questions as Question[];

  const handleUserDetailsChange = (details: UserDetails) => {
    setFormValues((prev) => ({
      ...prev,
      userDetails: details,
    }));
    // Clear errors for these fields as user fills them
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.fullName;
      delete updated.email;
      delete updated.phone;
      delete updated.dateOfBirth;
      return updated;
    });
    // Clear API error when user starts correcting
    setApiError(null);
  };

  const handleQuestionAnswerChange = (
    questionId: string,
    answer: QuestionAnswerValue,
    clearedAnswers?: Record<string, QuestionAnswerValue>,
  ) => {
    setFormValues((prev) => {
      // Start with cleared answers if provided, otherwise use current answers
      const baseAnswers = clearedAnswers || prev.questionAnswers;
      return {
        ...prev,
        questionAnswers: {
          ...baseAnswers,
          [questionId]: answer,
        },
      };
    });
    // Clear error for this specific question
    setErrors((prev) => {
      const updated = { ...prev };
      delete updated[`q_${questionId}`];
      return updated;
    });
    // Clear API error when user starts correcting
    setApiError(null);
  };

  const handleSubmit = async () => {
    // Validate form data
    const validation = validateFormData(formValues, questions);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setApiError(null);
      console.log("Form validation failed:", validation.errors);
      return;
    }

    // Clear errors if validation passes
    setErrors({});
    setApiError(null);

    // Parse responses into standardized format
    const parsedData = parseFormResponses(formValues, questions);
    setSubmittedData(parsedData);

    // Submit to API
    setIsLoading(true);
    try {
      console.log("Submitting form data to API...", parsedData);
      const response = await submitConsultation(parsedData);
      console.log("Form submitted successfully!", response);
      setSubmissionId(response.id);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
      if (error instanceof ApiError) {
        // Handle validation errors from API
        if (error.validationErrors && error.validationErrors.length > 0) {
          // Parse validation errors back to field errors
          const fieldErrors: Record<string, string> = {};
          error.validationErrors.forEach((err: string) => {
            // For question errors, ensure key starts with q_
            if (err.includes("q_") || err.includes("question")) {
              const match = err.match(/q_?([^:]+)/);
              const field = match ? `q_${match[1]}` : "general";
              fieldErrors[field] = err;
            } else {
              // For user details errors
              const match = err.match(/^([^:]+)/);
              const field = match ? match[1] : "general";
              fieldErrors[field] = err;
            }
          });
          setErrors(fieldErrors);
        }
        setApiError(error.message);
      } else {
        setApiError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormValues({
      userDetails: {
        fullName: "",
        email: "",
        phone: "",
        dateOfBirth: "",
      },
      questionAnswers: {},
    });
    setErrors({});
    setSubmittedData(null);
    setIsSubmitted(false);
    setApiError(null);
    setSubmissionId(null);
    setIsLoading(false);
  };

  return (
    <div className="app-container">
      {!isSubmitted ? (
        <>
          <header className="app-header">
            <h1>Health Intake Consultation</h1>
            <p>Complete the form below to begin your consultation</p>
          </header>

          <main className="app-main">
            <div className="form-wrapper">
              <IntakeConsultForm
                userDetails={formValues.userDetails}
                onChange={handleUserDetailsChange}
                errors={errors}
              />

              <DynamicQuestionnaire
                questions={questions}
                answers={formValues.questionAnswers}
                onChange={handleQuestionAnswerChange}
                errors={errors}
              />

              {apiError && (
                <div className="error-message" style={{ marginTop: "1rem" }}>
                  <strong>Error:</strong> {apiError}
                </div>
              )}

              <div className="form-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleReset}
                  disabled={isLoading}
                >
                  Reset
                </button>
              </div>
            </div>
          </main>
        </>
      ) : (
        <>
          <header className="app-header">
            <h1>Submission Successful ✓</h1>
            <p>Your information has been recorded</p>
            {submissionId && (
              <p className="submission-id-display">
                <strong>Submission ID:</strong> {submissionId}
              </p>
            )}
          </header>

          <main className="app-main">
            <div className="form-wrapper">
              <div className="submission-summary">
                <h2>Submitted Data</h2>
                <div className="summary-section">
                  <h3>User Details</h3>
                  <div className="summary-content">
                    <p>
                      <strong>Full Name:</strong>{" "}
                      {submittedData?.userDetails.fullName}
                    </p>
                    <p>
                      <strong>Email:</strong> {submittedData?.userDetails.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {submittedData?.userDetails.phone}
                    </p>
                    <p>
                      <strong>Date of Birth:</strong>{" "}
                      {submittedData?.userDetails.dateOfBirth}
                    </p>
                  </div>
                </div>

                {submittedData?.metadata && (
                  <div className="summary-section">
                    <h3>Submission Metadata</h3>
                    <div className="summary-content">
                      {(() => {
                        const formatted = formatMetadata(
                          submittedData.metadata,
                        );
                        return (
                          <>
                            <p>
                              <strong>User Timezone:</strong>{" "}
                              {formatted.timezone}
                            </p>
                            <p>
                              <strong>Local Submission Time:</strong>{" "}
                              {formatted.localTime}
                            </p>
                            <p>
                              <strong>UTC Submission Time:</strong>{" "}
                              {formatted.utcTime}
                            </p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                <div className="summary-section">
                  <h3>Responses</h3>
                  <div className="responses-list">
                    {submittedData?.responses.map((response) => {
                      const question = questions.find(
                        (q) => q.questionId === response.questionId,
                      );
                      return (
                        <div
                          key={response.questionId}
                          className="response-item"
                        >
                          <div className="response-question">
                            <strong>{question?.question}</strong>
                            <span className="response-type">
                              {response.questionType}
                            </span>
                          </div>
                          <div className="response-answer">
                            <strong>Answer:</strong> {response.answer}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="summary-section">
                  <h3>Raw JSON Output</h3>
                  <pre className="json-output">
                    {JSON.stringify(submittedData, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn btn-primary" onClick={handleReset}>
                  Start Over
                </button>
              </div>
            </div>
          </main>
        </>
      )}
    </div>
  );
}

export default App;
