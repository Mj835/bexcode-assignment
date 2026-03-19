/**
 * Express app (no network listener).
 *
 * This is used by:
 * - Local server (`src/index.ts`) which calls `app.listen(...)`
 * - Vercel serverless handler (`api/index.ts`) which invokes the app per request
 */

import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes";
import { errorHandler, notFoundHandler, requestLogger } from "./middleware";
import { ApiResponse } from "./types";

// Load environment variables
dotenv.config();

const app: Express = express();

const corsOptions = {
  origin: function (origin: string | undefined, callback: Function) {
    if (!origin) {
      return callback(null, true);
    }

    const cleanOrigin = origin.replace(/\/$/, "");

    const allowedOrigins = [
      "https://bexcode-assignment.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
    ];

    if (process.env.CORS_ORIGIN) {
      allowedOrigins.push(process.env.CORS_ORIGIN.replace(/\/$/, ""));
    }

    if (allowedOrigins.includes(cleanOrigin)) {
      callback(null, true);
    } else {
      console.log(`CORS request rejected from origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Type"],
  optionsSuccessStatus: 200,
  maxAge: 86400,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    data: {
      message: "Health Consultation API",
      version: "1.0.0",
      endpoints: {
        health: "GET /api/health",
        submit: "POST /api/consultations",
        list: "GET /api/consultations",
        getOne: "GET /api/consultations/:id",
        stats: "GET /api/consultations/stats",
      },
    },
    timestamp: new Date().toISOString(),
  };
  res.json(response);
});

// API Routes
app.use("/api", routes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

