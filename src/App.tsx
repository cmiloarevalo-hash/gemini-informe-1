/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  FileText,
  ShieldCheck,
  Compass,
  Database,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  Settings,
  Activity,
  Layers,
  FileSpreadsheet,
  Download,
  Play,
  Lock,
  Search,
  ExternalLink,
  ChevronRight,
  Info
} from "lucide-react";

interface Study {
  id: string;
  name: string;
  role: string | null;
  commune: string | null;
  moduleType: "TITLE_STUDY" | "TOPOGRAPHIC_STUDY";
  createdAt: string;
}

interface DocumentItem {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  sha256: string;
  pageCount?: number | null;
  readingQuality?: string;
  status: string;
  createdAt: string;
}

interface AnalysisData {
  schemaVersion: string;
  study: { id: string; name: string };
  documents: DocumentItem[];
  facts: Array<{
    id: string;
    type: string;
    originalValue: unknown;
    explicitInDocument: boolean;
    evidence: Array<{
      id: string;
      documentId: string;
      fileName: string;
      page: number | null;
      originalText: string | null;
      confidence: string;
    }>;
  }>;
  titleChain?: Array<{
    id: string;
    seller?: string;
    buyer?: string;
    titleType: string;
    fojas?: string;
    numero?: string;
    year?: string;
    status: string;
  }>;
  topography?: {
    perimeterMetersCalculated: number;
    maxSurfaceDiscrepancyPercentage: number;
    isWithinAcceptableTolerance: boolean;
    notes: string[];
    segments: Array<{
      id: string;
      orientation: string;
      statedLengthMeters: number;
      adjacentOwner?: string;
    }>;
    surfaces: Array<{
      sourceType: string;
      statedValueRaw: string;
      normalizedSquareMeters: number;
    }>;
  };
  discrepancies: string[];
  missingEvidence: string[];
  findings: Array<{
    id: string;
    category: string;
    statement: string;
    confidence: string;
  }>;
  conclusions: Array<{
    id: string;
    text: string;
    supportingFactIds: string[];
  }>;
  qualityReview: {
    approved: boolean;
    evidenceCoverageRatio: number;
    issuesFound: string[];
  };
  executionManifest: {
    model: string;
    evidenceCoverage: number;
    schemaValidation: string;
    criticalReview: string;
    evidenceGate: string;
    generatedAt: string;
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<"estudios" | "documentos" | "auditoria" | "config" | "actividad">("estudios");
  const [studies, setStudies] = useState<Study[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [studyTab, setStudyTab] = useState<"resumen" | "documentos" | "hechos" | "cadena" | "topografia" | "informe" | "auditoria">("resumen");
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // New Study Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [newStudyName, setNewStudyName] = useState("");
  const [newStudyModule, setNewStudyModule] = useState<"TITLE_STUDY" | "TOPOGRAPHIC_STUDY">("TITLE_STUDY");
  const [newStudyRole, setNewStudyRole] = useState("");
  const [newStudyCommune, setNewStudyCommune] = useState("");

  // Audit state
  const [auditBundle, setAuditBundle] = useState<Record<string, unknown> | null>(null);

  // Load Studies on mount
  useEffect(() => {
    fetchStudies();
    fetchAuditBundle();
  }, []);

  // When a study is selected, load its documents & analysis
  useEffect(() => {
    if (selectedStudy) {
      fetchDocuments(selectedStudy.id);
      fetchAnalysis(selectedStudy.id);
      setStudyTab("resumen");
    }
  }, [selectedStudy]);

  const fetchStudies = async () => {
    try {
      const res = await fetch("/api/studies");
      if (res.ok) {
        const data = await res.json();
        setStudies(data);
        if (data.length > 0 && !selectedStudy) {
          setSelectedStudy(data[0]);
        }
      }
    } catch {
      // Server error handling
    }
  };

  const fetchDocuments = async (studyId: string) => {
    try {
      const res = await fetch(`/api/studies/${studyId}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch {
      //
    }
  };

  const fetchAnalysis = async (studyId: string) => {
    try {
      const res = await fetch(`/api/studies/${studyId}/analysis`);
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      } else {
        setAnalysis(null);
      }
    } catch {
      setAnalysis(null);
    }
  };

  const fetchAuditBundle = async () => {
    try {
      const res = await fetch("/api/audit/bundle");
      if (res.ok) {
        const data = await res.json();
        setAuditBundle(data);
      }
    } catch {
      //
    }
  };

  const handleCreateStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudyName.trim()) return;

    try {
      const res = await fetch("/api/studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStudyName,
          moduleType: newStudyModule,
          role: newStudyRole ? newStudyRole : null,
          commune: newStudyCommune ? newStudyCommune : null
        })
      });

      if (res.ok) {
        const created = await res.json();
        setStudies((prev) => [created, ...prev]);
        setSelectedStudy(created);
        setShowNewModal(false);
        setNewStudyName("");
        setNewStudyRole("");
        setNewStudyCommune("");
      }
    } catch (err) {
      setErrorBanner("Error al crear estudio.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedStudy || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setErrorBanner(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/studies/${selectedStudy.id}/documents`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const doc = await res.json();
        setDocuments((prev) => [doc, ...prev]);
      } else {
        const err = await res.json();
        setErrorBanner(err.error || "Fallo en la carga del documento.");
      }
    } catch {
      setErrorBanner("Error de conexión al cargar archivo.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedStudy) return;
    setIsAnalyzing(true);
    setErrorBanner(null);

    try {
      const res = await fetch(`/api/studies/${selectedStudy.id}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId: "gemini-3.8-flash" })
      });

      if (res.ok) {
        const result = await res.json();
        setAnalysis(result);
        setStudyTab("informe");
      } else {
        const err = await res.json();
        setErrorBanner(err.error || "Error durante el análisis.");
      }
    } catch (err: unknown) {
      setErrorBanner(err instanceof Error ? err.message : "Error inesperado de ejecución.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3 px-2 py-3 border-b border-slate-800/80 mb-6">
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-bold">
              LX
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white leading-tight">LexTech AI</h1>
              <p className="text-[11px] text-slate-400 font-mono">Títulos & Topografía</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("estudios")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "estudios"
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Layers className="h-4 w-4" />
              Estudios de Caso
            </button>
            <button
              onClick={() => setActiveTab("auditoria")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "auditoria"
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Auditoría & Trazabilidad
            </button>
            <button
              onClick={() => setActiveTab("config")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTab === "config"
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Settings className="h-4 w-4" />
              Configuración & Modelos
            </button>
          </nav>
        </div>

        {/* User & Mode Indicator */}
        <div className="border-t border-slate-800/80 pt-4 px-2">
          <div className="flex items-center justify-between text-[11px] mb-2">
            <span className="text-slate-400 font-medium">Modo:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
              FREE_PROTOTYPE
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[10px]">
              CC
            </div>
            <span className="truncate">Camilo Consul</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
        {/* Top bar */}
        <header className="h-14 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 bg-slate-900/30 backdrop-blur">
          <div className="flex items-center gap-4">
            <h2 className="text-sm font-semibold text-white">
              {activeTab === "estudios" && (selectedStudy ? selectedStudy.name : "Estudios")}
              {activeTab === "auditoria" && "Centro de Auditoría Forense y Verificación"}
              {activeTab === "config" && "Configuración de Proveedores IA y Entorno"}
            </h2>
            {selectedStudy && activeTab === "estudios" && (
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                {selectedStudy.moduleType === "TOPOGRAPHIC_STUDY" ? "Módulo Topografía" : "Módulo Estudio de Títulos"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "estudios" && (
              <>
                <button
                  onClick={() => setShowNewModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
                >
                  + Nuevo Expediente
                </button>
                {selectedStudy && (
                  <button
                    onClick={handleRunAnalysis}
                    disabled={isAnalyzing || documents.length === 0}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    {isAnalyzing ? "Ejecutando 12 Fases..." : "Analizar Expediente"}
                  </button>
                )}
              </>
            )}
          </div>
        </header>

        {/* Global Error Banner */}
        {errorBanner && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-2 flex items-center gap-2 text-rose-400 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorBanner}</span>
          </div>
        )}

        {/* Body based on Tab */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === "estudios" && selectedStudy && (
            <div className="flex flex-col h-full space-y-5">
              {/* Study Sub-Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                {[
                  { id: "resumen", label: "Resumen" },
                  { id: "documentos", label: `Documentos (${documents.length})` },
                  { id: "hechos", label: `Hechos (${analysis?.facts.length || 0})` },
                  selectedStudy.moduleType === "TITLE_STUDY" ? { id: "cadena", label: "Cadena de Títulos" } : null,
                  selectedStudy.moduleType === "TOPOGRAPHIC_STUDY" ? { id: "topografia", label: "Cálculos Topográficos" } : null,
                  { id: "informe", label: "Informe & Dictamen" },
                  { id: "auditoria", label: "Auditoría del Estudio" }
                ]
                  .filter(Boolean)
                  .map((tab) => (
                    <button
                      key={tab!.id}
                      onClick={() => setStudyTab(tab!.id as any)}
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                        studyTab === tab!.id
                          ? "bg-slate-800 text-white font-semibold border border-slate-700"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {tab!.label}
                    </button>
                  ))}
              </div>

              {/* Sub-Tab 1: Resumen */}
              {studyTab === "resumen" && (
                <div className="grid grid-cols-3 gap-6">
                  <div className="col-span-2 space-y-6">
                    <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                      <h3 className="text-sm font-semibold text-white mb-3">Individualización del Inmueble</h3>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-slate-400">Rol de Avalúo:</p>
                          <p className="text-slate-200 font-mono mt-0.5">{selectedStudy.role || "Pendiente de ingreso / No consta"}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Comuna:</p>
                          <p className="text-slate-200 mt-0.5">{selectedStudy.commune || "Pendiente de ingreso / No consta"}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Fecha de Creación:</p>
                          <p className="text-slate-200 mt-0.5">{new Date(selectedStudy.createdAt).toLocaleDateString("es-CL")}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Tipo de Estudio:</p>
                          <p className="text-slate-200 mt-0.5">{selectedStudy.moduleType}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800/80">
                      <h3 className="text-sm font-semibold text-white mb-3">Estado del Análisis Técnico</h3>
                      {analysis ? (
                        <div className="space-y-3 text-xs">
                          <div className="flex items-center gap-2 text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Análisis completado bajo modelo: <strong>{analysis.executionManifest.model}</strong></span>
                          </div>
                          <div className="grid grid-cols-3 gap-3 pt-2">
                            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                              <p className="text-slate-400 text-[10px]">Evidence Coverage</p>
                              <p className="text-base font-bold text-emerald-400 font-mono">{analysis.executionManifest.evidenceCoverage}%</p>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                              <p className="text-slate-400 text-[10px]">Evidence Gate</p>
                              <p className="text-base font-bold text-emerald-400 font-mono">{analysis.executionManifest.evidenceGate}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                              <p className="text-slate-400 text-[10px]">Revisión Crítica</p>
                              <p className="text-base font-bold text-emerald-400 font-mono">{analysis.executionManifest.criticalReview}</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">
                          No se ha ejecutado el análisis aún. Cargue los documentos auténticos y presione "Analizar Expediente".
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Sidebar with Switcher */}
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
                      <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">Expedientes Activos</h4>
                      <div className="space-y-1.5 max-h-80 overflow-y-auto">
                        {studies.map((s) => (
                          <button
                            key={s.id}
                            onClick={() => setSelectedStudy(s)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition ${
                              selectedStudy.id === s.id
                                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                            }`}
                          >
                            <p className="font-medium truncate">{s.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono">{s.moduleType}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab 2: Documentos */}
              {studyTab === "documentos" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Documentación Acompañada</h3>
                      <p className="text-xs text-slate-400">
                        Cada documento es evaluado por su contenido binario real y se le calcula el hash SHA-256 criptográfico.
                      </p>
                    </div>

                    <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md transition">
                      <UploadCloud className="h-4 w-4" />
                      {isUploading ? "Cargando..." : "Subir Archivo Real"}
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.docx,.txt"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {documents.length === 0 ? (
                    <div className="p-12 text-center border border-dashed border-slate-800 rounded-xl">
                      <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-300">No hay documentos en este estudio</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Cargue copias de escrituras, certificados de dominio vigente, certificados de gravámenes o planos.
                      </p>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-900/40">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                          <tr>
                            <th className="py-2.5 px-4">Nombre Original</th>
                            <th className="py-2.5 px-4">Tipo Detectado</th>
                            <th className="py-2.5 px-4">Páginas</th>
                            <th className="py-2.5 px-4">Tamaño</th>
                            <th className="py-2.5 px-4">Hash SHA-256 (Bytes Reales)</th>
                            <th className="py-2.5 px-4">Estado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {documents.map((d) => (
                            <tr key={d.id} className="hover:bg-slate-800/30">
                              <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                                <FileText className="h-4 w-4 text-indigo-400" />
                                {d.originalName}
                              </td>
                              <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">{d.mimeType}</td>
                              <td className="py-2.5 px-4">{d.pageCount ? `${d.pageCount} págs` : "N/C"}</td>
                              <td className="py-2.5 px-4">{(d.size / 1024).toFixed(1)} KB</td>
                              <td className="py-2.5 px-4 font-mono text-[10px] text-slate-400">
                                {d.sha256.slice(0, 16)}...{d.sha256.slice(-8)}
                              </td>
                              <td className="py-2.5 px-4">
                                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20">
                                  {d.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 3: Hechos */}
              {studyTab === "hechos" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Matriz de Hechos y Evidencias</h3>
                      <p className="text-xs text-slate-400">
                        Cada hecho extraído cuenta con cita literal comprobada, documento fuente y página exacta.
                      </p>
                    </div>
                  </div>

                  {!analysis ? (
                    <p className="text-xs text-slate-500">Ejecute el análisis para ver los hechos extraídos.</p>
                  ) : (
                    <div className="space-y-3">
                      {analysis.facts.map((f) => (
                        <div key={f.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-indigo-400 font-semibold">{f.id}</span>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                              {f.type}
                            </span>
                          </div>
                          <p className="text-slate-200 mb-3 font-medium">Valor: {String(f.originalValue)}</p>

                          <div className="border-t border-slate-800/80 pt-2 space-y-1">
                            <p className="text-[10px] text-slate-500 uppercase font-semibold">Evidencia de respaldo:</p>
                            {f.evidence.map((ev) => (
                              <div key={ev.id} className="p-2 rounded bg-slate-950 border border-slate-800/60 font-mono text-[11px] text-slate-300">
                                <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                                  <span>{ev.fileName} (Pág. {ev.page ?? "N/C"})</span>
                                  <span className="text-emerald-400 font-bold">Confianza: {ev.confidence}</span>
                                </div>
                                <p className="italic text-slate-200">"{ev.originalText}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 4: Cadena de Títulos */}
              {studyTab === "cadena" && selectedStudy.moduleType === "TITLE_STUDY" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Cadena Histórica de Títulos de Dominio</h3>
                    <p className="text-xs text-slate-400">
                      Tracto sucesivo retrospectivo con estados explícitos de continuidad o vacíos.
                    </p>
                  </div>

                  {!analysis || !analysis.titleChain ? (
                    <p className="text-xs text-slate-500">Ejecute el análisis para examinar la cadena de títulos.</p>
                  ) : (
                    <div className="space-y-3">
                      {analysis.titleChain.map((link, idx) => (
                        <div key={link.id} className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 flex items-start gap-4 text-xs">
                          <div className="h-7 w-7 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                            {idx + 1}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-white">{link.titleType}</h4>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                                  link.status === "CONFIRMED_LINK"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                }`}
                              >
                                {link.status}
                              </span>
                            </div>
                            {link.seller && <p className="text-slate-400">Tradente/Vendedor: <span className="text-slate-200">{link.seller}</span></p>}
                            {link.buyer && <p className="text-slate-400">Adquirente/Comprador: <span className="text-slate-200">{link.buyer}</span></p>}
                            {link.fojas && <p className="text-slate-400">Inscripción: <span className="text-slate-200">Fojas {link.fojas} N° {link.numero} ({link.year})</span></p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 5: Topografía */}
              {studyTab === "topografia" && selectedStudy.moduleType === "TOPOGRAPHIC_STUDY" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Análisis Topográfico y Aritmética Determinista</h3>
                    <p className="text-xs text-slate-400">
                      Conversión determinista de unidades (ha a m²), cálculo de perimetría y comparación de discrepancias.
                    </p>
                  </div>

                  {!analysis || !analysis.topography ? (
                    <p className="text-xs text-slate-500">Ejecute el análisis para ver los cálculos topográficos.</p>
                  ) : (
                    <div className="space-y-4">
                      {/* Metric cards */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                          <p className="text-slate-400 text-xs">Perímetro Calculado (Suma Tramos)</p>
                          <p className="text-xl font-bold text-white font-mono mt-1">
                            {analysis.topography.perimeterMetersCalculated} m
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                          <p className="text-slate-400 text-xs">Diferencia Título vs Terreno</p>
                          <p className="text-xl font-bold text-indigo-400 font-mono mt-1">
                            {analysis.topography.maxSurfaceDiscrepancyPercentage}%
                          </p>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                          <p className="text-slate-400 text-xs">Tolerancia Legal (≤ 2.0%)</p>
                          <p className="text-xl font-bold text-emerald-400 font-mono mt-1">
                            {analysis.topography.isWithinAcceptableTolerance ? "ADMISIBLE" : "EXCEDE LÍMITE"}
                          </p>
                        </div>
                      </div>

                      {/* Surfaces table */}
                      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs">
                        <h4 className="font-semibold text-white mb-2">Superficies Comparadas</h4>
                        <div className="space-y-2">
                          {analysis.topography.surfaces.map((s, idx) => (
                            <div key={idx} className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-800/60">
                              <span className="text-slate-400 font-mono">{s.sourceType}</span>
                              <span className="text-slate-200">Declarado: {s.statedValueRaw}</span>
                              <span className="text-indigo-400 font-mono font-bold">{s.normalizedSquareMeters.toLocaleString("es-CL")} m²</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 6: Informe */}
              {studyTab === "informe" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">Dictamen e Informe Generado</h3>
                      <p className="text-xs text-slate-400">
                        Solo los informes con Evidence Gate y Revisión Crítica aprobadas pueden descargarse en formato Word (.docx).
                      </p>
                    </div>

                    {analysis && (
                      <a
                        href={`/api/studies/${selectedStudy.id}/report/docx`}
                        download
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-md transition"
                      >
                        <Download className="h-4 w-4" />
                        Descargar Informe Oficial (.DOCX)
                      </a>
                    )}
                  </div>

                  {!analysis ? (
                    <p className="text-xs text-slate-500">Ejecute el análisis para producir el dictamen técnico-legal.</p>
                  ) : (
                    <div className="space-y-4">
                      {/* Findings */}
                      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs space-y-2">
                        <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Hallazgos Fácticos</h4>
                        {analysis.findings.map((f) => (
                          <div key={f.id} className="p-2.5 rounded bg-slate-950 border border-slate-800/60">
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[10px] mr-2">
                              {f.category}
                            </span>
                            <span className="text-slate-200">{f.statement}</span>
                          </div>
                        ))}
                      </div>

                      {/* Conclusions */}
                      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-xs space-y-2">
                        <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Conclusiones con Respaldo</h4>
                        {analysis.conclusions.map((c) => (
                          <div key={c.id} className="p-3 rounded bg-slate-950 border border-slate-800/60 space-y-1">
                            <p className="text-slate-100 font-medium">{c.text}</p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              Respaldado en Fact IDs: {c.supportingFactIds.join(", ")}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 7: Auditoría del Estudio */}
              {studyTab === "auditoria" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white">Manifest de Ejecución y Trazabilidad del Estudio</h3>
                  {!analysis ? (
                    <p className="text-xs text-slate-500">Ejecute el análisis para registrar el manifest inmutable.</p>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 font-mono text-xs text-slate-300">
                      <pre className="overflow-x-auto">{JSON.stringify(analysis.executionManifest, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Audit Global View */}
          {activeTab === "auditoria" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-white">Centro de Auditoría Forense</h3>
                <p className="text-xs text-slate-400">
                  Inspección completa de los 10 archivos del Audit Bundle, matrices de capacidades, requisitos y estado de costos.
                </p>
              </div>

              {auditBundle ? (
                <div className="grid grid-cols-2 gap-6">
                  {Object.entries(auditBundle).map(([fileName, data]) => (
                    <div key={fileName} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                        <span className="font-mono text-xs text-indigo-400 font-semibold">{fileName}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          VALIDADO
                        </span>
                      </div>
                      <pre className="text-[11px] font-mono text-slate-300 max-h-60 overflow-y-auto bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Cargando Audit Bundle...</p>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "config" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <h3 className="text-base font-semibold text-white">Configuración del Entorno y Modelos</h3>
                <p className="text-xs text-slate-400">
                  Gestión del Provider Gateway server-side, compatibilidad de modelos y estado de integraciones.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 space-y-4 text-xs">
                <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Proveedor Primario de IA</h4>
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div>
                    <p className="font-medium text-slate-200">Google Gemini Developer API</p>
                    <p className="text-slate-400 text-[11px]">Modelo Activo: gemini-3.8-flash (con alias certificado gemini-3.6-flash)</p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
                    CONECTADO (Server-side)
                  </span>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-2">Google Drive & Picker</h4>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div>
                      <p className="font-medium text-slate-200">Google Drive API</p>
                      <p className="text-slate-400 text-[11px]">Scope mínimo: https://www.googleapis.com/auth/drive.file</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[10px]">
                      ARCHITECTURE_READY
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-4">
                  <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-2">Reglas de Seguridad y Secretos</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[11px]">
                    <li>API Keys resguardadas exclusivamente en el servidor (process.env.GEMINI_API_KEY).</li>
                    <li>Cero exposición de credenciales en bundles de frontend.</li>
                    <li>Aislamiento estricto de documentos por usuario y estudio.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal: New Study (Strictly NO mock preloads) */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">Nuevo Expediente de Estudio</h3>
            <p className="text-xs text-slate-400 mb-4">
              Ingrese los antecedentes del nuevo caso. Los campos no ingresados quedarán como nulos sin datos ficticios.
            </p>

            <form onSubmit={handleCreateStudy} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Nombre del Estudio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Estudio Títulos Predio Santa Elena"
                  value={newStudyName}
                  onChange={(e) => setNewStudyName(e.target.value)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Módulo a Aplicar</label>
                <select
                  value={newStudyModule}
                  onChange={(e) => setNewStudyModule(e.target.value as any)}
                  className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="TITLE_STUDY">Estudio de Títulos de Inmuebles</option>
                  <option value="TOPOGRAPHIC_STUDY">Análisis Topográfico y Deslindes</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Rol de Avalúo (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: 524-50"
                    value={newStudyRole}
                    onChange={(e) => setNewStudyRole(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Comuna (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: Buin"
                    value={newStudyCommune}
                    onChange={(e) => setNewStudyCommune(e.target.value)}
                    className="w-full rounded-lg bg-slate-950 border border-slate-800 px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
                >
                  Crear Estudio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
