import { z } from "zod";
import { EvidenceSchema } from "./evidence.schema";

export const TitleChainLinkStatusSchema = z.enum([
  "CONFIRMED_LINK",
  "REFERENCED_BUT_NOT_PROVIDED",
  "MISSING_LINK",
  "CONTRADICTORY_LINK",
  "UNVERIFIED_LINK"
]);
export type TitleChainLinkStatus = z.infer<typeof TitleChainLinkStatusSchema>;

export const TitleChainLinkSchema = z.object({
  id: z.string(),
  seller: z.string().optional(),
  buyer: z.string().optional(),
  titleType: z.string(),
  deedDate: z.string().optional(),
  notary: z.string().optional(),
  repertory: z.string().optional(),
  fojas: z.string().optional(),
  numero: z.string().optional(),
  year: z.string().optional(),
  cbr: z.string().optional(),
  previousTitleReference: z.string().optional(),
  status: TitleChainLinkStatusSchema,
  evidence: z.array(EvidenceSchema)
});
export type TitleChainLink = z.infer<typeof TitleChainLinkSchema>;

export const EncumbranceStatusSchema = z.enum([
  "ACTIVE_ENCUMBRANCE",
  "CANCELLED",
  "INSUFFICIENT_EVIDENCE",
  "NO_ENCUMBRANCES_RECORDED"
]);
export type EncumbranceStatus = z.infer<typeof EncumbranceStatusSchema>;

export const EncumbranceRecordSchema = z.object({
  id: z.string(),
  type: z.enum(["HIPOTECA", "GRAVAMEN", "PROHIBICION", "SERVIDUMBRE", "USUFRUCTO", "EMBARGO", "LITIGIO", "OTRO"]),
  description: z.string(),
  fojas: z.string().optional(),
  numero: z.string().optional(),
  year: z.string().optional(),
  cbr: z.string().optional(),
  beneficiary: z.string().optional(),
  status: EncumbranceStatusSchema,
  evidence: z.array(EvidenceSchema)
});
export type EncumbranceRecord = z.infer<typeof EncumbranceRecordSchema>;
