import React from "react";
import {
  Cloud,
  Cpu,
  Settings,
  User,
  CheckCircle2,
  Clock
} from "lucide-react";

interface HeaderProps {
  pageTitle: string;
  activeProvider: string;
  activeModel: string;
  isDriveConnected?: boolean;
  onOpenGoogleModal: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  activeProvider,
  activeModel,
  onOpenGoogleModal,
  onOpenSettings
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between shrink-0 select-none z-10">
      {/* Page Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
          <span>LexTech</span>
          <span>/</span>
          <span className="text-indigo-400 capitalize">{pageTitle.replace("-", " ")}</span>
        </div>
        <h2 className="text-base font-bold text-white tracking-tight">{pageTitle.toUpperCase()}</h2>
      </div>

      {/* Status Indicators & User Controls */}
      <div className="flex items-center gap-3">
        {/* Active AI Provider & Model Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs shadow-inner">
          <Cpu className="h-3.5 w-3.5 text-purple-400" />
          <span className="font-semibold text-slate-200">{activeProvider}</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-indigo-400 font-medium">{activeModel}</span>
        </div>

        {/* Google Drive Status (Task 25: PLANNED) */}
        <button
          onClick={onOpenGoogleModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/80 text-slate-300 hover:border-slate-700 text-xs font-medium transition"
          title="Google Drive: Planificado para siguiente fase"
        >
          <Cloud className="h-3.5 w-3.5 text-slate-400" />
          <span>Drive:</span>
          <span className="font-mono text-[10px] text-amber-400 font-bold">
            PLANNED
          </span>
        </button>

        {/* Quick Settings Icon */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition"
          title="Configuración de Proveedores IA"
        >
          <Settings className="h-4 w-4" />
        </button>

        {/* User Account / Google Identity (Task 25: PLANNED) */}
        <div className="pl-2 border-l border-slate-800 flex items-center gap-2.5">
          <button
            onClick={onOpenGoogleModal}
            className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 transition"
          >
            <div className="h-6 w-6 rounded-full bg-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-300 shadow-sm">
              <User className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[11px] font-semibold text-slate-200 leading-tight">Perito Analista</p>
              <p className="text-[9px] text-amber-400 font-mono">Google Auth: PLANNED</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
