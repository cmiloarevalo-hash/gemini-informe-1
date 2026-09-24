import React, { useState } from "react";
import {
  FileText,
  UploadCloud,
  Cloud,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Search,
  ExternalLink,
  ShieldCheck,
  Trash2
} from "lucide-react";

export interface DocumentItem {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  sha256: string;
  pageCount?: number | null;
  readingQuality?: string;
  status: string;
  createdAt: string;
}

interface DocumentManagerProps {
  documents: DocumentItem[];
  isUploading: boolean;
  onUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenDriveModal: () => void;
  studyName?: string;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents,
  isUploading,
  onUploadFile,
  onOpenDriveModal,
  studyName
}) => {
  const [activeTab, setActiveTab] = useState<"local" | "drive">("local");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDocuments = documents.filter((doc) =>
    doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.sha256.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Expediente Documental</h2>
          <p className="text-xs text-slate-400">
            {studyName ? `Documentos en custodia para: ${studyName}` : "Nómina general de documentos y resguardo criptográfico"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 transition active:scale-95">
            <UploadCloud className="h-4 w-4" />
            <span>{isUploading ? "Analizando Bytes..." : "Subir Archivo Auténtico"}</span>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.docx,.txt"
              onChange={onUploadFile}
              disabled={isUploading}
              className="hidden"
            />
          </label>

          <button
            onClick={onOpenDriveModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm transition"
          >
            <Cloud className="h-4 w-4 text-emerald-400" />
            <span>Google Drive</span>
          </button>
        </div>
      </div>

      {/* Segment Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("local")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "local"
                ? "bg-slate-800 text-white font-semibold border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Custodia Local ({documents.length})
          </button>
          <button
            onClick={() => setActiveTab("drive")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === "drive"
                ? "bg-slate-800 text-white font-semibold border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Google Drive & Picker
          </button>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre o hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>
      </div>

      {/* Tab: Custodia Local */}
      {activeTab === "local" && (
        <div className="space-y-4">
          {filteredDocuments.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
              <FileText className="h-10 w-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">No hay documentos registrados</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Suba escrituras de compraventa, certificados de dominio vigente del Conservador de Bienes Raíces (CBR) o
                planos topográficos para iniciar el análisis fundado.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/40 shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Documento</th>
                    <th className="py-3 px-4">Tipo / MIME</th>
                    <th className="py-3 px-4">Páginas Reales</th>
                    <th className="py-3 px-4">Tamaño</th>
                    <th className="py-3 px-4">Hash SHA-256 Criptográfico</th>
                    <th className="py-3 px-4">Calidad Lectura</th>
                    <th className="py-3 px-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-4 font-semibold text-white flex items-center gap-2.5">
                        <div className="h-7 w-7 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                          <FileText className="h-3.5 w-3.5" />
                        </div>
                        <span className="truncate max-w-xs">{doc.originalName}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">{doc.mimeType}</td>
                      <td className="py-3 px-4 font-mono">
                        {doc.pageCount ? `${doc.pageCount} págs` : <span className="text-slate-500">N/C</span>}
                      </td>
                      <td className="py-3 px-4 font-mono">{(doc.size / 1024).toFixed(1)} KB</td>
                      <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                        <span className="text-indigo-400 font-bold">{doc.sha256.slice(0, 10)}</span>
                        <span>...</span>
                        <span>{doc.sha256.slice(-8)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          {doc.readingQuality || "HIGH"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                          {doc.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Google Drive & Picker */}
      {activeTab === "drive" && (
        <div className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Cloud className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Integración con Google Drive & Google Picker</h3>
              <p className="text-xs text-slate-400 max-w-xl">
                Permite seleccionar archivos directamente desde las carpetas del Conservador de Bienes Raíces o Notaría
                almacenadas en Google Drive, bajo el scope mínimo restringido de seguridad.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold">Alcance Requerido (OAuth Scope):</span>
              <code className="text-[11px] text-indigo-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                https://www.googleapis.com/auth/drive.file
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold">Estado en este Entorno:</span>
              <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono text-[10px] font-bold">
                ARCHITECTURE_READY
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenDriveModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center gap-2"
            >
              <Cloud className="h-4 w-4" />
              <span>Conectar Google Drive / Abrir Picker</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
