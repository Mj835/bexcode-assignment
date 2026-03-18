import type { ConsultMetadata } from "../types/forms";

/**
 * Detects user's timezone from browser
 * Returns timezone string in IANA format (e.g., 'America/New_York')
 */
export function detectUserTimezone(): string {
  try {
    // Use Intl API to detect timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timezone || "UTC";
  } catch (error) {
    console.warn("Failed to detect timezone:", error);
    return "UTC";
  }
}

/**
 * Gets current UTC timestamp in ISO 8601 format
 */
export function getCurrentUTCTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Creates consult metadata with timezone and timestamp
 */
export function createConsultMetadata(): ConsultMetadata {
  return {
    timezone: detectUserTimezone(),
    submittedAt: getCurrentUTCTimestamp(),
  };
}

/**
 * Formats timezone and timestamp for display
 */
export function formatMetadata(metadata: ConsultMetadata): {
  timezone: string;
  localTime: string;
  utcTime: string;
} {
  const date = new Date(metadata.submittedAt);

  return {
    timezone: metadata.timezone,
    localTime: new Intl.DateTimeFormat("en-US", {
      timeZone: metadata.timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date),
    utcTime: date.toUTCString(),
  };
}
