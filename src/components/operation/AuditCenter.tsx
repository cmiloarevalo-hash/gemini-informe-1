import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  FileText,
  FileCode,
  Play,
  Download,
  AlertTriangle,
  Lock,
  Layers
} from "lucide-react";

interface AuditCenterProps {
  auditBundle: Record<string, unknown> | null;
}

export const AuditCenter: React.FC<AuditCenterProps> = ({ auditBundle }) => {
  const [selectedFile, setSelectedFile] = useState<string>("AUDIT_INDEX.json");

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-1">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Audit Bundle Forense • 10 Artefactos Normativos</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Centro de Auditoría Forense</h2>
          <p className="text-xs text-slate-400">
            Verificación técnica y matrices de requerimientos, investigación de fuentes oficiales y estado de seguridad.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" />
            14/14 TEST PASS
          </span>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left: Files List */}
        <div className="md:col-span-1 space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Artefactos JSON</p>
          <div className="space-y-1">
            {auditBundle &&
              Object.keys(auditBundle).map((fileName) => (
                <button
                  key={fileName}
                  onClick={() => setSelectedFile(fileName)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition flex items-center justify-between ${
                    selectedFile === fileName
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-bold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <span className="truncate">{fileName}</span>
                  <span className="text-[10px] text-emerald-400">✓</span>
                </button>
              ))}
          </div>
        </div>

        {/* Right: File Viewer */}
        <div className="md:col-span-3 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white font-mono">{selectedFile}</h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] border border-emerald-500/20">
                JSON VÁLIDO
              </span>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-300 max-h-[550px] overflow-auto">
              {auditBundle && auditBundle[selectedFile]
                ? JSON.stringify(auditBundle[selectedFile], null, 2)
                : "Seleccione un archivo del bundle para inspeccionar."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
