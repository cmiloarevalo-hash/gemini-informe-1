import React, { useState } from "react";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Play,
  ArrowLeft,
  Clock,
  ExternalLink,
  MapPin,
  Calendar,
  Layers,
  Search,
  Compass,
  FileSpreadsheet,
  UploadCloud,
  AlertCircle,
  Cpu,
  RefreshCw,
  Eye
} from "lucide-react";
import { DocumentItem } from "../documents/DocumentManager";
import { PublicCredential } from "../config/AIProvidersConfig";

interface AnalysisData {
  schemaVersion: string;
  study: { id: string; name: string };
  documents: DocumentItem[];
  facts: Array<{
    id: string;
    type: string;
    originalValue: unknown;
    normalizedValue?: unknown;
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
    cbr?: string;
    status: string;
    previousTitleReference?: string;
    evidence: Array<{
      id: string;
      fileName: string;
      page: number | null;
      originalText: string | null;
    }>;
  }>;
  encumbrances?: Array<{
    id: string;
    type: string;
    description: string;
    status: string;
    evidence: Array<{
      id: string;
      fileName: string;
      page: number | null;
      originalText: string | null;
    }>;
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
    documentHashes: string[];
  };
}

interface StudyDetailProps {
  study: {
    id: string;
    name: string;
    role: string | null;
    commune: string | null;
    moduleType: "TITLE_STUDY" | "TOPOGRAPHIC_STUDY";
    createdAt: string;
  };
  documents: DocumentItem[];
  analysis: AnalysisData | null;
  isAnalyzing: boolean;
  onBack: () => void;
  onRunAnalysis: (params: { credentialId?: string; provider?: string; modelId?: string }) => void;
  onUploadFiles: (files: FileList | File[]) => void;
  credentials: PublicCredential[];
}

export const StudyDetail: React.FC<StudyDetailProps> = ({
  study,
  documents,
  analysis,
  isAnalyzing,
  onBack,
  onRunAnalysis,
  onUploadFiles,
  credentials
}) => {
  const [activeTab, setActiveTab] = useState<
    | "resumen"
    | "documentos"
    | "hechos"
    | "evidencias"
    | "cadena"
    | "discrepancias"
    | "vacios"
    | "topografia"
    | "informe"
    | "auditoria"
  >("resumen");

  // AI Provider & Model selector state (Task 10)
  const defaultCred = credentials.find((c) => c.status === "VERIFIED") || credentials[0];
  const [selectedCredId, setSelectedCredId] = useState<string>(defaultCred?.id || "");
  const [selectedModel, setSelectedModel] = useState<string>(defaultCred?.defaultModel || "gemini-3.6-flash");
  const [viewingEvidenceFact, setViewingEvidenceFact] = useState<any | null>(null);

  const selectedCred = credentials.find((c) => c.id === selectedCredId) || defaultCred;

  const handleCredChange = (id: string) => {
    setSelectedCredId(id);
    const cred = credentials.find((c) => c.id === id);
    if (cred) {
      setSelectedModel(cred.defaultModel || "gemini-3.6-flash");
    }
  };

  const handleTriggerAnalysis = () => {
    if (documents.length === 0) return;
    onRunAnalysis({
      credentialId: selectedCred?.id,
      provider: selectedCred?.provider,
      modelId: selectedModel
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadFiles(e.target.files);
      e.target.value = "";
    }
  };

  const tabs: Array<{ id: typeof activeTab; label: string; condition?: boolean }> = [
    { id: "resumen", label: "Resumen" },
    { id: "documentos", label: `Documentos (${documents.length})` },
    { id: "hechos", label: `Hechos (${analysis?.facts.length || 0})` },
    { id: "evidencias", label: "Evidencias" },
    { id: "cadena", label: "Cadena de Títulos", condition: study.moduleType === "TITLE_STUDY" },
    { id: "discrepancias", label: `Discrepancias (${analysis?.discrepancies.length || 0})` },
    { id: "vacios", label: `Vacíos Documentales (${analysis?.missingEvidence.length || 0})` },
    { id: "topografia", label: "Topografía & Deslindes", condition: study.moduleType === "TOPOGRAPHIC_STUDY" },
    { id: "informe", label: "Informe & Dictamen" },
    { id: "auditoria", label: "Auditoría Técnica" }
  ];

  const canDownloadDocx =
    analysis &&
    analysis.executionManifest.schemaValidation === "PASS" &&
    analysis.executionManifest.criticalReview === "PASS" &&
    analysis.executionManifest.evidenceGate === "PASS";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Breadcrumb & Metadata Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Volver a Mis Estudios</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white tracking-tight">{study.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold">
              {study.moduleType === "TOPOGRAPHIC_STUDY" ? "TOPOGRÁFICO" : "ESTUDIO DE TÍTULOS"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
            <span>Rol: <strong className="text-slate-200">{study.role || "No consta"}</strong></span>
            <span>•</span>
            <span>Comuna: <strong className="text-slate-200">{study.commune || "No consta"}</strong></span>
            <span>•</span>
            <span>Fecha: {new Date(study.createdAt).toLocaleDateString("es-CL")}</span>
          </div>
        </div>

        {/* Global Action Buttons: Subir antecedentes & DOCX */}
        <div className="flex items-center gap-3">
          {/* Task 1: Visible action inside study detail */}
          <label className="cursor-pointer flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm transition active:scale-95">
            <UploadCloud className="h-4 w-4 text-indigo-400" />
            <span>+ Subir antecedentes</span>
            <input
              type="file"
              accept=".pdf,.docx,.jpg,.jpeg,.png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
              multiple
              onChange={handleFileInputChange}
              className="hidden"
            />
          </label>

          {analysis && canDownloadDocx && (
            <a
              href={`/api/studies/${study.id}/report/docx`}
              download
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>Descargar DOCX</span>
            </a>
          )}
        </div>
      </div>

      {/* Task 10 & 11: AI Analysis Block */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Análisis IA:</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block font-medium">Proveedor:</span>
              <select
                value={selectedCredId}
                onChange={(e) => handleCredChange(e.target.value)}
                disabled={isAnalyzing}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-indigo-500"
              >
                {credentials.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.alias} ({c.provider})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] block font-medium">Modelo:</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                disabled={isAnalyzing}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
              >
                {selectedCred?.availableModels?.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                )) || <option value="gemini-3.6-flash">gemini-3.6-flash</option>}
              </select>
            </div>
          </div>
        </div>

        {/* Trigger Button or Blocked Warning (Task 11) */}
        <div className="flex items-center gap-3">
          {documents.length === 0 ? (
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              <span>Incorpora al menos un antecedente antes de ejecutar el análisis.</span>
            </div>
          ) : (
            <button
              onClick={handleTriggerAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition active:scale-95"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Analizando antecedentes...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-white" />
                  <span>Analizar antecedentes</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Task 21: Progress during analysis */}
      {isAnalyzing && (
        <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2 text-xs text-indigo-200 animate-pulse">
          <div className="flex items-center gap-2 font-bold text-white">
            <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
            <span>Ejecutando pipeline de análisis sobre documentos auténticos...</span>
          </div>
          <p className="text-[11px] text-slate-300 font-mono">
            Fases: 01 Clasificación de bytes → 02 Extracción fáctica estricta → 03 Cadena de títulos → 04 Análisis cruzado → 05 Vacíos → 06 Revisión crítica → 07 Evidence Gate → 08 Reporte DOCX.
          </p>
        </div>
      )}

      {/* Tabs Navigation Bar */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 overflow-x-auto">
        {tabs
          .filter((t) => t.condition === undefined || t.condition === true)
          .map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                activeTab === t.id
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              {t.label}
            </button>
          ))}
      </div>

      {/* Tab 1: Resumen */}
      {activeTab === "resumen" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Individualización Registral</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-slate-400">Rol de Avalúo Fiscal:</p>
                  <p className="text-white font-mono font-bold mt-1">{study.role || "No consta en antecedentes"}</p>
                </div>
                <div>
                  <p className="text-slate-400">Comuna / Jurisdicción CBR:</p>
                  <p className="text-white font-semibold mt-1">{study.commune || "No consta en antecedentes"}</p>
                </div>
                <div>
                  <p className="text-slate-400">Documentos Custodiados:</p>
                  <p className="text-white font-mono font-bold mt-1">{documents.length} archivos</p>
                </div>
                <div>
                  <p className="text-slate-400">Tipo de Dictamen:</p>
                  <p className="text-white font-semibold mt-1">{study.moduleType}</p>
                </div>
              </div>
            </div>

            {/* Analysis State card */}
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Estado de Verificación Técnica</h3>
              {analysis ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Análisis validado con modelo: {analysis.executionManifest.model}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                      <p className="text-slate-400 text-[10px]">Cobertura de Evidencia</p>
                      <p className="text-xl font-bold text-emerald-400 font-mono mt-1">
                        {analysis.executionManifest.evidenceCoverage}%
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                      <p className="text-slate-400 text-[10px]">Evidence Gate</p>
                      <p className="text-xl font-bold text-emerald-400 font-mono mt-1">
                        {analysis.executionManifest.evidenceGate}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                      <p className="text-slate-400 text-[10px]">Revisor Crítico</p>
                      <p className="text-xl font-bold text-emerald-400 font-mono mt-1">
                        {analysis.executionManifest.criticalReview}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  No se ha ejecutado el análisis pericial. Incorpora antecedentes y pulsa "Analizar antecedentes".
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Custodia Documental</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cada documento aportado cuenta con hash SHA-256 inmutable calculado al ingreso. Ninguna afirmación es
                admitida sin sustento material exacto.
              </p>
              <div className="pt-2">
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
                  {documents.length} documento(s) resguardado(s)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Documentos */}
      {activeTab === "documentos" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Documento</th>
                  <th className="py-3 px-4">MIME</th>
                  <th className="py-3 px-4">Páginas</th>
                  <th className="py-3 px-4">Hash SHA-256</th>
                  <th className="py-3 px-4">Calidad</th>
                  <th className="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {documents.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/20">
                    <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-400" />
                      <span>{d.originalName}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">{d.mimeType}</td>
                    <td className="py-3 px-4 font-mono">{d.pageCount || 1}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {d.sha256.slice(0, 16)}...
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono">
                        {d.readingQuality || "UNKNOWN"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-mono text-[10px]">{d.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Hechos (Task 20) */}
      {activeTab === "hechos" && (
        <div className="space-y-4">
          {!analysis || analysis.facts.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
              No hay hechos extraídos. Ejecute el análisis para procesar los documentos.
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Tipo</th>
                    <th className="py-3 px-4">Valor Extraído</th>
                    <th className="py-3 px-4">Documento Fuente</th>
                    <th className="py-3 px-4">Página</th>
                    <th className="py-3 px-4">Confianza</th>
                    <th className="py-3 px-4">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {analysis.facts.map((f) => {
                    const ev = f.evidence[0];
                    return (
                      <tr key={f.id} className="hover:bg-slate-800/20">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-400">{f.type}</td>
                        <td className="py-3 px-4 font-semibold text-white">
                          {typeof f.originalValue === "object"
                            ? JSON.stringify(f.originalValue)
                            : String(f.originalValue)}
                        </td>
                        <td className="py-3 px-4 text-slate-300">{ev?.fileName || "No consta"}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{ev?.page ? `Pág. ${ev.page}` : "N/C"}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold">
                            {ev?.confidence || "HIGH"}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setViewingEvidenceFact(f)}
                            className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Ver fuente</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Evidencias */}
      {activeTab === "evidencias" && (
        <div className="space-y-4">
          {!analysis ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
              No hay matriz de evidencia generada aún.
            </div>
          ) : (
            <div className="space-y-3">
              {analysis.facts.map((f) => (
                <div key={f.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-indigo-400 font-bold">{f.id} • {f.type}</span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      {f.evidence.length} cita(s) verificable(s)
                    </span>
                  </div>
                  {f.evidence.map((ev, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800/60 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-300">{ev.fileName} (Pág. {ev.page || "1"})</span>
                        <span className="text-emerald-400 font-mono">{ev.confidence}</span>
                      </div>
                      <p className="text-slate-300 italic">"{ev.originalText}"</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Cadena de Títulos */}
      {activeTab === "cadena" && (
        <div className="space-y-4">
          {!analysis || !analysis.titleChain || analysis.titleChain.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
              No se han detectado eslabones de dominio en los antecedentes analizados.
            </div>
          ) : (
            <div className="space-y-3">
              {analysis.titleChain.map((link, idx) => (
                <div key={link.id || idx} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">
                      Eslabón {idx + 1}: {link.titleType}
                    </h4>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[10px] font-bold">
                      {link.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400 pt-1">
                    <div>Vendedor: <strong className="text-slate-200 block">{link.seller || "No consta"}</strong></div>
                    <div>Comprador: <strong className="text-slate-200 block">{link.buyer || "No consta"}</strong></div>
                    <div>Inscripción CBR: <strong className="text-slate-200 block">Fs. {link.fojas || "-"} N° {link.numero || "-"} ({link.year || "-"})</strong></div>
                    <div>CBR: <strong className="text-slate-200 block">{link.cbr || "No consta"}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 6: Discrepancias */}
      {activeTab === "discrepancias" && (
        <div className="space-y-4">
          {!analysis || analysis.discrepancies.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl text-emerald-400/80 text-xs">
              No se han detectado discrepancias materiales en los antecedentes examinados.
            </div>
          ) : (
            <div className="space-y-2">
              {analysis.discrepancies.map((d, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
                  <span>{d}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 7: Vacíos Documentales */}
      {activeTab === "vacios" && (
        <div className="space-y-4">
          {!analysis || analysis.missingEvidence.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
              No se constataron vacíos de títulos indispensables en el tracto analizado.
            </div>
          ) : (
            <div className="space-y-2">
              {analysis.missingEvidence.map((m, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                  <span>{m}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 8: Topografía */}
      {activeTab === "topografia" && (
        <div className="space-y-4">
          {!analysis?.topography ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
              No se registran datos topográficos calculados.
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-slate-400 text-[10px]">Perímetro Total Calculado:</p>
                  <p className="text-xl font-mono font-bold text-white mt-1">
                    {analysis.topography.perimeterMetersCalculated} m
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-slate-400 text-[10px]">Discrepancia Máxima Superficie:</p>
                  <p className="text-xl font-mono font-bold text-emerald-400 mt-1">
                    {analysis.topography.maxSurfaceDiscrepancyPercentage}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 9: Informe */}
      {activeTab === "informe" && (
        <div className="space-y-4">
          {!analysis ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
              El informe estará disponible una vez ejecutado y validado el análisis.
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">Dictamen Pericial y Conclusiones</h3>
                  <p className="text-xs text-slate-400">Generado mediante trazabilidad estricta y evidencia auditada.</p>
                </div>
                {canDownloadDocx && (
                  <a
                    href={`/api/studies/${study.id}/report/docx`}
                    download
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                  >
                    <Download className="h-4 w-4" />
                    <span>Descargar DOCX</span>
                  </a>
                )}
              </div>

              <div className="space-y-3 text-xs">
                {analysis.conclusions.map((c, idx) => (
                  <div key={c.id || idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <p className="font-bold text-white">Conclusión {idx + 1}:</p>
                    <p className="text-slate-300 leading-relaxed">{c.text}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Respaldada por hechos: {c.supportingFactIds.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 10: Auditoría */}
      {activeTab === "auditoria" && (
        <div className="space-y-4">
          {!analysis ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500 text-xs">
              No hay manifiesto de ejecución pericial disponible.
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 text-xs font-mono">
              <h3 className="text-sm font-bold text-white uppercase font-sans">Manifiesto Inmutable de Ejecución</h3>
              <div className="grid grid-cols-2 gap-3 text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>Modelo: <strong className="text-indigo-400">{analysis.executionManifest.model}</strong></div>
                <div>Generado: {new Date(analysis.executionManifest.generatedAt).toLocaleString("es-CL")}</div>
                <div>Schema Validation: <strong className="text-emerald-400">{analysis.executionManifest.schemaValidation}</strong></div>
                <div>Critical Review: <strong className="text-emerald-400">{analysis.executionManifest.criticalReview}</strong></div>
                <div>Evidence Gate: <strong className="text-emerald-400">{analysis.executionManifest.evidenceGate}</strong></div>
                <div>Cobertura de Evidencia: <strong className="text-emerald-400">{analysis.executionManifest.evidenceCoverage}%</strong></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal: Ver Fuente (Task 20) */}
      {viewingEvidenceFact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white">Cita Literal y Fuente Documental</h4>
              <button
                onClick={() => setViewingEvidenceFact(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Hecho Evaluado:</span>
                <span className="text-white font-semibold">{viewingEvidenceFact.type}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Valor Fáctico:</span>
                <span className="text-indigo-300 font-mono">
                  {typeof viewingEvidenceFact.originalValue === "object"
                    ? JSON.stringify(viewingEvidenceFact.originalValue)
                    : String(viewingEvidenceFact.originalValue)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-slate-400 font-bold block">Citas Documentales Acreditadas:</span>
                {viewingEvidenceFact.evidence.map((ev: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <p className="text-slate-300 font-bold">{ev.fileName} (Pág. {ev.page || "1"})</p>
                    <p className="text-slate-400 italic">"{ev.originalText}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
