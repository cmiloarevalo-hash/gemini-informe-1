import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { DocumentService } from "./src/core/documents/document.service";
import { AnalysisOrchestrator } from "./src/core/analysis/analysis.orchestrator";
import { GeminiProvider } from "./src/core/providers/gemini.provider";
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
  limits: { fileSize: 30 * 1024 * 1024 } // 30 MB max
});

// In-memory study registry
interface StudyRecord {
  id: string;
  userId: string;
  name: string;
  role: string | null;
  commune: string | null;
  moduleType: "TITLE_STUDY" | "TOPOGRAPHIC_STUDY";
  createdAt: string;
}

const studies: Map<string, StudyRecord> = new Map([
  [
    "std-demo-01",
    {
      id: "std-demo-01",
      userId: "usr-default-analyst",
      name: "Estudio Matriz Fundo San Juan de Pirque",
      role: "145-2",
      commune: "Pirque",
      moduleType: "TITLE_STUDY",
      createdAt: new Date().toISOString()
    }
  ]
]);

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

// Model Discovery & Capabilities
app.get("/api/models", async (_req, res) => {
  const provider = new GeminiProvider();
  const models = await provider.listModels();
  res.json({
    provider: "google-gemini",
    models
  });
});

// Test Model Connection
app.post("/api/models/test", async (req, res) => {
  const { modelId } = req.body;
  const provider = new GeminiProvider();
  const result = await provider.testConnection(modelId);
  res.json(result);
});

// Studies Management
app.get("/api/studies", (_req, res) => {
  const currentUser = AuthService.getCurrentUser();
  const userStudies = Array.from(studies.values()).filter((s) => s.userId === currentUser.id);
  res.json(userStudies);
});

app.post("/api/studies", (req, res) => {
  const currentUser = AuthService.getCurrentUser();
  const { name, moduleType, role, commune } = req.body;

  if (!name || typeof name !== "string") {
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

// Document Ingestion (Real SHA-256 and byte analysis)
app.post("/api/studies/:studyId/documents", upload.single("file"), async (req, res) => {
  const { studyId } = req.params;
  const currentUser = AuthService.getCurrentUser();
  const study = studies.get(studyId);

  if (!study || study.userId !== currentUser.id) {
    res.status(404).json({ error: "Estudio no encontrado o acceso no autorizado." });
    return;
  }

  if (!req.file) {
    res.status(400).json({ error: "No se proporcionó ningún archivo." });
    return;
  }

  try {
    const doc = await DocumentService.ingestDocument({
      userId: currentUser.id,
      studyId,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype || "application/octet-stream",
      buffer: req.file.buffer,
      source: "local"
    });

    res.status(201).json(doc);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: `Fallo de ingestión documental: ${msg}` });
  }
});

app.get("/api/studies/:studyId/documents", (req, res) => {
  const { studyId } = req.params;
  const currentUser = AuthService.getCurrentUser();
  const docs = DocumentService.listDocumentsByStudy(studyId, currentUser.id);
  res.json(docs);
});

// Orchestrate Analysis (12 phases)
app.post("/api/studies/:studyId/analyze", async (req, res) => {
  const { studyId } = req.params;
  const { modelId } = req.body;
  const currentUser = AuthService.getCurrentUser();
  const study = studies.get(studyId);

  if (!study || study.userId !== currentUser.id) {
    res.status(404).json({ error: "Estudio no encontrado." });
    return;
  }

  const docs = DocumentService.listDocumentsByStudy(studyId, currentUser.id);
  if (docs.length === 0) {
    res.status(400).json({
      error: "El estudio no cuenta con documentos auténticos adjuntos. Cargue al menos una escritura, plano o certificado CBR."
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
      modelId,
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

// Download DOCX Report
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
