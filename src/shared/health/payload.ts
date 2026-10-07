import { SERVICE_NAME, type HealthResponse } from "@/shared/contracts/health";

export function buildHealthPayload(version: string, now: Date): HealthResponse {
  return {
    status: "ok",
    service: SERVICE_NAME,
    version,
    timestamp: now.toISOString(),
  };
}
