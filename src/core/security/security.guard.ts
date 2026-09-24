import { StudyDocument } from "../../schemas/document.schema";

export class SecurityGuard {
  /**
   * Enforces strict multi-tenant and cross-study isolation.
   * Prevents mixing documents from different studies or users.
   */
  public static assertStudyIsolation(
    documents: StudyDocument[],
    targetStudyId: string,
    targetUserId: string
  ): void {
    for (const doc of documents) {
      if (doc.studyId !== targetStudyId) {
        throw new Error(
          `[SECURITY_VIOLATION] Cross-study contamination detected: Document '${doc.id}' belongs to study '${doc.studyId}', but execution is for study '${targetStudyId}'.`
        );
      }
      if (doc.userId !== targetUserId) {
        throw new Error(
          `[SECURITY_VIOLATION] Multi-tenant access violation: Document '${doc.id}' belongs to user '${doc.userId}', but session is for user '${targetUserId}'.`
        );
      }
    }
  }

  /**
   * Validates that an evidence item refers to an existing document in the study.
   */
  public static assertEvidenceReference(
    documentId: string,
    validDocumentIds: Set<string>
  ): void {
    if (!validDocumentIds.has(documentId)) {
      throw new Error(
        `[SECURITY_VIOLATION] Tampered evidence: Document ID '${documentId}' does not belong to the verified documents in this study.`
      );
    }
  }
}
