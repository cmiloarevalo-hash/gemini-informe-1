import React from "react";
import {
  Home,
  FolderPlus,
  Folders,
  FileText,
  Cloud,
  CheckSquare,
  AlertTriangle,
  Cpu,
  Boxes,
  KeyRound,
  FileSpreadsheet,
  User,
  Activity,
  ShieldCheck,
  ChevronDown
} from "lucide-react";

export type NavigationPage =
  | "inicio"
  | "nuevo-estudio"
  | "mis-estudios"
  | "expediente-documental"
  | "google-drive"
  | "hechos-evidencia"
  | "discrepancias"
  | "proveedores-ia"
  | "modelos"
  | "integraciones-google"
  | "plantillas"
  | "perfil"
  | "procesamiento"
  | "auditoria"
  | "detalle-estudio";

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  studiesCount: number;
  documentsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  studiesCount,
  documentsCount
}) => {
  const isSectionActive = (pages: NavigationPage[]) => pages.includes(currentPage);

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/80 backdrop-blur-md flex flex-col justify-between shrink-0 h-full select-none">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-slate-800/80 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 font-extrabold text-sm tracking-wider">
            LX
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-white leading-tight">LexTech AI</h1>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Títulos & Topografía</p>
          </div>
        </div>

        {/* Scrollable Navigation List */}
        <div className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-140px)]">
          {/* Section: Inicio */}
          <div>
            <button
              onClick={() => onNavigate("inicio")}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition ${
                currentPage === "inicio"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Inicio / Dashboard</span>
            </button>
          </div>

          {/* Section: Estudios */}
          <div>
            <div className="px-3 mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Estudios</span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                {studiesCount}
              </span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => onNavigate("nuevo-estudio")}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentPage === "nuevo-estudio"
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <FolderPlus className="h-3.5 w-3.5 text-indigo-400" />
                <span>Nuevo estudio</span>
              </button>
              <button
                onClick={() => onNavigate("mis-estudios")}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentPage === "mis-estudios" || currentPage === "detalle-estudio"
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Folders className="h-3.5 w-3.5 text-cyan-400" />
                <span>Mis estudios</span>
              </button>
            </div>
          </div>

          {/* Section: Documentos */}
          <div>
            <div className="px-3 mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <span>Documentos</span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                {documentsCount}
              </span>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => onNavigate("expediente-documental")}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentPage === "expediente-documental"
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <FileText className="h-3.5 w-3.5 text-blue-400" />
                <span>Expediente documental</span>
              </button>
              <button
                onClick={() => onNavigate("google-drive")}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentPage === "google-drive"
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Cloud className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Google Drive</span>
                </div>
                <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 font-mono">Ready</span>
              </button>
            </div>
          </div>

          {/* Section: Análisis */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Análisis
            </div>
            <div className="space-y-1">
              <button
                onClick={() => onNavigate("hechos-evidencia")}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentPage === "hechos-evidencia"
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
                <span>Hechos y evidencia</span>
              </button>
              <button
                onClick={() => onNavigate("discrepancias")}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentPage === "discrepancias"
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span>Discrepancias & Vacíos</span>
              </button>
            </div>
          </div>

          {/* Section: Configuración */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Configuración
            </div>
            <div className="space-y-1">
              <button
                onClick={() => onNavigate("proveedores-ia")}
                className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentPage === "proveedores-ia"
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Cpu className="h-3.5 w-3.5 text-purple-400" />
                  <span>Proveedores IA</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  Gemini 3.8
                </span>
              </button>
              <button
                onClick={() => onNavigate("modelos")}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentPage === "modelos"
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Boxes className="h-3.5 w-3.5 text-indigo-400" />
                <span>Modelos</span>
              </button>
              <button
                onClick={() => onNavigate("integraciones-google")}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentPage === "integraciones-google"
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <KeyRound className="h-3.5 w-3.5 text-sky-400" />
                <span>Integraciones Google</span>
              </button>
              <button
                onClick={() => onNavigate("plantillas")}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentPage === "plantillas"
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                <span>Plantillas DOCX</span>
              </button>
              <button
                onClick={() => onNavigate("perfil")}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentPage === "perfil"
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Perfil</span>
              </button>
            </div>
          </div>

          {/* Section: Operación */}
          <div>
            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Operación
            </div>
            <div className="space-y-1">
              <button
                onClick={() => onNavigate("procesamiento")}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentPage === "procesamiento"
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <Activity className="h-3.5 w-3.5 text-amber-400" />
                <span>Procesamiento (Jobs)</span>
              </button>
              <button
                onClick={() => onNavigate("auditoria")}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  currentPage === "auditoria"
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Auditoría Forense</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Profile Preview */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between text-[11px] mb-2">
          <span className="text-slate-400 font-medium">Entorno:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
            FREE_PROTOTYPE
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-xs text-white shadow">
            CC
          </div>
          <div className="truncate flex-1">
            <p className="text-xs font-semibold text-slate-200 truncate">Camilo Consul</p>
            <p className="text-[10px] text-slate-400 font-mono truncate">camilo.a.consul@gmail.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
