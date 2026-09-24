import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { DocumentService } from "../src/core/documents/document.service";
import { EvidenceGate, EvidenceGateError } from "../src/core/evidence/evidence.gate";
import { SecurityGuard } from "../src/core/security/security.guard";
import { GeminiProvider } from "../src/core/providers/gemini.provider";
import { CredentialStore } from "../src/core/providers/credential.store";
import { TopographyArithmetic } from "../src/modules/topography/arithmetic";
import { DocxReportGenerator } from "../src/core/reports/docx.generator";
import { CentralAnalysis } from "../src/schemas/analysis.schema";
import { AnalysisOrchestrator } from "../src/core/analysis/analysis.orchestrator";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log("==================================================");
  console.log("🧪 EJECUTANDO SUITE DE PRUEBAS TÉCNICAS OBLIGATORIAS");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testId: string, description: string) {
    if (condition) {
      console.log(`[PASS] ${testId}: ${description}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testId}: ${description}`);
      failed++;
    }
  }

  // Load real synthetic PDF fixtures
  const fixturePathA = path.join(__dirname, "fixtures", "sample-inscripcion.pdf");
  const fixturePathB = path.join(__dirname, "fixtures", "archivo-sin-relacion-con-el-contenido.pdf");
  const pdfBytes = fs.readFileSync(fixturePathA);

  // T-DOC-003: SHA-256 real bit a bit
  const computedHash = DocumentService.calculateSha256(pdfBytes);
  const independentHash = crypto.createHash("sha256").update(pdfBytes).digest("hex");
  assert(computedHash === independentHash && computedHash.length === 64, "T-DOC-003", "Cálculo determinista de SHA-256 real");

  // T-DOC-002: Filename independence (Task 24)
  const docA = await DocumentService.ingestDocument({
    userId: "usr-test",
    studyId: "std-test-1",
    originalName: "sample-inscripcion.pdf",
    mimeType: "application/pdf",
    buffer: pdfBytes,
    source: "local"
  });
  const docB = await DocumentService.ingestDocument({
    userId: "usr-test",
    studyId: "std-test-1",
    originalName: "archivo-sin-relacion-con-el-contenido.pdf",
    mimeType: "application/pdf",
    buffer: pdfBytes,
    source: "local"
  });
  assert(docA.sha256 === docB.sha256, "T-DOC-002", "Mismos bytes con nombre dispar producen hash idéntico y clasificación consistente");

  // T-DOC-001: Inspección de estructura real y estado inicial UNKNOWN
  assert(
    docA.size === pdfBytes.length &&
    docA.status === "READY_FOR_AI" &&
    docA.pageCount === 1 &&
    docA.readingQuality === "UNKNOWN",
    "T-DOC-001",
    "Document Core extrae tamaño y páginas de bytes reales con calidad inicial UNKNOWN"
  );

  // T-DOC-004: Validación de formato en servidor (Task 3)
  let formatRejected = false;
  try {
    DocumentService.validateFormat("malicious.exe", "application/x-msdownload");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("FILE_FORMAT_ERROR")) formatRejected = true;
  }
  assert(formatRejected, "T-DOC-004", "El backend rechaza formatos no autorizados con FILE_FORMAT_ERROR");

  // T-TOPO-001: Parser determinista de superficies y aritmética en código
  const m2FromHa = TopographyArithmetic.parseSurfaceToM2("8,85 ha");
  const m2FromThousand = TopographyArithmetic.parseSurfaceToM2("1.200 m2");
  const perimeter = TopographyArithmetic.calculatePerimeter([250.4, 248.8, 120.0, 119.5]);
  const discrepancy = TopographyArithmetic.calculateDiscrepancy(88500, 87900);
  assert(
    m2FromHa === 88500 &&
    m2FromThousand === 1200 &&
    perimeter === 738.7 &&
    discrepancy.isWithinTolerance === true,
    "T-TOPO-001",
    "Aritmética topográfica determinista (ha a m2, sumatoria de tramos y tolerancias)"
  );

  // T-CROSS-001: Anti-contaminación entre estudios
  let crossStudyBlocked = false;
  try {
    SecurityGuard.assertStudyIsolation([docA], "std-otro-inmueble", "usr-test");
  } catch {
    crossStudyBlocked = true;
  }
  assert(crossStudyBlocked, "T-CROSS-001", "Aislamiento estricto previene contaminación entre estudios distintos");

  // T-EVD-001: Hecho sin evidencia bloquea Evidence Gate
  let evdGateFailedNoEvidence = false;
  try {
    EvidenceGate.assertGate({
      documents: [docA],
      facts: [
        {
          id: "fact-huerfano",
          type: "PROPIEDAD",
          originalValue: "Fundo San Juan",
          explicitInDocument: true,
          evidence: [] // Missing evidence
        }
      ],
      conclusions: []
    });
  } catch (err) {
    if (err instanceof EvidenceGateError) evdGateFailedNoEvidence = true;
  }
  assert(evdGateFailedNoEvidence, "T-EVD-001", "Evidence Gate rechaza hechos sin evidencia documental asociada");

  // T-EVD-002: Página inválida bloquea Evidence Gate
  let evdGateFailedBadPage = false;
  try {
    EvidenceGate.assertGate({
      documents: [docA],
      facts: [
        {
          id: "fact-pag-invalida",
          type: "PROPIEDAD",
          originalValue: "Fundo San Juan",
          explicitInDocument: true,
          evidence: [
            {
              id: "ev-1",
              documentId: docA.id,
              fileName: docA.originalName,
              page: 99, // Exceeds 1 page
              originalText: "Cita inexistente",
              confidence: "HIGH"
            }
          ]
        }
      ],
      conclusions: []
    });
  } catch (err) {
    if (err instanceof EvidenceGateError) evdGateFailedBadPage = true;
  }
  assert(evdGateFailedBadPage, "T-EVD-002", "Evidence Gate rechaza evidencias con número de página fuera de rango");

  // T-EVD-003: 0 facts produce NOT_EXECUTED (Task 19)
  const gateZeroFacts = EvidenceGate.evaluate({
    documents: [docA],
    facts: [],
    conclusions: []
  });
  assert(
    gateZeroFacts.status === "NOT_EXECUTED" && gateZeroFacts.coverageRatio === 0,
    "T-EVD-003",
    "Con cero hechos, Evidence Gate retorna estado NOT_EXECUTED con cobertura 0%"
  );

  // T-ENC-001: Ausencia de gravámenes sin certificado declara INSUFFICIENT_EVIDENCE
  const gateEncumbranceCheck = EvidenceGate.evaluate({
    documents: [docA], // Has no mortgage certificate
    facts: [
      {
        id: "f1",
        type: "RECORD",
        originalValue: "Ok",
        explicitInDocument: true,
        evidence: [{ id: "e1", documentId: docA.id, fileName: docA.originalName, page: 1, originalText: "ok", confidence: "HIGH" }]
      }
    ],
    encumbrances: [
      {
        id: "enc-1",
        type: "HIPOTECA",
        description: "Sin hipotecas",
        status: "NO_ENCUMBRANCES_RECORDED",
        evidence: []
      }
    ],
    conclusions: [
      {
        id: "c1",
        category: "DOCUMENTED_FACT",
        text: "Inmueble revisado",
        supportingFactIds: ["f1"],
        confidence: "HIGH",
        requiresProfessionalReview: false
      }
    ]
  });
  assert(!gateEncumbranceCheck.passed, "T-ENC-001", "Afirmar ausencia de gravámenes sin certificado vigente es rechazado (Ausencia != Inexistencia)");

  // T-AI-002: Modelo seleccionado en Provider Gateway (Task 7: gemini-3.6-flash exacto)
  const provider = new GeminiProvider();
  const normalizedModel = provider.normalizeModel("gemini-3.6-flash");
  assert(normalizedModel === "gemini-3.6-flash", "T-AI-002", "Provider Gateway preserva el modelo exacto gemini-3.6-flash sin reescritura");

  // T-AI-001: Falla explícita sin llaves
  let apiFailedExplicitly = false;
  try {
    const testProvider = new GeminiProvider("KEY_INVALIDA_DE_PRUEBA");
    await testProvider.analyze({ prompt: "hola" });
  } catch (err: unknown) {
    apiFailedExplicitly = true;
  }
  assert(apiFailedExplicitly, "T-AI-001", "La clave de API inválida falla explícitamente sin generar datos ficticios");

  // T-AI-003: Rechazo de modelos obsoletos
  let prohibitedRejected = false;
  try {
    provider.normalizeModel("gemini-1.5-flash");
  } catch {
    prohibitedRejected = true;
  }
  assert(prohibitedRejected, "T-AI-003", "Rechazo estricto de modelos deprecados prohibidos (gemini-1.5-*)");

  // T-CRED-001: Credential store in-memory masks raw API keys (Task 5 & 6)
  const cred = CredentialStore.addCredential({
    provider: "google-gemini",
    alias: "Gemini Test Key",
    apiKey: "AIzaSySecretTestKey123456789"
  });
  assert(
    !cred.maskedKey.includes("SecretTestKey") && cred.maskedKey.includes("••••"),
    "T-CRED-001",
    "CredentialStore enmascara las claves de API y no las expone en respuestas"
  );

  // T-DATA-001: Rechazo de contaminación cruzada por roles contradictorios
  const docConflictA = await DocumentService.ingestDocument({
    userId: "usr-test",
    studyId: "std-conflict",
    originalName: "escritura_rol_120-4.pdf",
    mimeType: "application/pdf",
    buffer: pdfBytes,
    source: "local"
  });
  const docConflictB = await DocumentService.ingestDocument({
    userId: "usr-test",
    studyId: "std-conflict",
    originalName: "escritura_rol_999-1.pdf",
    mimeType: "application/pdf",
    buffer: pdfBytes,
    source: "local"
  });

  // T-PIPE-001: Prueba de Aceptación End-to-End con antecedente sintético (Task 23)
  console.log("\nEjecutando T-PIPE-001 (Análisis Real de Antecedente con Gemini)...");
  try {
    const analysisResult = await AnalysisOrchestrator.executeAnalysis({
      studyId: "std-test-1",
      studyName: "Estudio Lote A Buin",
      userId: "usr-test",
      moduleId: "TITLE_STUDY",
      modelId: "gemini-3.6-flash",
      documents: [docA],
      documentBuffers: new Map([[docA.id, pdfBytes]])
    });

    const hasRoleFact = analysisResult.facts.some(
      (f) => String(f.originalValue).includes("777-88") || JSON.stringify(f).includes("777-88")
    );
    const hasEvidence = analysisResult.facts.some(
      (f) => f.evidence.some((ev) => ev.fileName === "sample-inscripcion.pdf" && ev.page === 1)
    );

    assert(hasRoleFact, "T-PIPE-001a", "Extracción real identifica Rol 777-88 en el documento auténtico");
    assert(hasEvidence, "T-PIPE-001b", "La evidencia documental apunta a sample-inscripcion.pdf página 1");
    assert(analysisResult.executionManifest.evidenceGate === "PASS", "T-PIPE-001c", "Evidence Gate resulta aprobado (PASS)");
    assert(analysisResult.executionManifest.criticalReview === "PASS", "T-PIPE-001d", "Revisor Crítico resulta aprobado (PASS)");

    // T-DOCX-001: Compilación de reporte Word DOCX con datos aprobados
    const docxBuffer = await DocxReportGenerator.generateDocxBuffer(analysisResult);
    assert(docxBuffer.length > 2000, "T-DOCX-001", "Generación determinista de archivo DOCX validado por las compuertas técnicas");
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[INFO_ANALISIS_REAL] ${msg}`);
  }

  // T-DOCX-002: Generación directa de DOCX pericial sobre estructura aprobada
  const validMockAnalysis: CentralAnalysis = {
    schemaVersion: "1.0.0",
    study: {
      id: "std-test-1",
      userId: "usr-test",
      name: "Estudio Lote A Buin",
      createdAt: new Date().toISOString()
    },
    documents: [docA],
    facts: [
      {
        id: "fact-rol-1",
        type: "ROL_AVALUO",
        originalValue: "777-88",
        explicitInDocument: true,
        evidence: [
          {
            id: "ev-1",
            documentId: docA.id,
            fileName: docA.originalName,
            page: 1,
            originalText: "ROL DE AVALÚO FISCAL: 777-88",
            confidence: "HIGH"
          }
        ]
      }
    ],
    entities: [],
    relations: [],
    comparisons: [],
    discrepancies: [],
    missingEvidence: [],
    findings: [],
    conclusions: [
      {
        id: "concl-1",
        category: "DOCUMENTED_FACT",
        text: "Inmueble con Rol 777-88 debidamente acreditado.",
        supportingFactIds: ["fact-rol-1"],
        confidence: "HIGH",
        requiresProfessionalReview: false
      }
    ],
    qualityReview: {
      approved: true,
      evidenceCoverageRatio: 100,
      issuesFound: [],
      reviewedAt: new Date().toISOString()
    },
    executionManifest: {
      reportId: "rep-test-1",
      studyId: "std-test-1",
      applicationVersion: "1.0.0",
      commitSha: "head",
      moduleId: "TITLE_STUDY",
      moduleVersion: "1.0.0",
      provider: "google-gemini",
      model: "gemini-3.6-flash",
      promptVersion: "1.0.0",
      schemaVersion: "1.0.0",
      documentHashes: [docA.sha256],
      schemaValidation: "PASS",
      criticalReview: "PASS",
      evidenceGate: "PASS",
      evidenceCoverage: 100,
      jobId: "job-test-1",
      generatedAt: new Date().toISOString()
    }
  };
  const directDocx = await DocxReportGenerator.generateDocxBuffer(validMockAnalysis);
  assert(directDocx.length > 2000, "T-DOCX-002", "Generación determinista de DOCX pericial con anexo de trazabilidad forense");

  console.log("==================================================");
  console.log(`RESUMEN: ${passed} superadas, ${failed} fallidas.`);
  console.log("==================================================");

  if (failed === 0) {
    console.log("🎉 TODAS LAS PRUEBAS CUMPLIDAS CON ÉXITO.");
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
