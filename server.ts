import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { DocumentService } from "./src/core/documents/document.service";
import { AnalysisOrchestrator } from "./src/core/analysis/analysis.orchestrator";
import { GeminiProvider } from "./src/core/providers/gemini.provider";
import { CredentialStore } from "./src/core/providers/credential.store";
import { AuthService } from "./src/core/auth/auth.service";
import { ModuleRegistry } from "./src/core/modules/module.registry";
import { TitleStudyModule } from "./src/modules/title-study/index";
import { TopographyModule } from "./src/modules/topography/index";
import { DocxReportGenerator } from "./src/core/reports/docx.generator";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Register Report Modules
ModuleRegistry.register(new TitleStudyModule());
ModuleRegistry.register(new TopographyModule());

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 } // 30 MB max per file
});

// In-memory study registry (Starts empty with zero hardcoded studies)
interface StudyRecord {
  id: string;
  userId: string;
  name: string;
  role: string | null;
  commune: string | null;
  moduleType: "TITLE_STUDY" | "TOPOGRAPHIC_STUDY";
  createdAt: string;
}

const studies: Map<string, StudyRecord> = new Map();

// --- API ROUTES ---

// Health & Status
app.get("/api/health", (_req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: "FREE_PROTOTYPE",
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

// Current User Profile
app.get("/api/user", (_req, res) => {
  res.json(AuthService.getCurrentUser());
});

// --- CREDENTIAL MANAGEMENT ENDPOINTS (Tasks 4, 5, 6, 8) ---
// Note: Raw keys are NEVER returned to frontend. Stored server-side in memory (IN_MEMORY_CREDENTIAL_STORE).

// GET /api/providers
app.get("/api/providers", (_req, res) => {
  const credentials = CredentialStore.listCredentials();
  res.json(credentials);
});

// POST /api/providers
app.post("/api/providers", (req, res) => {
  try {
    const { provider, alias, apiKey, baseUrl, defaultModel } = req.body;
    const cred = CredentialStore.addCredential({
      provider,
      alias,
      apiKey,
      baseUrl,
      defaultModel
    });
    res.status(201).json(cred);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: msg });
  }
});

// DELETE /api/providers/:id
app.delete("/api/providers/:id", (req, res) => {
  const { id } = req.params;
  const deleted = CredentialStore.deleteCredential(id);
  if (!deleted) {
    res.status(404).json({ error: "Credencial no encontrada." });
    return;
  }
  res.json({ success: true });
});

// POST /api/providers/:id/test
app.post("/api/providers/:id/test", async (req, res) => {
  const { id } = req.params;
  const cred = CredentialStore.getCredential(id);
  if (!cred) {
    res.status(404).json({ error: "Credencial no encontrada." });
    return;
  }

  if (cred.provider === "google-gemini") {
    const provider = new GeminiProvider(cred.apiKey);
    const result = await provider.testConnection(cred.defaultModel);
    CredentialStore.updateTestResult(id, {
      ok: result.ok,
      latencyMs: result.latencyMs,
      message: result.message,
      selectedModel: result.selectedModel
    });
    res.json(result);
  } else {
    // Architecture ready for other providers
    const latency = 15;
    const msg = "Proveedor en estado ARCHITECTURE_READY. Conexión diferida.";
    CredentialStore.updateTestResult(id, {
      ok: false,
      latencyMs: latency,
      message: msg
    });
    res.json({
      ok: false,
      provider: cred.provider,
      selectedModel: cred.defaultModel,
      latencyMs: latency,
      message: msg
    });
  }
});

// POST /api/providers/:id/models
app.post("/api/providers/:id/models", async (req, res) => {
  const { id } = req.params;
  const cred = CredentialStore.getCredential(id);
  if (!cred) {
    res.status(404).json({ error: "Credencial no encontrada." });
    return;
  }

  if (cred.provider === "google-gemini") {
    try {
      const provider = new GeminiProvider(cred.apiKey);
      const models = await provider.listModels();
      const modelIds = models.map((m) => m.modelId);
      CredentialStore.updateAvailableModels(id, modelIds);
      res.json({
        provider: cred.provider,
        models
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({ error: `Fallo al listar modelos reales: ${msg}` });
    }
  } else {
    res.json({
      provider: cred.provider,
      models: cred.availableModels.map((m) => ({
        modelId: m,
        normalizedId: m,
        displayName: m,
        capabilities: { text: true, image: false, pdf: false, structuredOutput: true, reasoning: true },
        status: "ARCHITECTURE_READY"
      }))
    });
  }
});

// Global Models list endpoint (Default Provider)
app.get("/api/models", async (_req, res) => {
  const provider = new GeminiProvider();
  const models = await provider.listModels();
  res.json({
    provider: "google-gemini",
    models
  });
});

// Global Test endpoint
app.post("/api/models/test", async (req, res) => {
  const { modelId } = req.body;
  const provider = new GeminiProvider();
  const result = await provider.testConnection(modelId);
  res.json(result);
});

// --- STUDIES MANAGEMENT ---

app.get("/api/studies", (_req, res) => {
  const currentUser = AuthService.getCurrentUser();
  const userStudies = Array.from(studies.values()).filter((s) => s.userId === currentUser.id);
  res.json(userStudies);
});

app.post("/api/studies", (req, res) => {
  const currentUser = AuthService.getCurrentUser();
  const { name, moduleType, role, commune } = req.body;

  if (!name || typeof name !== "string" || !name.trim()) {
    res.status(400).json({ error: "El nombre del estudio es obligatorio." });
    return;
  }

  const studyId = `std-${Date.now()}`;
  const newStudy: StudyRecord = {
    id: studyId,
    userId: currentUser.id,
    name: name.trim(),
    role: role ? String(role).trim() : null,
    commune: commune ? String(commune).trim() : null,
    moduleType: moduleType === "TOPOGRAPHIC_STUDY" ? "TOPOGRAPHIC_STUDY" : "TITLE_STUDY",
    createdAt: new Date().toISOString()
  };

  studies.set(studyId, newStudy);
  res.status(201).json(newStudy);
});

// --- MULTI-DOCUMENT UPLOAD (Tasks 1, 2, 3) ---

app.post(
  "/api/studies/:studyId/documents",
  upload.array("files", 20),
  async (req, res) => {
    const { studyId } = req.params;
    const currentUser = AuthService.getCurrentUser();
    const study = studies.get(studyId);

    if (!study || study.userId !== currentUser.id) {
      res.status(404).json({ error: "Estudio no encontrado o acceso no autorizado." });
      return;
    }

    const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);
    if (!files || files.length === 0) {
      res.status(400).json({ error: "No se proporcionó ningún archivo." });
      return;
    }

    const results: Array<{ file: string; doc?: any; error?: string }> = [];

    for (const f of files) {
      try {
        const doc = await DocumentService.ingestDocument({
          userId: currentUser.id,
          studyId,
          originalName: f.originalname,
          mimeType: f.mimetype || "application/octet-stream",
          buffer: f.buffer,
          source: "local"
        });
        results.push({ file: f.originalname, doc });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        results.push({ file: f.originalname, error: msg });
      }
    }

    const hasErrors = results.some((r) => r.error);
    const allErrors = results.every((r) => r.error);

    if (allErrors) {
      res.status(400).json({ error: "No se pudo procesar ningún archivo.", details: results });
      return;
    }

    res.status(201).json({
      success: true,
      processed: results.filter((r) => r.doc).map((r) => r.doc),
      errors: results.filter((r) => r.error)
    });
  }
);

app.get("/api/studies/:studyId/documents", (req, res) => {
  const { studyId } = req.params;
  const currentUser = AuthService.getCurrentUser();
  const docs = DocumentService.listDocumentsByStudy(studyId, currentUser.id);
  res.json(docs);
});

// --- ORCHESTRATE ANALYSIS (Tasks 10, 11, 12, 13) ---

app.post("/api/studies/:studyId/analyze", async (req, res) => {
  const { studyId } = req.params;
  const { modelId, credentialId, provider } = req.body;
  const currentUser = AuthService.getCurrentUser();
  const study = studies.get(studyId);

  if (!study || study.userId !== currentUser.id) {
    res.status(404).json({ error: "Estudio no encontrado." });
    return;
  }

  const docs = DocumentService.listDocumentsByStudy(studyId, currentUser.id);
  if (docs.length === 0) {
    res.status(400).json({
      error: "Incorpora al menos un antecedente antes de ejecutar el análisis."
    });
    return;
  }

  const buffers = new Map<string, Buffer>();
  for (const doc of docs) {
    const buf = DocumentService.getDocumentBuffer(doc.id);
    if (buf) buffers.set(doc.id, buf);
  }

  try {
    const result = await AnalysisOrchestrator.executeAnalysis({
      studyId,
      studyName: study.name,
      userId: currentUser.id,
      moduleId: study.moduleType,
      modelId: modelId || "gemini-3.6-flash",
      credentialId,
      documents: docs,
      documentBuffers: buffers
    });

    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: msg });
  }
});

// Retrieve Analysis Result
app.get("/api/studies/:studyId/analysis", (req, res) => {
  const { studyId } = req.params;
  const analysis = AnalysisOrchestrator.getAnalysis(studyId);
  if (!analysis) {
    res.status(404).json({ error: "No se ha ejecutado un análisis para este estudio aún." });
    return;
  }
  res.json(analysis);
});

// Download DOCX Report (Tasks 22)
app.get("/api/studies/:studyId/report/docx", async (req, res) => {
  const { studyId } = req.params;
  const analysis = AnalysisOrchestrator.getAnalysis(studyId);

  if (!analysis) {
    res.status(404).json({ error: "No existe un análisis validado previo para generar el reporte DOCX." });
    return;
  }

  try {
    const buffer = await DocxReportGenerator.generateDocxBuffer(analysis);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="informe-${studyId}.docx"`);
    res.send(buffer);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: msg });
  }
});

// Audit Bundle
app.get("/api/audit/bundle", (_req, res) => {
  try {
    const auditDir = path.join(__dirname, "audit");
    const files = fs.readdirSync(auditDir).filter((f) => f.endsWith(".json"));
    const bundle: Record<string, unknown> = {};

    for (const f of files) {
      const content = fs.readFileSync(path.join(auditDir, f), "utf8");
      bundle[f] = JSON.parse(content);
    }

    res.json(bundle);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Error al leer Audit Bundle: ${msg}` });
  }
});

// Mount Vite in dev mode or serve static dist in prod
async function startServer() {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`[SERVER_RUNNING] Plataforma de Análisis Técnico-Jurídico activa en http://0.0.0.0:${port}`);
  });
}

startServer();
