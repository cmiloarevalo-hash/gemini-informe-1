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
  FileCheck,
  Search,
  Compass,
  FileSpreadsheet
} from "lucide-react";
import { DocumentItem } from "../documents/DocumentManager";

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
    previousTitleReference?: string;
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
  onRunAnalysis: () => void;
}

export const StudyDetail: React.FC<StudyDetailProps> = ({
  study,
  documents,
  analysis,
  isAnalyzing,
  onBack,
  onRunAnalysis
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

  const tabs: Array<{ id: typeof activeTab; label: string; condition?: boolean }> = [
    { id: "resumen", label: "Resumen" },
    { id: "documentos", label: `Documentos (${documents.length})` },
    { id: "hechos", label: `Hechos (${analysis?.facts.length || 0})` },
    { id: "evidencias", label: "Evidencias" },
    { id: "cadena", label: "Cadena de Títulos", condition: study.moduleType === "TITLE_STUDY" },
    { id: "discrepancias", label: `Discrepancias (${analysis?.discrepancies.length || 0})` },
    { id: "vacios", label: `Vacíos Documentales (${analysis?.missingEvidence.length || 0})` },
    { id: "topografia", label: "Topografía & Superficies", condition: study.moduleType === "TOPOGRAPHIC_STUDY" },
    { id: "informe", label: "Informe & Dictamen" },
    { id: "auditoria", label: "Auditoría del Estudio" }
  ];

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

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onRunAnalysis}
            disabled={isAnalyzing || documents.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition active:scale-95"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            <span>{isAnalyzing ? "Ejecutando 12 Fases..." : "Analizar Expediente"}</span>
          </button>

          {analysis && (
            <a
              href={`/api/studies/${study.id}/report/docx`}
              download
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>Descargar DOCX</span>
            </a>
          )}
        </div>
      </div>

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
                  <p className="text-white font-mono font-bold mt-1">{study.role || "Pendiente de acreditación"}</p>
                </div>
                <div>
                  <p className="text-slate-400">Comuna / Jurisdicción CBR:</p>
                  <p className="text-white font-semibold mt-1">{study.commune || "Pendiente de acreditación"}</p>
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
                    <span>Análisis validado con éxito mediante modelo: {analysis.executionManifest.model}</span>
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
                  El expediente no cuenta con un informe consolidado aún. Presione "Analizar Expediente" para iniciar
                  la ejecución del pipeline de 12 fases.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Reglas de Integridad Activas</h4>
              <ul className="text-xs text-slate-400 space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Cálculo determinista de SHA-256 sobre bytes reales.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Evidence Gate bloquea afirmaciones sin página o cita.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Ausencia ≠ Inexistencia de gravámenes.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Documentos */}
      {activeTab === "documentos" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Documento</th>
                  <th className="py-3 px-4">Páginas</th>
                  <th className="py-3 px-4">Tamaño</th>
                  <th className="py-3 px-4">SHA-256 Verificado</th>
                  <th className="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {documents.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-400" />
                      {d.originalName}
                    </td>
                    <td className="py-3 px-4 font-mono">{d.pageCount ? `${d.pageCount} págs` : "N/C"}</td>
                    <td className="py-3 px-4 font-mono">{(d.size / 1024).toFixed(1)} KB</td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                      {d.sha256.slice(0, 16)}...{d.sha256.slice(-8)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20 font-bold">
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Hechos */}
      {activeTab === "hechos" && (
        <div className="space-y-3">
          {!analysis ? (
            <p className="text-xs text-slate-500">Ejecute el análisis para ver los hechos extraídos.</p>
          ) : (
            analysis.facts.map((f) => (
              <div key={f.id} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-indigo-400 font-bold">{f.id}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                    {f.type}
                  </span>
                </div>
                <p className="text-slate-100 font-medium">Valor Registral: {String(f.originalValue)}</p>
                <div className="border-t border-slate-800/80 pt-2 text-[11px] text-slate-400">
                  <span>Evidencias vinculadas: </span>
                  <span className="font-mono text-indigo-300">{f.evidence.map((e) => e.id).join(", ")}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Evidencias */}
      {activeTab === "evidencias" && (
        <div className="space-y-3">
          {!analysis ? (
            <p className="text-xs text-slate-500">Ejecute el análisis para examinar la matriz de evidencias.</p>
          ) : (
            analysis.facts.flatMap((f) =>
              f.evidence.map((ev) => (
                <div key={ev.id} className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-emerald-400 font-bold">{ev.id}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {ev.fileName} • Pág. {ev.page ?? "N/C"}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-slate-300">
                    "{ev.originalText}"
                  </div>
                </div>
              ))
            )
          )}
        </div>
      )}

      {/* Tab 5: Cadena de Títulos */}
      {activeTab === "cadena" && study.moduleType === "TITLE_STUDY" && (
        <div className="space-y-3">
          {!analysis || !analysis.titleChain ? (
            <p className="text-xs text-slate-500">Ejecute el análisis para examinar el tracto sucesivo.</p>
          ) : (
            analysis.titleChain.map((link, idx) => (
              <div
                key={link.id}
                className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-start gap-4 text-xs"
              >
                <div className="h-8 w-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">{link.titleType}</h4>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        link.status === "CONFIRMED_LINK"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {link.status}
                    </span>
                  </div>
                  {link.seller && <p className="text-slate-400">Tradente: <span className="text-slate-200">{link.seller}</span></p>}
                  {link.buyer && <p className="text-slate-400">Adquirente: <span className="text-slate-200">{link.buyer}</span></p>}
                  {link.fojas && (
                    <p className="text-slate-400">
                      Inscripción: <span className="text-slate-200">Fojas {link.fojas} N° {link.numero} ({link.year})</span>
                    </p>
                  )}
                  {link.previousTitleReference && (
                    <p className="text-amber-400/90 text-[11px] font-mono">
                      Cita título previo: {link.previousTitleReference}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 6: Discrepancias */}
      {activeTab === "discrepancias" && (
        <div className="space-y-3">
          {!analysis ? (
            <p className="text-xs text-slate-500">Ejecute el análisis para detectar discrepancias entre fuentes.</p>
          ) : analysis.discrepancies.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-semibold">No se detectaron discrepancias entre fuentes</p>
            </div>
          ) : (
            analysis.discrepancies.map((d, i) => (
              <div key={i} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{d}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 7: Vacíos Documentales */}
      {activeTab === "vacios" && (
        <div className="space-y-3">
          {!analysis ? (
            <p className="text-xs text-slate-500">Ejecute el análisis para verificar vacíos de antecedentes.</p>
          ) : analysis.missingEvidence.length === 0 ? (
            <p className="text-xs text-slate-400">No se constataron vacíos documentales.</p>
          ) : (
            analysis.missingEvidence.map((m, i) => (
              <div key={i} className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{m}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 8: Topografía */}
      {activeTab === "topografia" && study.moduleType === "TOPOGRAPHIC_STUDY" && (
        <div className="space-y-6">
          {!analysis || !analysis.topography ? (
            <p className="text-xs text-slate-500">Ejecute el análisis para ver los cálculos topográficos.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400">Perímetro Calculado (Suma Tramos)</p>
                  <p className="text-xl font-bold text-white font-mono mt-1">
                    {analysis.topography.perimeterMetersCalculated} m
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400">Diferencia Título vs Terreno</p>
                  <p className="text-xl font-bold text-indigo-400 font-mono mt-1">
                    {analysis.topography.maxSurfaceDiscrepancyPercentage}%
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400">Tolerancia Legal (≤ 2.0%)</p>
                  <p className="text-xl font-bold text-emerald-400 font-mono mt-1">
                    {analysis.topography.isWithinAcceptableTolerance ? "ADMISIBLE" : "EXCEDE LÍMITE"}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs space-y-3">
                <h4 className="font-bold text-white uppercase tracking-wider">Superficies Cotejadas</h4>
                {analysis.topography.surfaces.map((s, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono">
                    <span className="text-slate-400">{s.sourceType}</span>
                    <span className="text-slate-200">Declarado: {s.statedValueRaw}</span>
                    <span className="text-indigo-400 font-bold">{s.normalizedSquareMeters.toLocaleString("es-CL")} m²</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 9: Informe */}
      {activeTab === "informe" && (
        <div className="space-y-6">
          {!analysis ? (
            <p className="text-xs text-slate-500">Ejecute el análisis para generar el informe oficial.</p>
          ) : (
            <>
              {/* Findings */}
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider">Hallazgos Técnicos</h4>
                {analysis.findings.map((f) => (
                  <div key={f.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono text-[10px] font-bold shrink-0">
                      {f.category}
                    </span>
                    <span className="text-slate-200">{f.statement}</span>
                  </div>
                ))}
              </div>

              {/* Conclusions */}
              <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-white uppercase tracking-wider">Conclusiones Dictaminadas</h4>
                {analysis.conclusions.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <p className="text-white font-medium">{c.text}</p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Respaldada por hechos comprobados: {c.supportingFactIds.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab 10: Auditoría */}
      {activeTab === "auditoria" && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Execution Manifest Criptográfico</h3>
          {!analysis ? (
            <p className="text-xs text-slate-500">Ejecute el análisis para ver el manifest inmutable.</p>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 font-mono text-xs text-slate-300">
              <pre className="overflow-x-auto">{JSON.stringify(analysis.executionManifest, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
