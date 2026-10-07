import { z } from "zod";

export const SERVICE_NAME = "saas-growth-talent";

export const healthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.string().min(1),
  version: z.string().min(1),
  timestamp: z.iso.datetime(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

export const HEALTH_RESPONSE_KEYS = ["status", "service", "version", "timestamp"] as const;
