import React from "react";
import {
  Cloud,
  Cpu,
  Settings,
  User,
  LogOut,
  LogIn,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface HeaderProps {
  pageTitle: string;
  activeProvider: string;
  activeModel: string;
  isDriveConnected: boolean;
  onOpenGoogleModal: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  activeProvider,
  activeModel,
  isDriveConnected,
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
          <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[9px] border border-emerald-500/20 font-bold">
            VERIFIED
          </span>
        </div>

        {/* Google Drive Status Pill */}
        <button
          onClick={onOpenGoogleModal}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition ${
            isDriveConnected
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
              : "bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700"
          }`}
          title="Configurar conexión con Google Drive"
        >
          <Cloud className={`h-3.5 w-3.5 ${isDriveConnected ? "text-emerald-400" : "text-slate-400"}`} />
          <span>Drive:</span>
          <span className="font-mono text-[10px] text-amber-400 font-bold">
            {isDriveConnected ? "CONECTADO" : "ARCHITECTURE_READY"}
          </span>
        </button>

        {/* Quick Settings Icon */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition"
          title="Configuración global"
        >
          <Settings className="h-4 w-4" />
        </button>

        {/* User Account / Google Identity */}
        <div className="pl-2 border-l border-slate-800 flex items-center gap-2.5">
          <button
            onClick={onOpenGoogleModal}
            className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 transition"
          >
            <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-[10px] text-white shadow-sm">
              CC
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-[11px] font-semibold text-slate-200 leading-tight">Camilo Consul</p>
              <p className="text-[9px] text-emerald-400 font-mono">Google Conectado</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
