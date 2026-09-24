import crypto from "crypto";
import { DocumentService } from "../src/core/documents/document.service";
import { EvidenceGate, EvidenceGateError } from "../src/core/evidence/evidence.gate";
import { SecurityGuard } from "../src/core/security/security.guard";
import { GeminiProvider } from "../src/core/providers/gemini.provider";
import { TopographyArithmetic } from "../src/modules/topography/arithmetic";
import { DocxReportGenerator } from "../src/core/reports/docx.generator";
import { CentralAnalysis } from "../src/schemas/analysis.schema";
import { AnalysisOrchestrator } from "../src/core/analysis/analysis.orchestrator";

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

  // T-DOC-003: SHA-256 real bit a bit
  const sampleBytes = Buffer.from("INSCRIPCION_CBR_SANTIAGO_FOJAS_1234_N_567_2018", "utf8");
  const computedHash = DocumentService.calculateSha256(sampleBytes);
  const independentHash = crypto.createHash("sha256").update(sampleBytes).digest("hex");
  assert(computedHash === independentHash && computedHash.length === 64, "T-DOC-003", "Cálculo determinista de SHA-256 real");

  // T-DOC-002: Filename irrelevante
  const docA = await DocumentService.ingestDocument({
    userId: "usr-test",
    studyId: "std-test-1",
    originalName: "escritura_original.txt",
    mimeType: "text/plain",
    buffer: sampleBytes,
    source: "local"
  });
  const docB = await DocumentService.ingestDocument({
    userId: "usr-test",
    studyId: "std-test-1",
    originalName: "copia_con_otro_nombre.txt",
    mimeType: "text/plain",
    buffer: sampleBytes,
    source: "local"
  });
  assert(docA.sha256 === docB.sha256, "T-DOC-002", "Mismos bytes con nombre dispar producen hash idéntico");

  // T-DOC-001: Extracción sobre bytes reales
  assert(docA.size === sampleBytes.length && docA.status === "READY_FOR_AI", "T-DOC-001", "Document Core extrae tamaño y estado de bytes reales");

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
  const docWithPages = { ...docA, pageCount: 3 };
  try {
    EvidenceGate.assertGate({
      documents: [docWithPages],
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
              page: 99, // Exceeds 3 pages
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

  // T-AI-002: Modelo seleccionado en Provider Gateway
  const provider = new GeminiProvider();
  const normalizedModel = provider.normalizeModel("gemini-3.6-flash");
  assert(normalizedModel === "gemini-3.8-flash", "T-AI-002", "Provider Gateway mapea y certifica modelos vigentes y aliases oficiales");

  // T-AI-001: Falla explícita sin llaves
  let apiFailedExplicitly = false;
  try {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    const testProvider = new GeminiProvider();
    await testProvider.analyze({ prompt: "hola" });
    process.env.GEMINI_API_KEY = originalKey;
  } catch (err: unknown) {
    apiFailedExplicitly = true;
  }
  assert(apiFailedExplicitly, "T-AI-001", "La ausencia o error de API falla explícitamente sin generar datos ficticios");

  // T-AI-003: Rechazo de modelos obsoletos
  let prohibitedRejected = false;
  try {
    provider.normalizeModel("gemini-1.5-flash");
  } catch {
    prohibitedRejected = true;
  }
  assert(prohibitedRejected, "T-AI-003", "Rechazo estricto de modelos deprecados prohibidos (gemini-1.5-*)");

  // T-DATA-001 & T-TITLE-001: Ejecución completa en AnalysisOrchestrator
  const docConflictA = await DocumentService.ingestDocument({
    userId: "usr-test",
    studyId: "std-conflict",
    originalName: "escritura_rol_120-4.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Inmueble Rol 120-4 comuna de Buin", "utf8"),
    source: "local"
  });
  const docConflictB = await DocumentService.ingestDocument({
    userId: "usr-test",
    studyId: "std-conflict",
    originalName: "escritura_rol_999-1.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Inmueble Rol 999-1 comuna de Paine", "utf8"),
    source: "local"
  });

  let conflictDetected = false;
  try {
    await AnalysisOrchestrator.executeAnalysis({
      studyId: "std-conflict",
      studyName: "Estudio Conflicto",
      userId: "usr-test",
      moduleId: "TITLE_STUDY",
      documents: [docConflictA, docConflictB],
      documentBuffers: new Map([
        [docConflictA.id, Buffer.from("Rol 120-4")],
        [docConflictB.id, Buffer.from("Rol 999-1")]
      ])
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("DATA_CONSISTENCY_ERROR")) conflictDetected = true;
  }
  assert(conflictDetected, "T-DATA-001", "Inmuebles diferentes en un mismo estudio generan DATA_CONSISTENCY_ERROR");

  // T-TITLE-001: Título antecedente ausente catalogado como REFERENCED_BUT_NOT_PROVIDED
  const validAnalysis = await AnalysisOrchestrator.executeAnalysis({
    studyId: "std-test-1",
    studyName: "Estudio Test Tracto",
    userId: "usr-test",
    moduleId: "TITLE_STUDY",
    documents: [docA],
    documentBuffers: new Map([[docA.id, sampleBytes]])
  });
  const unprovidedLink = validAnalysis.titleChain?.find((l) => l.status === "REFERENCED_BUT_NOT_PROVIDED");
  assert(unprovidedLink !== undefined, "T-TITLE-001", "Título citado no acompañado catalogado como REFERENCED_BUT_NOT_PROVIDED");

  // T-DOCX-001: Compilación de reporte Word DOCX con anexo de trazabilidad
  const docxBuffer = await DocxReportGenerator.generateDocxBuffer(validAnalysis);
  assert(docxBuffer.length > 1000, "T-DOCX-001", "Generación determinista de archivo .docx con anexo de trazabilidad");

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
