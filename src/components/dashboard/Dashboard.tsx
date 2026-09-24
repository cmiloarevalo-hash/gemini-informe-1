import React from "react";
import {
  FolderPlus,
  Cloud,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Cpu,
  Layers
} from "lucide-react";

interface StudySummary {
  id: string;
  name: string;
  role: string | null;
  commune: string | null;
  moduleType: "TITLE_STUDY" | "TOPOGRAPHIC_STUDY";
  createdAt: string;
}

interface DashboardProps {
  studies: StudySummary[];
  documentsCount: number;
  onOpenNewStudyModal: () => void;
  onOpenDriveModal: () => void;
  onSelectStudy: (study: StudySummary) => void;
  onNavigateToAudit: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  studies,
  documentsCount,
  onOpenNewStudyModal,
  onOpenDriveModal,
  onSelectStudy,
  onNavigateToAudit
}) => {
  const hasDocuments = documentsCount > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Hero Action Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/70 to-slate-900 border border-indigo-500/20 p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Evidence Gate v1.0 • Trazabilidad Forense Activa</span>
            </div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Plataforma de Análisis Documental Técnico-Jurídico
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Auditoría automatizada de títulos de dominio, tracto sucesivo y análisis pericial topográfico basada
              estrictamente en documentos auténticos con cálculo determinista de hashes criptográficos SHA-256.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenNewStudyModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
            >
              <FolderPlus className="h-4 w-4" />
              <span>Nuevo Estudio</span>
            </button>
            <button
              onClick={onOpenDriveModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-md transition transform active:scale-95"
            >
              <Cloud className="h-4 w-4 text-emerald-400" />
              <span>Google Drive (PLANNED)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Estudios Activos</span>
            <Layers className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">{studies.length}</span>
            <span className="text-[11px] text-slate-400 font-medium">Expedientes</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Inmuebles y poligonales bajo examen</p>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Documentos Acompañados</span>
            <FileText className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono">{documentsCount}</span>
            <span className="text-[11px] text-cyan-400 font-medium">En custodia</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Bit-a-bit con SHA-256 verificado</p>
        </div>

        {/* Metric 3: Evidence Gate (Task 19: NOT_EXECUTED when 0 docs/facts) */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Evidence Gate</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-extrabold font-mono ${
                hasDocuments ? "text-emerald-400" : "text-slate-400"
              }`}
            >
              {hasDocuments ? "LISTO" : "NOT_EXECUTED"}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">
            {hasDocuments ? "Control de evidencia disponible" : "Requiere documentos para evaluar"}
          </p>
        </div>

        {/* Metric 4: AI Model */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Modelo IA Oficial</span>
            <Cpu className="h-4 w-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-purple-300 font-mono">gemini-3.6-flash</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Procesamiento multimodal directo</p>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Studies Table (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Expedientes Recientes</h3>
                <p className="text-xs text-slate-400">Seleccione un caso para ver documentos, hechos o generar informe DOCX.</p>
              </div>
              <button
                onClick={onOpenNewStudyModal}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
              >
                + Nuevo
              </button>
            </div>

            {studies.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl space-y-2">
                <FileText className="h-8 w-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400 font-medium">No hay estudios creados todavía.</p>
                <button
                  onClick={onOpenNewStudyModal}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                >
                  Crear Primer Estudio
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {studies.map((study) => (
                  <div
                    key={study.id}
                    onClick={() => onSelectStudy(study)}
                    className="py-3 px-3 rounded-xl hover:bg-slate-800/40 transition cursor-pointer flex items-center justify-between group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                          {study.name}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          {study.moduleType === "TOPOGRAPHIC_STUDY" ? "Topografía" : "Títulos"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                        <span>Rol: {study.role || "No consta"}</span>
                        <span>•</span>
                        <span>Comuna: {study.commune || "No consta"}</span>
                        <span>•</span>
                        <span>{new Date(study.createdAt).toLocaleDateString("es-CL")}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-indigo-400 opacity-0 group-hover:opacity-100 transition text-xs font-medium">
                      <span>Ver Estudio</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Processing Status / Jobs Widget */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Estado de Procesamiento y Pipeline</h3>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20 font-bold">
                Pipeline Activo
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Pipeline de orquestación en tiempo real: Ingestión ➔ Extracción Multimodal ➔ Análisis Cruzado ➔
              Evidence Gate ➔ DOCX.
            </p>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs font-mono text-slate-300 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Motor de Reglas:</span>
                <span className="text-emerald-400 font-semibold">EvidenceGate.evaluate (Strict)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Control de Alucinación:</span>
                <span className="text-emerald-400 font-semibold">Fallo Explícito (Sin Mocks)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Principio Registral:</span>
                <span className="text-indigo-400 font-semibold">Ausencia de Certificado ≠ Inexistencia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Pendientes de Revisión & Auditoría Rápida (1 Col) */}
        <div className="space-y-4">
          {/* Card: Pendientes de Revisión (Clean without synthetic alerts) */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4" />
              <span>Pendientes de Revisión</span>
            </div>

            {studies.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No hay alertas de revisión pendientes. Crea un estudio y adjunta antecedentes para iniciar la auditoría.
              </p>
            ) : (
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-400">
                <span>Expedientes bajo custodia: </span>
                <strong className="text-white font-mono">{studies.length}</strong>.
                <p className="text-[11px] text-slate-500 mt-1">
                  Las alertas y observaciones periciales se generarán dinámicamente al analizar los documentos.
                </p>
              </div>
            )}
          </div>

          {/* Card: Quick Audit Access */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Auditoría & Trazabilidad</span>
            </div>
            <p className="text-xs text-slate-400">
              Acceso a los artefactos del Audit Bundle para peritajes externos y verificación de conformidad técnica.
            </p>
            <button
              onClick={onNavigateToAudit}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
            >
              <span>Abrir Centro de Auditoría</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
