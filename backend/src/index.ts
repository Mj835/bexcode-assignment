/**
 * Local dev/prod server entry point (starts a network listener).
 *
 * On Vercel, we do NOT run this file — serverless runs `api/index.ts` instead.
 */

import dotenv from "dotenv";
import app from "./app";
import { connectToDatabase, disconnectFromDatabase } from "./config/database";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/consultations";
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

async function startServer(): Promise<void> {
  try {
    await connectToDatabase(MONGODB_URI);

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

process.on("SIGINT", async () => {
  console.log("\n\nShutting down gracefully...");
  await disconnectFromDatabase();
  process.exit(0);
});

startServer();
