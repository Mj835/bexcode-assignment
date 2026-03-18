/**
 * Database connection utility
 */

import mongoose from "mongoose";

export async function connectToDatabase(mongoUri: string): Promise<void> {
  try {
    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB");
  } catch (error) {
    console.error("✗ Failed to connect to MongoDB:", error);
    throw error;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log("✓ Disconnected from MongoDB");
  } catch (error) {
    console.error("✗ Failed to disconnect from MongoDB:", error);
    throw error;
  }
}
