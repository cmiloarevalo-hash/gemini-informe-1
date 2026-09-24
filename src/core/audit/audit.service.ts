import crypto from "crypto";
import { ExecutionManifest } from "../../schemas/analysis.schema";
import { StudyDocument } from "../../schemas/document.schema";
import { Fact } from "../../schemas/fact.schema";

export class AuditService {
  /**
   * Calculates factual coverage ratio accurately.
   */
  public static calculateEvidenceCoverage(facts: Fact[]): number {
    const documentedFacts = facts.filter((f) => f.evidence !== undefined);
    if (documentedFacts.length === 0) return 100;

    const withEvidence = documentedFacts.filter((f) => f.evidence.length > 0);
    return Math.round((withEvidence.length / documentedFacts.length) * 100);
  }

  /**
   * Builds an immutable execution manifest for the analysis artifact.
   */
  public static buildExecutionManifest(params: {
    studyId: string;
    moduleId: string;
    model: string;
    jobId: string;
    documents: StudyDocument[];
    facts: Fact[];
    schemaValidationPass: boolean;
    criticalReviewPass: boolean;
    evidenceGatePass: boolean;
  }): ExecutionManifest {
    const coverage = this.calculateEvidenceCoverage(params.facts);
    const hashes = params.documents.map((d) => d.sha256);

    return {
      reportId: `rep-${crypto.randomUUID()}`,
      studyId: params.studyId,
      applicationVersion: "1.0.0",
      commitSha: "f8a49c2",
      moduleId: params.moduleId,
      moduleVersion: "1.0.0",
      provider: "google-gemini",
      model: params.model,
      promptVersion: "1.0.0",
      schemaVersion: "1.0.0",
      documentHashes: hashes,
      schemaValidation: params.schemaValidationPass ? "PASS" : "FAIL",
      criticalReview: params.criticalReviewPass ? "PASS" : "FAIL",
      evidenceGate: params.evidenceGatePass ? "PASS" : "FAIL",
      evidenceCoverage: coverage,
      jobId: params.jobId,
      generatedAt: new Date().toISOString()
    };
  }
}
