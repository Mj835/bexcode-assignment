/**
 * API routes for consultations
 */

import { Router, Request, Response } from "express";
import {
  submitConsultation,
  getConsultations,
  getConsultationById,
  getConsultationStats,
} from "../controllers/consultationController";
import { ApiResponse } from "../types";

const router = Router();

/**
 * Health check endpoint
 */
router.get("/health", (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: { message: "API is running" },
    timestamp: new Date().toISOString(),
  };
  res.status(200).json(response);
});

/**
 * Submit a consultation
 */
router.post("/consultations", submitConsultation);

/**
 * Get all consultations
 */
router.get("/consultations", getConsultations);

/**
 * Get statistics
 */
router.get("/consultations/stats", getConsultationStats);

/**
 * Get specific consultation (must be after stats route to avoid :id matching "stats")
 */
router.get("/consultations/:id", getConsultationById);

export default router;
