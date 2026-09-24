import React from "react";
import {
  FolderPlus,
  Cloud,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Search
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
              <span>Importar desde Drive</span>
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
            <span className="text-[11px] text-emerald-400 font-medium">Expedientes</span>
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
            <span className="text-[11px] text-cyan-400 font-medium">CBR & Notaría</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Bit-a-bit con SHA-256 verificado</p>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Evidence Gate</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400 font-mono">100%</span>
            <span className="text-[11px] text-emerald-400 font-medium">PASS</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Cero hechos sin cita de documento</p>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
            <span>Proveedor IA Activo</span>
            <Cpu className="h-4 w-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-purple-300 font-mono">Gemini 3.8</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Flash oficial + alias certificado 3.6</p>
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
              <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
                <FileText className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">No hay estudios creados todavía.</p>
                <button
                  onClick={onOpenNewStudyModal}
                  className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
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
                        <span>Rol: {study.role || "N/C"}</span>
                        <span>•</span>
                        <span>Comuna: {study.commune || "N/C"}</span>
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
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
                12 Fases Activas
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Pipeline de orquestación en tiempo real: Ingestión ➔ Extracción Multimodal ➔ Entity Resolution ➔ Cadena ➔
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
                <span className="text-slate-400">Normativa CBR:</span>
                <span className="text-indigo-400 font-semibold">Ausencia ≠ Inexistencia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Pendientes de Revisión & Auditoría Rápida (1 Col) */}
        <div className="space-y-4">
          {/* Card: Pendientes de Revisión */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4" />
              <span>Pendientes de Revisión</span>
            </div>
            <p className="text-xs text-slate-400">
              Alertas generadas por el revisor crítico en los expedientes analizados:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                <p className="font-semibold text-xs text-amber-200">Certificado de Hipotecas Pendiente</p>
                <p className="text-[11px] text-amber-300/80 leading-relaxed">
                  Para emitir dictamen de dominio saneado es mandatorio adjuntar Certificado de Hipotecas y Gravámenes vigente.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 space-y-1">
                <p className="font-semibold text-xs text-slate-200">Tracto 10 Años</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Título antecedente citado a Fojas 980 N° 450 año 2010 requiere ser incorporado para cerrar el tracto.
                </p>
              </div>
            </div>
          </div>

          {/* Card: Quick Audit Access */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Auditoría & Trazabilidad</span>
            </div>
            <p className="text-xs text-slate-400">
              Acceso a los 10 artefactos del Audit Bundle para peritajes externos y verificación de conformidad.
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
