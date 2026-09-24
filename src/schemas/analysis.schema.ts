import { z } from "zod";
import { StudyDocumentSchema } from "./document.schema";
import { FactSchema, FindingSchema, ConclusionSchema } from "./fact.schema";
import { TitleChainLinkSchema, EncumbranceRecordSchema } from "./title-study.schema";
import { TopographicAnalysisDataSchema } from "./topography.schema";

export const ComparisonStatusSchema = z.enum(["CONSISTENT", "DISCREPANCY", "PARTIAL", "INSUFFICIENT_EVIDENCE"]);
export type ComparisonStatus = z.infer<typeof ComparisonStatusSchema>;

export const ComparisonItemSchema = z.object({
  id: z.string(),
  topic: z.string(),
  sourceA: z.string(),
  valueA: z.string(),
  sourceB: z.string(),
  valueB: z.string(),
  status: ComparisonStatusSchema,
  notes: z.string().optional()
});
export type ComparisonItem = z.infer<typeof ComparisonItemSchema>;

export const QualityReviewSchema = z.object({
  approved: z.boolean(),
  issuesFound: z.array(z.string()),
  evidenceCoverageRatio: z.number().min(0).max(1),
  reviewedAt: z.string()
});
export type QualityReview = z.infer<typeof QualityReviewSchema>;

export const ExecutionManifestSchema = z.object({
  reportId: z.string(),
  studyId: z.string(),
  applicationVersion: z.string(),
  commitSha: z.string(),
  moduleId: z.string(),
  moduleVersion: z.string(),
  provider: z.string(),
  model: z.string(),
  promptVersion: z.string(),
  schemaVersion: z.string(),
  documentHashes: z.array(z.string()),
  schemaValidation: z.enum(["PASS", "FAIL"]),
  criticalReview: z.enum(["PASS", "FAIL"]),
  evidenceGate: z.enum(["PASS", "FAIL"]),
  evidenceCoverage: z.number().min(0).max(100),
  jobId: z.string(),
  generatedAt: z.string()
});
export type ExecutionManifest = z.infer<typeof ExecutionManifestSchema>;

export const CentralAnalysisSchema = z.object({
  schemaVersion: z.literal("1.0.0"),
  study: z.object({
    id: z.string(),
    userId: z.string(),
    name: z.string(),
    createdAt: z.string()
  }),
  documents: z.array(StudyDocumentSchema),
  facts: z.array(FactSchema),
  entities: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["PERSON", "LEGAL_ENTITY", "PROPERTY", "REGISTRATION"]),
    rut: z.string().nullable().optional(),
    role: z.string().nullable().optional()
  })),
  relations: z.array(z.object({
    id: z.string(),
    sourceEntityId: z.string(),
    targetEntityId: z.string(),
    type: z.string(),
    supportingFactId: z.string().optional()
  })),
  titleChain: z.array(TitleChainLinkSchema).optional(),
  encumbrances: z.array(EncumbranceRecordSchema).optional(),
  topography: TopographicAnalysisDataSchema.optional(),
  comparisons: z.array(ComparisonItemSchema),
  discrepancies: z.array(z.string()),
  missingEvidence: z.array(z.string()),
  findings: z.array(FindingSchema),
  conclusions: z.array(ConclusionSchema),
  qualityReview: QualityReviewSchema,
  executionManifest: ExecutionManifestSchema
});
export type CentralAnalysis = z.infer<typeof CentralAnalysisSchema>;
