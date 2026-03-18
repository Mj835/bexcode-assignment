/**
 * Controller for handling consultation operations
 */

import { Request, Response } from "express";
import { Consultation } from "../models/Consultation";
import {
  validateConsultationSubmission,
  validateUserDetails,
  validateResponses,
  validateMetadata,
} from "../utils/validation";
import { ApiResponse } from "../types";

/**
 * Submit a new consultation
 * POST /api/consultations
 */
export async function submitConsultation(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const data = req.body;

    // Validate the entire submission
    const validationErrors = validateConsultationSubmission(data);

    if (validationErrors.length > 0) {
      const response: ApiResponse = {
        success: false,
        error: "Validation failed",
        data: { errors: validationErrors },
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    // Create new consultation document
    const consultation = new Consultation({
      userDetails: data.userDetails,
      responses: data.responses,
      metadata: data.metadata,
    });

    // Save to database
    const saved = await consultation.save();

    const response: ApiResponse = {
      success: true,
      data: {
        id: saved._id,
        message: "Consultation submitted successfully",
      },
      timestamp: new Date().toISOString(),
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error submitting consultation:", error);

    const response: ApiResponse = {
      success: false,
      error: "Failed to submit consultation",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
}

/**
 * Get all consultations (for admin/demo purposes)
 * GET /api/consultations
 */
export async function getConsultations(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const consultations = await Consultation.find()
      .sort({ createdAt: -1 })
      .limit(50);

    const response: ApiResponse = {
      success: true,
      data: consultations,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching consultations:", error);

    const response: ApiResponse = {
      success: false,
      error: "Failed to fetch consultations",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
}

/**
 * Get a specific consultation by ID
 * GET /api/consultations/:id
 */
export async function getConsultationById(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      const response: ApiResponse = {
        success: false,
        error: "Invalid consultation ID format",
        timestamp: new Date().toISOString(),
      };
      res.status(400).json(response);
      return;
    }

    const consultation = await Consultation.findById(id);

    if (!consultation) {
      const response: ApiResponse = {
        success: false,
        error: "Consultation not found",
        timestamp: new Date().toISOString(),
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse = {
      success: true,
      data: consultation,
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching consultation:", error);

    const response: ApiResponse = {
      success: false,
      error: "Failed to fetch consultation",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
}

/**
 * Get statistics about submissions
 * GET /api/consultations/stats
 */
export async function getConsultationStats(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const totalCount = await Consultation.countDocuments();

    const timezoneStats = await Consultation.aggregate([
      {
        $group: {
          _id: "$metadata.timezone",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const response: ApiResponse = {
      success: true,
      data: {
        totalSubmissions: totalCount,
        timezoneDistribution: timezoneStats,
      },
      timestamp: new Date().toISOString(),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching stats:", error);

    const response: ApiResponse = {
      success: false,
      error: "Failed to fetch statistics",
      timestamp: new Date().toISOString(),
    };

    res.status(500).json(response);
  }
}
