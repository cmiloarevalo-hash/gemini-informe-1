import { z } from "zod";

export const ConfidenceLevelSchema = z.enum(["HIGH", "MEDIUM", "LOW"]);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevelSchema>;

export const EvidenceSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  fileName: z.string(),
  page: z.number().int().positive().nullable(),
  originalText: z.string().nullable(),
  confidence: ConfidenceLevelSchema
});
export type Evidence = z.infer<typeof EvidenceSchema>;
