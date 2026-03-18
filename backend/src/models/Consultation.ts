import mongoose, { Document, Schema } from "mongoose";
import { ConsultationSubmission } from "../types";

/**
 * MongoDB schema for storing consultation submissions
 */

// User details subdocument
const userDetailsSchema = new Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  dateOfBirth: {
    type: String,
    required: true,
  },
});

// Question response subdocument
const questionResponseSchema = new Schema({
  questionId: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    enum: ["radio", "select", "multi-select", "compound"],
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
});

// Main consultation schema
const consultationSchema = new Schema(
  {
    userDetails: {
      type: userDetailsSchema,
      required: true,
    },
    responses: {
      type: [questionResponseSchema],
      required: true,
    },
    metadata: {
      timezone: {
        type: String,
        required: true,
      },
      submittedAt: {
        type: String, // ISO 8601 UTC timestamp
        required: true,
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true, // Index for querying recent submissions
    },
  },
  {
    collection: "consultations",
  },
);

// Export the model
export interface IConsultation extends ConsultationSubmission, Document {
  createdAt: Date;
}

export const Consultation = mongoose.model<IConsultation>(
  "Consultation",
  consultationSchema,
);
