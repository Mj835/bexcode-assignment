import type { VercelRequest, VercelResponse } from "@vercel/node";
import mongoose from "mongoose";
import app from "../src/app";
import { connectToDatabase } from "../src/config/database";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/consultations";

let connecting: Promise<void> | null = null;

async function ensureDbConnected(): Promise<void> {
  if (mongoose.connection.readyState === 1) return; // connected
  if (!connecting) {
    connecting = connectToDatabase(MONGODB_URI).finally(() => {
      connecting = null;
    });
  }
  await connecting;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await ensureDbConnected();
    return (app as any)(req, res);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";
    const stack = error instanceof Error ? error.stack : undefined;

    // Vercel logs will show this, and we also return a minimal JSON payload
    console.error("Serverless handler crashed:", message, stack);

    if (!res.headersSent) {
      res
        .status(500)
        .json({ success: false, error: message, timestamp: new Date().toISOString() });
    }
    return;
  }
}

