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
  await ensureDbConnected();
  return app(req as any, res as any);
}

