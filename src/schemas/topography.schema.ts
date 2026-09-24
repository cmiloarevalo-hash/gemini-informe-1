import { z } from "zod";
import { EvidenceSchema } from "./evidence.schema";

export const BoundarySegmentSchema = z.object({
  id: z.string(),
  orientation: z.enum(["NORTE", "SUR", "ORIENTE", "PONIENTE", "NORESTE", "NORPONIENTE", "SURESTE", "SURPONIENTE", "OTRO"]),
  statedLengthMeters: z.number().nonnegative(),
  adjacentOwner: z.string().optional(),
  description: z.string().optional(),
  evidence: z.array(EvidenceSchema)
});
export type BoundarySegment = z.infer<typeof BoundarySegmentSchema>;

export const SurfaceComparisonSchema = z.object({
  sourceType: z.enum(["TITLE_DEED", "SUBDIVISION_PLAN", "TOPOGRAPHIC_SURVEY", "SII_TAX_RECORD"]),
  documentId: z.string(),
  statedValueRaw: z.string(),
  normalizedSquareMeters: z.number().positive(),
  evidence: z.array(EvidenceSchema)
});
export type SurfaceComparison = z.infer<typeof SurfaceComparisonSchema>;

export const TopographicAnalysisDataSchema = z.object({
  segments: z.array(BoundarySegmentSchema),
  surfaces: z.array(SurfaceComparisonSchema),
  perimeterMetersCalculated: z.number().nonnegative(),
  maxSurfaceDiscrepancyPercentage: z.number().nonnegative(),
  isWithinAcceptableTolerance: z.boolean(),
  notes: z.array(z.string())
});
export type TopographicAnalysisData = z.infer<typeof TopographicAnalysisDataSchema>;
