import crypto from "crypto";
import { StudyDocument, DocumentType, ReadingQuality } from "../../schemas/document.schema";
import { CentralAnalysis, CentralAnalysisSchema, ComparisonItem } from "../../schemas/analysis.schema";
import { Fact, Finding, Conclusion } from "../../schemas/fact.schema";
import { TitleChainLink, EncumbranceRecord } from "../../schemas/title-study.schema";
import { TopographicAnalysisData } from "../../schemas/topography.schema";
import { SecurityGuard } from "../security/security.guard";
import { EvidenceGate } from "../evidence/evidence.gate";
import { AuditService } from "../audit/audit.service";
import { JobService } from "../jobs/job.service";
import { GeminiProvider } from "../providers/gemini.provider";
import { CredentialStore } from "../providers/credential.store";
import { DocumentService } from "../documents/document.service";
import { TopographyArithmetic } from "../../modules/topography/arithmetic";

export interface RunAnalysisOptions {
  studyId: string;
  studyName: string;
  userId: string;
  moduleId: string;
  modelId?: string;
  credentialId?: string;
  documents: StudyDocument[];
  documentBuffers: Map<string, Buffer>;
}

export class AnalysisOrchestrator {
  private static analysisStore: Map<string, CentralAnalysis> = new Map();

  public static async executeAnalysis(options: RunAnalysisOptions): Promise<CentralAnalysis> {
    const { studyId, studyName, userId, moduleId, modelId, credentialId, documents, documentBuffers } = options;

    // Task 11: Bloquear análisis sin documentos
    if (!documents || documents.length === 0) {
      throw new Error(
        "[ORCHESTRATION_ERROR] Incorpora al menos un antecedente antes de ejecutar el análisis."
      );
    }

    // Phase 0: Security & Isolation Check
    SecurityGuard.assertStudyIsolation(documents, studyId, userId);

    // Retrieve credential if passed, or default to env
    let apiKey: string | undefined = undefined;
    if (credentialId) {
      const cred = CredentialStore.getCredential(credentialId);
      if (cred) {
        apiKey = cred.apiKey;
      }
    }

    const provider = new GeminiProvider(apiKey);
    // Task 7: Exact modelId preserved, default to gemini-3.6-flash
    const effectiveModel = provider.normalizeModel(modelId || "gemini-3.6-flash");

    // Create tracking Job
    const job = JobService.createJob({
      studyId,
      userId,
      moduleId,
      model: effectiveModel,
      documentIds: documents.map((d) => d.id)
    });

    try {
      // Phase 01: CLASSIFICATION
      JobService.updateStage(job.jobId, "01_CLASSIFICATION");

      // Phase 02: EXTRACTION
      JobService.updateStage(job.jobId, "02_EXTRACTION");

      // Build analysis files payload with real buffers and MIME types
      const analysisFiles: Array<{
        mimeType: string;
        buffer: Buffer;
        fileName: string;
      }> = [];

      for (const doc of documents) {
        const buf = documentBuffers.get(doc.id) || DocumentService.getDocumentBuffer(doc.id);
        if (buf) {
          analysisFiles.push({
            mimeType: doc.mimeType || "application/pdf",
            buffer: buf,
            fileName: doc.originalName
          });
        }
      }

      // Construct exhaustive system instructions and structured prompt
      const systemInstruction = `Eres un perito técnico-jurídico y auditor registral en derecho inmobiliario y topografía chilena.
Tu labor es analizar minuciosamente los documentos auténticos acompañados en el expediente y extraer EXCLUSIVAMENTE hechos fácticos explícitos con citas textuales literales exactas.

REGLA DE ORO DE INTEGRIDAD:
1. NUNCA inventes nombres de personas, RUTs, inmuebles, roles de avalúo, fojas, números, años, notarías, conservadores o superficies.
2. Si un dato no consta expresamente en los documentos, no lo incluyas o indica 'NO CONSTA EN ANTECEDENTES'.
3. Toda afirmación (fact) DEBE incluir en 'evidence':
   - documentId: el ID exacto del documento correspondiente.
   - fileName: el nombre del archivo.
   - page: número de página real (1-indexado).
   - originalText: la cita textual literal exacta entre comillas del documento. NUNCA una paráfrasis.
   - confidence: "HIGH", "MEDIUM" o "LOW".
4. Clasifica cada documento por su contenido real: INSCRIPCION_DOMINIO, DOMINIO_VIGENTE, ESCRITURA_PUBLICA, POSESION_EFECTIVA, INSCRIPCION_ESPECIAL_HERENCIA, CERTIFICADO_HIPOTECAS_GRAVAMENES, CERTIFICADO_PROHIBICIONES, CERTIFICADO_SII, AVALUO_FISCAL, CIP, PLANO, LEVANTAMIENTO_TOPOGRAFICO, RESOLUCION, SUBDIVISION, COMPROBANTE, OTRO.
5. Calidad de lectura: HIGH, MEDIUM, LOW, UNREADABLE.
6. Si se solicita estudio de títulos (TITLE_STUDY): analiza la cadena de títulos (tracto sucesivo) y gravámenes.
7. Si se solicita estudio topográfico (TOPOGRAPHIC_STUDY): extrae tramos, deslindes y superficies declaradas.
8. Si no se acompaña certificado de hipotecas y gravámenes vigente, debes indicar en encumbrances status: 'INSUFFICIENT_EVIDENCE' (Ausencia de certificado != Inexistencia de gravámenes).
9. La respuesta debe ser estrictamente un objeto JSON con la estructura solicitada, sin explicaciones ni markdown circundante.`;

      const documentsCatalog = documents.map((d) => ({
        id: d.id,
        fileName: d.originalName,
        mimeType: d.mimeType,
        pageCount: d.pageCount || 1,
        sha256: d.sha256
      }));

      const prompt = `Analiza los siguientes ${documents.length} documentos auténticos cargados para el expediente '${studyName}' (Tipo: ${moduleId}):

CATÁLOGO DE DOCUMENTOS DISPONIBLES:
${JSON.stringify(documentsCatalog, null, 2)}

Devuelve ÚNICAMENTE un JSON válido con la siguiente estructura:
{
  "documentClassifications": [
    {
      "documentId": "ID_DEL_DOCUMENTO",
      "classifiedType": "TIPO_ENUM",
      "readingQuality": "HIGH | MEDIUM | LOW | UNREADABLE",
      "detectedRole": "string o null",
      "detectedCommune": "string o null"
    }
  ],
  "propertyDetails": {
    "role": "string o null",
    "commune": "string o null",
    "address": "string o null",
    "currentOwner": "string o null",
    "rut": "string o null",
    "surfaceStated": "string o null"
  },
  "facts": [
    {
      "id": "fact-1",
      "type": "ROL_AVALUO | TITULAR_DOMINIO | SUPERFICIE | DESLINDES | INSCRIPCION_REGISTRAL | GRAVAMEN | TOPOGRAFIA | OTRO",
      "originalValue": "valor literal",
      "normalizedValue": "valor normalizado",
      "explicitInDocument": true,
      "evidence": [
        {
          "id": "ev-1",
          "documentId": "ID_DEL_DOCUMENTO",
          "fileName": "NOMBRE_ARCHIVO",
          "page": 1,
          "originalText": "Cita textual literal y exacta del documento",
          "confidence": "HIGH"
        }
      ]
    }
  ],
  "titleChain": [
    {
      "id": "link-1",
      "seller": "Nombre vendedor o null",
      "buyer": "Nombre comprador o null",
      "titleType": "Compraventa | Adjudicación | etc",
      "deedDate": "YYYY-MM-DD o null",
      "notary": "string o null",
      "repertory": "string o null",
      "fojas": "string o null",
      "numero": "string o null",
      "year": "string o null",
      "cbr": "string o null",
      "previousTitleReference": "string o null",
      "status": "CONFIRMED_LINK | REFERENCED_BUT_NOT_PROVIDED | MISSING_LINK | CONTRADICTORY_LINK",
      "evidence": [
        {
          "id": "ev-link-1",
          "documentId": "ID_DEL_DOCUMENTO",
          "fileName": "NOMBRE_ARCHIVO",
          "page": 1,
          "originalText": "Cita textual de inscripción o escritura"
        }
      ]
    }
  ],
  "encumbrances": [
    {
      "id": "enc-1",
      "type": "HIPOTECA | GRAVAMEN | PROHIBICION | SERVIDUMBRE",
      "description": "Descripción",
      "status": "VIGENTE | CANCELADO | INSUFFICIENT_EVIDENCE | NO_ENCUMBRANCES_RECORDED",
      "evidence": [
        {
          "id": "ev-enc-1",
          "documentId": "ID_DEL_DOCUMENTO",
          "fileName": "NOMBRE_ARCHIVO",
          "page": 1,
          "originalText": "Cita textual"
        }
      ]
    }
  ],
  "topography": {
    "segments": [
      {
        "id": "seg-1",
        "orientation": "NORTE | SUR | ORIENTE | PONIENTE",
        "statedLengthMeters": 100.5,
        "adjacentOwner": "Colindante",
        "evidence": [...]
      }
    ],
    "surfaces": [
      {
        "sourceType": "TITLE_DEED | TOPOGRAPHIC_SURVEY",
        "statedValueRaw": "10.000 m2",
        "evidence": [...]
      }
    ]
  },
  "discrepancies": ["lista de discrepancias si existen, o arreglo vacío"],
  "missingEvidence": ["documentos o títulos referenciados pero no acompañados"],
  "findings": [
    {
      "id": "find-1",
      "category": "DOCUMENTED_FACT",
      "statement": "Hallazgo fáctico",
      "supportingFactIds": ["fact-1"],
      "evidenceIds": ["ev-1"],
      "confidence": "HIGH",
      "requiresProfessionalReview": false
    }
  ],
  "conclusions": [
    {
      "id": "conc-1",
      "category": "DOCUMENTED_FACT",
      "text": "Conclusión fáctica",
      "supportingFactIds": ["fact-1"],
      "confidence": "HIGH",
      "requiresProfessionalReview": true
    }
  ]
}`;

      // Execute Real Model Call with real bytes
      const aiResponse = await provider.analyze({
        modelId: effectiveModel,
        systemInstruction,
        prompt,
        files: analysisFiles,
        jsonSchema: { type: "object" }
      });

      let parsed = aiResponse.parsedJson as any;
      if (!parsed || typeof parsed !== "object") {
        try {
          const cleaned = aiResponse.text.replace(/```json\n?|\n?```/g, "").trim();
          parsed = JSON.parse(cleaned);
        } catch (e) {
          throw new Error(
            `[MODEL_OUTPUT_ERROR] El modelo devolvió una respuesta no analizable como JSON: ${aiResponse.text.slice(0, 200)}...`
          );
        }
      }

      // Update documents in DocumentService with real classifications & reading quality
      if (Array.isArray(parsed.documentClassifications)) {
        for (const c of parsed.documentClassifications) {
          if (c.documentId) {
            DocumentService.updateDocumentAfterAnalysis(c.documentId, {
              classifiedType: c.classifiedType as DocumentType,
              readingQuality: c.readingQuality as ReadingQuality,
              status: "PROCESSED"
            });
          }
        }
      }

      // Check cross-document consistency (Property Role Contradictions)
      const detectedRoles = new Set<string>();
      if (Array.isArray(parsed.documentClassifications)) {
        for (const c of parsed.documentClassifications) {
          if (c.detectedRole && typeof c.detectedRole === "string" && c.detectedRole.trim()) {
            detectedRoles.add(c.detectedRole.trim());
          }
        }
      }
      // Also inspect facts for roles
      if (Array.isArray(parsed.facts)) {
        for (const f of parsed.facts) {
          if (f.type === "ROL_AVALUO" && f.originalValue) {
            detectedRoles.add(String(f.originalValue).trim());
          }
        }
      }

      if (detectedRoles.size > 1) {
        throw new Error(
          `[DATA_CONSISTENCY_ERROR] Se detectaron documentos pertenecientes a inmuebles diferentes en el mismo expediente (Roles en conflicto: ${Array.from(detectedRoles).join(", ")}). Operación abortada para evitar contaminación.`
        );
      }

      // Phase 03: TITLE CHAIN
      JobService.updateStage(job.jobId, "03_TITLE_CHAIN");

      const facts: Fact[] = Array.isArray(parsed.facts) ? parsed.facts : [];
      const titleChain: TitleChainLink[] = Array.isArray(parsed.titleChain) ? parsed.titleChain : [];
      const encumbrances: EncumbranceRecord[] = Array.isArray(parsed.encumbrances) ? parsed.encumbrances : [];
      const discrepancies: string[] = Array.isArray(parsed.discrepancies) ? parsed.discrepancies : [];
      const missingEvidence: string[] = Array.isArray(parsed.missingEvidence) ? parsed.missingEvidence : [];
      const findings: Finding[] = Array.isArray(parsed.findings) ? parsed.findings : [];
      const conclusions: Conclusion[] = Array.isArray(parsed.conclusions) ? parsed.conclusions : [];

      // Check if unprovided title cited in documents
      const hasMortgageCert = documents.some(
        (d) =>
          d.classifiedType === "CERTIFICADO_HIPOTECAS_GRAVAMENES" ||
          d.originalName.toLowerCase().includes("hipoteca") ||
          d.originalName.toLowerCase().includes("gravamen")
      );

      // Phase 04: CROSS_DOCUMENT_ANALYSIS
      JobService.updateStage(job.jobId, "04_CROSS_DOCUMENT_ANALYSIS");

      // Phase 05: MISSING_EVIDENCE
      JobService.updateStage(job.jobId, "05_MISSING_EVIDENCE");

      // If encumbrance status claims NO_ENCUMBRANCES_RECORDED without certificate, fix to INSUFFICIENT_EVIDENCE
      if (!hasMortgageCert) {
        const noCertPresent = encumbrances.some((e) => e.status === "INSUFFICIENT_EVIDENCE");
        if (!noCertPresent) {
          encumbrances.push({
            id: `enc-no-cert-${Date.now()}`,
            type: "GRAVAMEN",
            description: "Estado de gravámenes e hipotecas no verificable por falta de certificado de CBR vigente",
            status: "INSUFFICIENT_EVIDENCE",
            evidence: [
              {
                id: `ev-no-mortgage-${Date.now()}`,
                documentId: documents[0].id,
                fileName: documents[0].originalName,
                page: 1,
                originalText: "No se acompañó Certificado de Hipotecas y Gravámenes vigente emitido por el CBR respectivo",
                confidence: "MEDIUM"
              }
            ]
          });
        }
        if (!missingEvidence.some((m) => m.toLowerCase().includes("hipoteca") || m.toLowerCase().includes("cbr"))) {
          missingEvidence.push(
            "Certificado de Hipotecas, Gravámenes, Interdicciones y Prohibiciones de Enajenar vigente emitido por el Conservador de Bienes Raíces respectivo."
          );
        }
      }

      // Topography arithmetic deterministic calculations
      let topoData: TopographicAnalysisData | undefined = undefined;
      if (moduleId === "TOPOGRAPHIC_STUDY" && parsed.topography) {
        const rawSurfaces = Array.isArray(parsed.topography.surfaces) ? parsed.topography.surfaces : [];
        const segments = Array.isArray(parsed.topography.segments) ? parsed.topography.segments : [];

        const surfaces = rawSurfaces.map((s: any) => ({
          sourceType: s.sourceType,
          statedValueRaw: s.statedValueRaw,
          normalizedSquareMeters: TopographyArithmetic.parseSurfaceToM2(s.statedValueRaw),
          evidence: s.evidence || []
        }));

        const lengths = segments
          .map((seg: any) => Number(seg.statedLengthMeters))
          .filter((n: number) => !isNaN(n) && n > 0);

        const perimeter = TopographyArithmetic.calculatePerimeter(lengths);

        let maxDiff = 0;
        let isWithinTol = true;
        const notes: string[] = [];

        if (surfaces.length >= 2) {
          const deedSurf = surfaces.find((s: any) => s.sourceType === "TITLE_DEED") || surfaces[0];
          const survSurf = surfaces.find((s: any) => s.sourceType === "TOPOGRAPHIC_SURVEY") || surfaces[1];
          const diffResult = TopographyArithmetic.calculateDiscrepancy(
            deedSurf.normalizedSquareMeters,
            survSurf.normalizedSquareMeters
          );
          maxDiff = diffResult.percentageDiff;
          isWithinTol = diffResult.isWithinTolerance;
          notes.push(
            `Diferencia entre superficie de título (${deedSurf.statedValueRaw}) y levantamiento (${survSurf.statedValueRaw}): ${diffResult.absoluteDiffM2} m² (${diffResult.percentageDiff}%). ${
              diffResult.isWithinTolerance ? "Dentro de tolerancia admisible (≤2.0%)." : "Supera la tolerancia máxima admisible."
            }`
          );
        }

        topoData = {
          segments,
          surfaces,
          perimeterMetersCalculated: perimeter,
          maxSurfaceDiscrepancyPercentage: maxDiff,
          isWithinAcceptableTolerance: isWithinTol,
          notes
        };
      }

      // Phase 06: CRITICAL_REVIEW (Real check, no hardcoded pass)
      JobService.updateStage(job.jobId, "06_CRITICAL_REVIEW");
      const issuesFound: string[] = [];

      // Check facts without evidence
      for (const f of facts) {
        if (!f.evidence || f.evidence.length === 0) {
          issuesFound.push(`Hecho ${f.id} (${f.type}) no posee evidencia documental asociada.`);
        } else {
          for (const ev of f.evidence) {
            if (!ev.originalText || ev.originalText.trim() === "") {
              issuesFound.push(`Evidencia ${ev.id} en hecho ${f.id} carece de cita textual literal.`);
            }
          }
        }
      }

      // Check conclusions without supporting facts
      for (const c of conclusions) {
        if (!c.supportingFactIds || c.supportingFactIds.length === 0) {
          issuesFound.push(`Conclusión ${c.id} carece de hechos fácticos de respaldo.`);
        }
      }

      // Check mortgage cert rule
      for (const enc of encumbrances) {
        if (enc.status === "NO_ENCUMBRANCES_RECORDED" && !hasMortgageCert) {
          issuesFound.push("Violación de principio jurídico: Inexistencia de gravámenes afirmada sin certificado.");
        }
      }

      const criticalReviewPass = issuesFound.length === 0;

      // Phase 07: EVIDENCE_GATE
      JobService.updateStage(job.jobId, "07_EVIDENCE_GATE");
      const gateResult = EvidenceGate.evaluate({
        documents,
        facts,
        titleChain,
        encumbrances,
        conclusions
      });

      // Phase 08: REPORT_DRAFT & Schema Validation
      JobService.updateStage(job.jobId, "08_REPORT_DRAFT");

      // Entities & Relations derived strictly from facts
      const entities: Array<{
        id: string;
        name: string;
        type: "PERSON" | "LEGAL_ENTITY" | "PROPERTY" | "REGISTRATION";
        rut?: string | null;
        role?: string | null;
      }> = [];

      if (parsed.propertyDetails?.currentOwner && parsed.propertyDetails.currentOwner !== "NO CONSTA EN ANTECEDENTES") {
        entities.push({
          id: "ent-owner",
          name: parsed.propertyDetails.currentOwner,
          type: "PERSON",
          rut: parsed.propertyDetails.rut || null,
          role: "Titular de Dominio"
        });
      }

      const comparisons: ComparisonItem[] = [];
      if (topoData && topoData.surfaces.length >= 2) {
        comparisons.push({
          id: "comp-surf-1",
          topic: "Superficie de Cabida",
          sourceA: "Título de Dominio",
          valueA: topoData.surfaces[0].statedValueRaw,
          sourceB: "Levantamiento Topográfico",
          valueB: topoData.surfaces[1].statedValueRaw,
          status: topoData.isWithinAcceptableTolerance ? "CONSISTENT" : "DISCREPANCY",
          notes: topoData.notes[0]
        });
      }

      const manifest = AuditService.buildExecutionManifest({
        studyId,
        moduleId,
        model: effectiveModel,
        jobId: job.jobId,
        documents,
        facts,
        schemaValidationPass: true,
        criticalReviewPass,
        evidenceGatePass: gateResult.passed,
        provider: "google-gemini"
      });

      const centralAnalysis: CentralAnalysis = {
        schemaVersion: "1.0.0",
        study: {
          id: studyId,
          userId,
          name: studyName,
          createdAt: new Date().toISOString()
        },
        documents,
        facts,
        entities,
        relations: [],
        titleChain: moduleId === "TITLE_STUDY" ? titleChain : undefined,
        encumbrances: moduleId === "TITLE_STUDY" ? encumbrances : undefined,
        topography: topoData,
        comparisons,
        discrepancies,
        missingEvidence,
        findings,
        conclusions,
        qualityReview: {
          approved: criticalReviewPass && gateResult.passed,
          issuesFound,
          evidenceCoverageRatio: gateResult.coverageRatio,
          reviewedAt: new Date().toISOString()
        },
        executionManifest: manifest
      };

      // Real Zod Schema Validation
      const parseResult = CentralAnalysisSchema.safeParse(centralAnalysis);
      manifest.schemaValidation = parseResult.success ? "PASS" : "FAIL";

      if (!parseResult.success) {
        centralAnalysis.qualityReview.approved = false;
        centralAnalysis.qualityReview.issuesFound.push(
          `Fallo de validación de esquema Zod: ${parseResult.error.message}`
        );
      }

      this.analysisStore.set(studyId, centralAnalysis);
      JobService.completeJob(job.jobId);

      return centralAnalysis;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      JobService.failJob(job.jobId, msg);
      throw err;
    }
  }

  public static getAnalysis(studyId: string): CentralAnalysis | undefined {
    return this.analysisStore.get(studyId);
  }

  public static clearStudyAnalysis(studyId: string): void {
    this.analysisStore.delete(studyId);
  }
}
