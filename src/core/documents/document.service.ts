import crypto from "crypto";
import { PDFDocument } from "pdf-lib";
import { StudyDocument, ReadingQuality, DocumentType } from "../../schemas/document.schema";

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
   * Validates backend format for PDF, DOCX, JPG, JPEG, PNG.
   * Throws FILE_FORMAT_ERROR if format is unauthorized.
   */
  public static validateFormat(originalName: string, mimeType: string): void {
    const ext = originalName.slice(originalName.lastIndexOf(".")).toLowerCase();
    const allowedExtensions = [".pdf", ".docx", ".jpg", ".jpeg", ".png"];

    const isPdf = ext === ".pdf" || mimeType === "application/pdf";
    const isDocx =
      ext === ".docx" ||
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      mimeType === "application/msword";
    const isJpg = ext === ".jpg" || ext === ".jpeg" || mimeType === "image/jpeg" || mimeType === "image/pjpeg";
    const isPng = ext === ".png" || mimeType === "image/png";

    if (!allowedExtensions.includes(ext) && !isPdf && !isDocx && !isJpg && !isPng) {
      throw new Error(
        `[FILE_FORMAT_ERROR] Formato no admitido para '${originalName}'. Solo se permiten archivos PDF, DOCX, JPG, JPEG y PNG.`
      );
    }
  }

  /**
   * Primary ingestion pipeline for real files.
   */
  public static async ingestDocument(input: IngestDocumentInput): Promise<StudyDocument> {
    // Backend validation of format
    this.validateFormat(input.originalName, input.mimeType);

    const sha256 = this.calculateSha256(input.buffer);
    const size = input.buffer.length;

    let pageCount: number | null = null;
    // Task 3: No marcar readingQuality HIGH automáticamente. Inicialmente UNKNOWN.
    const readingQuality: ReadingQuality = "UNKNOWN";

    if (input.mimeType === "application/pdf" || input.originalName.toLowerCase().endsWith(".pdf")) {
      pageCount = await this.inspectPdfPageCount(input.buffer);
    } else if (input.mimeType.startsWith("image/") || /\.(png|jpe?g)$/i.test(input.originalName)) {
      pageCount = 1;
    }

    const documentId = `doc-${crypto.randomUUID()}`;

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
      createdAt: new Date().toISOString()
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

  public static updateDocumentAfterAnalysis(
    documentId: string,
    updates: { classifiedType?: DocumentType; readingQuality?: ReadingQuality; status?: StudyDocument["status"] }
  ): void {
    const item = this.documentStore.get(documentId);
    if (item) {
      if (updates.classifiedType) item.doc.classifiedType = updates.classifiedType;
      if (updates.readingQuality) item.doc.readingQuality = updates.readingQuality;
      if (updates.status) item.doc.status = updates.status;
    }
  }
}
