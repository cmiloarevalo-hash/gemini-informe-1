import crypto from "crypto";
import { PDFDocument } from "pdf-lib";
import { StudyDocument, DocumentStatus, ReadingQuality, DocumentType } from "../../schemas/document.schema";

export interface IngestDocumentInput {
  userId: string;
  studyId: string;
  originalName: string;
  mimeType: string;
  buffer: Buffer;
  source: "local" | "drive";
  driveFileId?: string;
}

export class DocumentService {
  private static documentStore: Map<string, { doc: StudyDocument; buffer: Buffer }> = new Map();

  /**
   * Calculates cryptographic SHA-256 hash strictly from raw bytes.
   */
  public static calculateSha256(buffer: Buffer): string {
    return crypto.createHash("sha256").update(buffer).digest("hex");
  }

  /**
   * Inspects binary PDF structure to determine exact page count without estimation.
   */
  public static async inspectPdfPageCount(buffer: Buffer): Promise<number | null> {
    try {
      const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
      return pdfDoc.getPageCount();
    } catch {
      return null;
    }
  }

  /**
   * Primary ingestion pipeline for real files.
   */
  public static async ingestDocument(input: IngestDocumentInput): Promise<StudyDocument> {
    const sha256 = this.calculateSha256(input.buffer);
    const size = input.buffer.length;

    let pageCount: number | null = null;
    let readingQuality: ReadingQuality = "UNKNOWN";

    if (input.mimeType === "application/pdf" || input.originalName.toLowerCase().endsWith(".pdf")) {
      pageCount = await this.inspectPdfPageCount(input.buffer);
      readingQuality = pageCount !== null && pageCount > 0 ? "HIGH" : "UNREADABLE";
    } else if (input.mimeType.startsWith("image/")) {
      pageCount = 1;
      readingQuality = "HIGH";
    }

    const documentId = `doc-${crypto.randomUUID()}`;

    // Extract quick textual hint if text-based or minimal preview
    let textExcerpt: string | undefined = undefined;
    if (input.mimeType.includes("text") || input.originalName.endsWith(".txt")) {
      textExcerpt = input.buffer.toString("utf8").slice(0, 1000);
    }

    const studyDoc: StudyDocument = {
      id: documentId,
      userId: input.userId,
      studyId: input.studyId,
      originalName: input.originalName,
      mimeType: input.mimeType,
      size,
      sha256,
      source: input.source,
      driveFileId: input.driveFileId,
      status: "READY_FOR_AI",
      pageCount,
      readingQuality,
      createdAt: new Date().toISOString(),
      textExcerpt
    };

    this.documentStore.set(documentId, { doc: studyDoc, buffer: input.buffer });
    return studyDoc;
  }

  public static getDocument(documentId: string): StudyDocument | undefined {
    return this.documentStore.get(documentId)?.doc;
  }

  public static getDocumentBuffer(documentId: string): Buffer | undefined {
    return this.documentStore.get(documentId)?.buffer;
  }

  public static listDocumentsByStudy(studyId: string, userId: string): StudyDocument[] {
    const results: StudyDocument[] = [];
    for (const item of this.documentStore.values()) {
      if (item.doc.studyId === studyId && item.doc.userId === userId) {
        results.push(item.doc);
      }
    }
    return results;
  }

  public static deleteDocument(documentId: string, userId: string): boolean {
    const item = this.documentStore.get(documentId);
    if (!item || item.doc.userId !== userId) {
      return false;
    }
    return this.documentStore.delete(documentId);
  }

  public static updateClassification(documentId: string, type: DocumentType): void {
    const item = this.documentStore.get(documentId);
    if (item) {
      item.doc.classifiedType = type;
      item.doc.status = "PROCESSED";
    }
  }
}
