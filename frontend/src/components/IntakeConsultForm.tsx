import React from "react";
import type { UserDetails } from "../types/forms";
import "../styles/IntakeConsultForm.css";

interface IntakeConsultFormProps {
  userDetails: UserDetails;
  onChange: (details: UserDetails) => void;
  errors: Record<string, string>;
}

export const IntakeConsultForm: React.FC<IntakeConsultFormProps> = ({
  userDetails,
  onChange,
  errors,
}) => {
  const handleInputChange = (field: keyof UserDetails, value: string) => {
    onChange({
      ...userDetails,
      [field]: value,
    });
  };

  return (
    <div className="intake-consult-form">
      <h2>Intake Consultation Form</h2>
      <p className="form-description">Please provide your basic information</p>

      <form className="form-container">
        {/* Full Name */}
        <div className="form-group">
          <label htmlFor="fullName" className="form-label">
            Full Name <span className="required">*</span>
          </label>
          <input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            autoComplete="off"
            value={userDetails.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            className={`form-input ${errors["fullName"] ? "error" : ""}`}
          />
          {errors["fullName"] && (
            <span className="error-message">{errors["fullName"]}</span>
          )}
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email <span className="required">*</span>
          </label>
          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            autoComplete="off"
            value={userDetails.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`form-input ${errors["email"] ? "error" : ""}`}
          />
          {errors["email"] && (
            <span className="error-message">{errors["email"]}</span>
          )}
        </div>

        {/* Phone Number */}
        <div className="form-group">
          <label htmlFor="phone" className="form-label">
            Phone Number <span className="required">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            placeholder="Enter your phone number"
            autoComplete="off"
            value={userDetails.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className={`form-input ${errors["phone"] ? "error" : ""}`}
          />
          {errors["phone"] && (
            <span className="error-message">{errors["phone"]}</span>
          )}
        </div>

        {/* Date of Birth */}
        <div className="form-group">
          <label htmlFor="dateOfBirth" className="form-label">
            Date of Birth <span className="required">*</span>
          </label>
          <input
            id="dateOfBirth"
            type="date"
            value={userDetails.dateOfBirth}
            onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
            className={`form-input ${errors["dateOfBirth"] ? "error" : ""}`}
          />
          {errors["dateOfBirth"] && (
            <span className="error-message">{errors["dateOfBirth"]}</span>
          )}
        </div>
      </form>
    </div>
  );
};
