import { z } from "zod";
import { EvidenceSchema } from "./evidence.schema";

export const AnalyticalCategorySchema = z.enum([
  "DOCUMENTED_FACT",
  "CALCULATION",
  "CONSISTENCY",
  "DISCREPANCY",
  "INFERENCE",
  "MISSING_EVIDENCE",
  "RISK",
  "RECOMMENDATION_FOR_REVIEW"
]);
export type AnalyticalCategory = z.infer<typeof AnalyticalCategorySchema>;

export const FactSchema = z.object({
  id: z.string(),
  type: z.string(),
  originalValue: z.unknown(),
  normalizedValue: z.unknown().optional(),
  unit: z.string().nullable().optional(),
  explicitInDocument: z.boolean(),
  evidence: z.array(EvidenceSchema)
});
export type Fact = z.infer<typeof FactSchema>;

export const FindingSchema = z.object({
  id: z.string(),
  category: AnalyticalCategorySchema,
  statement: z.string(),
  supportingFactIds: z.array(z.string()),
  evidenceIds: z.array(z.string()),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW", "UNVERIFIED"]),
  requiresProfessionalReview: z.boolean()
});
export type Finding = z.infer<typeof FindingSchema>;

export const ConclusionSchema = z.object({
  id: z.string(),
  category: AnalyticalCategorySchema,
  text: z.string(),
  supportingFactIds: z.array(z.string()).min(1, "Una conclusión fáctica debe respaldarse en al menos un Fact ID"),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW", "UNVERIFIED"]),
  requiresProfessionalReview: z.boolean()
});
export type Conclusion = z.infer<typeof ConclusionSchema>;
