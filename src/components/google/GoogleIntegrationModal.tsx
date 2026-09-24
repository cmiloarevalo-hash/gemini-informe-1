import React, { useState } from "react";
import {
  Cloud,
  X,
  Lock,
  Clock,
  Info
} from "lucide-react";

interface GoogleIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDriveConnected?: boolean;
  onToggleDriveConnection?: (connected: boolean) => void;
}

export const GoogleIntegrationModal: React.FC<GoogleIntegrationModalProps> = ({
  isOpen,
  onClose
}) => {
  // Hooks MUST be called unconditionally at top of component
  const [activeTab, setActiveTab] = useState<"auth" | "drive">("auth");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Google Workspace & Drive</h3>
              <p className="text-xs text-slate-400">Estado de integración técnica</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Deferred Notice Banner (Task 25) */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <Clock className="h-4 w-4" />
            <span>Integración Diferida (PLANNED / DEFERRED)</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Conforme a la directriz de arquitectura de la Fase de Corrección Prioritaria, Google Login y Google Drive
            se encuentran planificados para la siguiente fase. La plataforma opera actualmente en modo de ingestión
            local de antecedentes con custodia y cálculo criptográfico SHA-256 bit-a-bit en el servidor.
          </p>
        </div>

        {/* Details Cards */}
        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Google Authentication:</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px] border border-amber-500/20 font-bold">
                PLANNED
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Inicio de sesión federado de peritos mediante OAuth 2.0 (Google Identity Services).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Google Drive & Picker API:</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono text-[10px] border border-amber-500/20 font-bold">
                PLANNED
              </span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Acceso selectivo mediante scope restringido <code className="text-indigo-300 font-mono">drive.file</code> para
              incorporación directa de planos DWG/PDF y escrituras notariales.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
          >
            Entendido / Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
