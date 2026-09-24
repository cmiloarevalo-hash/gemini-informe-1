import { z } from "zod";

export const DocumentStatusSchema = z.enum([
  "UPLOADED",
  "PREPARING",
  "READY_FOR_AI",
  "ANALYZING",
  "PROCESSED",
  "FAILED"
]);
export type DocumentStatus = z.infer<typeof DocumentStatusSchema>;

export const ReadingQualitySchema = z.enum([
  "HIGH",
  "MEDIUM",
  "LOW",
  "UNREADABLE",
  "UNKNOWN"
]);
export type ReadingQuality = z.infer<typeof ReadingQualitySchema>;

export const DocumentTypeSchema = z.enum([
  "INSCRIPCION_DOMINIO",
  "DOMINIO_VIGENTE",
  "ESCRITURA_PUBLICA",
  "POSESION_EFECTIVA",
  "INSCRIPCION_ESPECIAL_HERENCIA",
  "CERTIFICADO_HIPOTECAS_GRAVAMENES",
  "CERTIFICADO_PROHIBICIONES",
  "CERTIFICADO_SII",
  "AVALUO_FISCAL",
  "CIP",
  "PLANO",
  "RESOLUCION",
  "SUBDIVISION",
  "LEVANTAMIENTO_TOPOGRAFICO",
  "COMPROBANTE",
  "OTRO"
]);
export type DocumentType = z.infer<typeof DocumentTypeSchema>;

export const StudyDocumentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  studyId: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number().int().nonnegative(),
  sha256: z.string().length(64),
  source: z.enum(["local", "drive"]),
  driveFileId: z.string().optional(),
  status: DocumentStatusSchema,
  pageCount: z.number().int().positive().nullable().optional(),
  readingQuality: ReadingQualitySchema.nullable().optional(),
  classifiedType: DocumentTypeSchema.optional(),
  createdAt: z.string(),
  textExcerpt: z.string().optional()
});
export type StudyDocument = z.infer<typeof StudyDocumentSchema>;
