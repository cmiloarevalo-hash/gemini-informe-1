import React, { useState } from "react";
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  FolderOpen
} from "lucide-react";

interface GoogleIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDriveConnected: boolean;
  onToggleDriveConnection: (connected: boolean) => void;
}

export const GoogleIntegrationModal: React.FC<GoogleIntegrationModalProps> = ({
  isOpen,
  onClose,
  isDriveConnected,
  onToggleDriveConnection
}) => {
  if (!isOpen) return null;

  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [pickerStatus, setPickerStatus] = useState<string | null>(null);

  const handleConnectToggle = () => {
    setIsAuthorizing(true);
    setTimeout(() => {
      onToggleDriveConnection(!isDriveConnected);
      setIsAuthorizing(false);
    }, 600);
  };

  const handleLaunchPicker = () => {
    setPickerStatus("Google Picker inicializado: Cargando vista de archivos autorizados...");
    setTimeout(() => {
      setPickerStatus("Google Picker listo. Seleccione escrituras, títulos o planos desde su unidad Drive.");
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Integración Google & Drive</h3>
              <p className="text-xs text-slate-400">Cuenta Google y Google Picker</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Current User Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">Cuenta Google Conectada:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20 font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              SESIÓN ACTIVA
            </span>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-bold text-xs text-white">
              CC
            </div>
            <div>
              <p className="font-bold text-white">Camilo Consul</p>
              <p className="text-slate-400 font-mono text-[11px]">camilo.a.consul@gmail.com</p>
            </div>
          </div>
        </div>

        {/* Google Drive Status & Scope */}
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-white">Conexión a Google Drive</h4>
              <p className="text-slate-400 text-[11px]">Scope mínimo: https://www.googleapis.com/auth/drive.file</p>
            </div>
            <button
              onClick={handleConnectToggle}
              disabled={isAuthorizing}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                isDriveConnected
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20"
                  : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
              }`}
            >
              {isAuthorizing ? "Conectando..." : isDriveConnected ? "Desconectar Drive" : "Conectar Drive"}
            </button>
          </div>

          {/* Google Picker Action */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold text-white">Google Picker Oficial</span>
              </div>
              <button
                onClick={handleLaunchPicker}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
              >
                Abrir Picker
              </button>
            </div>
            {pickerStatus && (
              <p className="text-emerald-400 text-[11px] font-mono pt-1">{pickerStatus}</p>
            )}
          </div>
        </div>

        {/* Security Disclaimers */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-indigo-400" />
            <span>Política de Mínimo Privilegio (Drive.file)</span>
          </p>
          <p className="leading-relaxed">
            La plataforma solo accederá a los documentos explícitamente seleccionados por usted a través de Google Picker,
            garantizando privacidad y confidencialidad en estudios inmobiliarios.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-medium transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
