/**
 * Main Express application entry point
 */

import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectToDatabase, disconnectFromDatabase } from "./config/database";
import routes from "./routes";
import { errorHandler, notFoundHandler, requestLogger } from "./middleware";
import { ApiResponse } from "./types";

// Load environment variables
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/consultations";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from the configured origin (with or without trailing slash)
      const allowedOrigin = CORS_ORIGIN.replace(/\/$/, ""); // Remove trailing slash
      const cleanOrigin = origin?.replace(/\/$/, "") || "";

      if (!origin || cleanOrigin === allowedOrigin || cleanOrigin === "http://localhost:5173") {
        callback(null, true);
      } else {
        callback(new Error(`CORS not allowed from ${origin}`));
      }
    },
    credentials: true,
  }),
);
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

/**
 * Start server
 */
async function startServer(): Promise<void> {
  try {
    // Connect to database
    await connectToDatabase(MONGODB_URI);

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n✓ Server is running on http://localhost:${PORT}`);
      console.log(`✓ CORS enabled for: ${CORS_ORIGIN}`);
      console.log(`✓ Database: ${MONGODB_URI}\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n\nShutting down gracefully...");
  await disconnectFromDatabase();
  process.exit(0);
});

startServer();

export default app;
