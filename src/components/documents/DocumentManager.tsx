import React, { useState } from "react";
import {
  FileText,
  UploadCloud,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  ShieldCheck,
  Trash2,
  Plus,
  Clock
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

export interface UploadProgressItem {
  name: string;
  size: number;
  status: "UPLOADING" | "PREPARING" | "READY_FOR_AI" | "FAILED";
  message?: string;
}

interface DocumentManagerProps {
  documents: DocumentItem[];
  isUploading: boolean;
  onUploadFiles: (files: FileList | File[]) => void;
  onOpenDriveModal: () => void;
  studyId?: string | null;
  studyName?: string;
  onCreateNewStudy?: () => void;
  uploadProgress?: UploadProgressItem[];
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  documents,
  isUploading,
  onUploadFiles,
  onOpenDriveModal,
  studyId,
  studyName,
  onCreateNewStudy,
  uploadProgress = []
}) => {
  const [activeTab, setActiveTab] = useState<"local" | "drive">("local");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.sha256.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUploadFiles(e.target.files);
      e.target.value = ""; // Reset input so same files can be re-selected if needed
    }
  };

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

        {/* Action Buttons: Subir antecedentes (Task 1) */}
        <div className="flex items-center gap-3">
          <label className="cursor-pointer flex flex-col items-start px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition active:scale-95">
            <div className="flex items-center gap-2 text-xs font-bold">
              <UploadCloud className="h-4 w-4" />
              <span>{isUploading ? "Procesando antecedentes..." : "Subir antecedentes"}</span>
            </div>
            <span className="text-[10px] text-indigo-200 font-normal pl-6">
              PDF, DOCX, JPG, JPEG y PNG
            </span>
            <input
              type="file"
              accept=".pdf,.docx,.jpg,.jpeg,.png,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/jpeg,image/png"
              multiple
              onChange={handleFileInputChange}
              disabled={isUploading || !studyId}
              className="hidden"
            />
          </label>

          <button
            onClick={onOpenDriveModal}
            className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold shadow-sm transition"
          >
            <Cloud className="h-4 w-4 text-emerald-400" />
            <span>Google Drive</span>
          </button>
        </div>
      </div>

      {/* If No Study Selected Notice (Task 1) */}
      {!studyId && (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-amber-400 mx-auto" />
          <h3 className="text-sm font-bold text-amber-300">
            Primero crea o selecciona un estudio para incorporar antecedentes.
          </h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            Los documentos deben resguardarse criptográficamente vinculados a un expediente específico con aislamiento de titularidad.
          </p>
          {onCreateNewStudy && (
            <button
              onClick={onCreateNewStudy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md transition"
            >
              <Plus className="h-4 w-4" />
              <span>Crear nuevo estudio</span>
            </button>
          )}
        </div>
      )}

      {/* Multi-upload progress card (Task 2) */}
      {uploadProgress && uploadProgress.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-white border-b border-slate-800 pb-2">
            <span>Progreso de Carga de Archivos ({uploadProgress.length})</span>
            <span className="text-slate-400 font-normal text-[11px]">Procesamiento SHA-256 e inspección</span>
          </div>

          <div className="space-y-2">
            {uploadProgress.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-indigo-400" />
                  <div>
                    <p className="font-semibold text-slate-200">{p.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{(p.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {p.status === "UPLOADING" && (
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold animate-pulse">
                      UPLOADING
                    </span>
                  )}
                  {p.status === "PREPARING" && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold">
                      PREPARING
                    </span>
                  )}
                  {p.status === "READY_FOR_AI" && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      READY_FOR_AI
                    </span>
                  )}
                  {p.status === "FAILED" && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono font-bold flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {p.message || "FAILED"}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
            Google Drive & Picker (PLANNED)
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
                Suba escrituras notariales, certificados de dominio vigente del CBR o levantamientos topográficos para iniciar el análisis fundado.
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
                      <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                        <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
                        <span className="truncate max-w-xs">{doc.originalName}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">{doc.mimeType}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-200">
                        {doc.pageCount !== null && doc.pageCount !== undefined ? `${doc.pageCount} pág.` : "1 pág."}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {(doc.size / 1024).toFixed(1)} KB
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400" title={doc.sha256}>
                        {doc.sha256.slice(0, 16)}...{doc.sha256.slice(-8)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] font-bold">
                          {doc.readingQuality || "UNKNOWN"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="h-3 w-3" />
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
        <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Google Drive & Google Picker API</h3>
              <p className="text-xs text-slate-400">Estado de arquitectura: ARCHITECTURE_READY / DEFERRED</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            La integración directa con Google Drive y el selector Picker con scope mínimo restrictivo
            (<code className="text-indigo-300 font-mono">drive.file</code>) está planificada y documentada.
            Para esta fase prioritaria, utilice la subida de antecedentes locales múltiples con validación de tipos e integridad criptográfica.
          </p>
        </div>
      )}
    </div>
  );
};
