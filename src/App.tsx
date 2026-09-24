/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sidebar, NavigationPage } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { Dashboard } from "./components/dashboard/Dashboard";
import { DocumentManager, DocumentItem } from "./components/documents/DocumentManager";
import { AIProvidersConfig } from "./components/config/AIProvidersConfig";
import { StudyDetail } from "./components/study/StudyDetail";
import { GoogleIntegrationModal } from "./components/google/GoogleIntegrationModal";
import { AuditCenter } from "./components/operation/AuditCenter";
import { AlertTriangle } from "lucide-react";

interface Study {
  id: string;
  name: string;
  role: string | null;
  commune: string | null;
  moduleType: "TITLE_STUDY" | "TOPOGRAPHIC_STUDY";
  createdAt: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavigationPage>("inicio");
  const [studies, setStudies] = useState<Study[]>([]);
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Google Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [isDriveConnected, setIsDriveConnected] = useState(false);

  // New Study Modal State
  const [showNewModal, setShowNewModal] = useState(false);
  const [newStudyName, setNewStudyName] = useState("");
  const [newStudyModule, setNewStudyModule] = useState<"TITLE_STUDY" | "TOPOGRAPHIC_STUDY">("TITLE_STUDY");
  const [newStudyRole, setNewStudyRole] = useState("");
  const [newStudyCommune, setNewStudyCommune] = useState("");

  // Audit state
  const [auditBundle, setAuditBundle] = useState<Record<string, unknown> | null>(null);

  // Load Studies & Audit Bundle on mount
  useEffect(() => {
    fetchStudies();
    fetchAuditBundle();
  }, []);

  // When a study is selected, load its documents & analysis
  useEffect(() => {
    if (selectedStudy) {
      fetchDocuments(selectedStudy.id);
      fetchAnalysis(selectedStudy.id);
    }
  }, [selectedStudy]);

  const fetchStudies = async () => {
    try {
      const res = await fetch("/api/studies");
      if (res.ok) {
        const data = await res.json();
        setStudies(data);
        if (data.length > 0 && !selectedStudy) {
          setSelectedStudy(data[0]);
        }
      }
    } catch {
      //
    }
  };

  const fetchDocuments = async (studyId: string) => {
    try {
      const res = await fetch(`/api/studies/${studyId}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch {
      //
    }
  };

  const fetchAnalysis = async (studyId: string) => {
    try {
      const res = await fetch(`/api/studies/${studyId}/analysis`);
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      } else {
        setAnalysis(null);
      }
    } catch {
      setAnalysis(null);
    }
  };

  const fetchAuditBundle = async () => {
    try {
      const res = await fetch("/api/audit/bundle");
      if (res.ok) {
        const data = await res.json();
        setAuditBundle(data);
      }
    } catch {
      //
    }
  };

  const handleCreateStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudyName.trim()) return;

    try {
      const res = await fetch("/api/studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStudyName,
          moduleType: newStudyModule,
          role: newStudyRole ? newStudyRole : null,
          commune: newStudyCommune ? newStudyCommune : null
        })
      });

      if (res.ok) {
        const created = await res.json();
        setStudies((prev) => [created, ...prev]);
        setSelectedStudy(created);
        setShowNewModal(false);
        setNewStudyName("");
        setNewStudyRole("");
        setNewStudyCommune("");
        setCurrentPage("detalle-estudio");
      }
    } catch {
      setErrorBanner("Error al crear estudio.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedStudy || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setErrorBanner(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/studies/${selectedStudy.id}/documents`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const doc = await res.json();
        setDocuments((prev) => [doc, ...prev]);
      } else {
        const err = await res.json();
        setErrorBanner(err.error || "Fallo en la carga del documento.");
      }
    } catch {
      setErrorBanner("Error de conexión al cargar archivo.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRunAnalysis = async () => {
    if (!selectedStudy) return;
    setIsAnalyzing(true);
    setErrorBanner(null);

    try {
      const res = await fetch(`/api/studies/${selectedStudy.id}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId: "gemini-3.8-flash" })
      });

      if (res.ok) {
        const result = await res.json();
        setAnalysis(result);
      } else {
        const err = await res.json();
        setErrorBanner(err.error || "Error durante el análisis.");
      }
    } catch (err: unknown) {
      setErrorBanner(err instanceof Error ? err.message : "Error inesperado de ejecución.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case "inicio":
        return (
          <Dashboard
            studies={studies}
            documentsCount={documents.length}
            onOpenNewStudyModal={() => setShowNewModal(true)}
            onOpenDriveModal={() => setShowGoogleModal(true)}
            onSelectStudy={(study) => {
              setSelectedStudy(study);
              setCurrentPage("detalle-estudio");
            }}
            onNavigateToAudit={() => setCurrentPage("auditoria")}
          />
        );

      case "nuevo-estudio":
        return (
          <div className="max-w-xl mx-auto py-8">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-white">Crear Nuevo Expediente de Estudio</h2>
              <p className="text-xs text-slate-400">
                Ingrese los datos identificatorios de la propiedad. Los campos en blanco no contendrán valores ficticios.
              </p>
              <form onSubmit={handleCreateStudy} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nombre del Estudio *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Estudio Títulos Predio Santa Elena"
                    value={newStudyName}
                    onChange={(e) => setNewStudyName(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Módulo a Aplicar</label>
                  <select
                    value={newStudyModule}
                    onChange={(e) => setNewStudyModule(e.target.value as any)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="TITLE_STUDY">Estudio de Títulos de Inmuebles</option>
                    <option value="TOPOGRAPHIC_STUDY">Análisis Topográfico y Deslindes</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Rol de Avalúo (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej: 524-50"
                      value={newStudyRole}
                      onChange={(e) => setNewStudyRole(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Comuna (Opcional)</label>
                    <input
                      type="text"
                      placeholder="Ej: Buin"
                      value={newStudyCommune}
                      onChange={(e) => setNewStudyCommune(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30 transition"
                  >
                    Crear Estudio
                  </button>
                </div>
              </form>
            </div>
          </div>
        );

      case "mis-estudios":
        return (
          <div className="space-y-4 max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-white">Mis Estudios Registrados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studies.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setSelectedStudy(s);
                    setCurrentPage("detalle-estudio");
                  }}
                  className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{s.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      {s.moduleType}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono space-y-1">
                    <p>Rol: {s.role || "No consta"}</p>
                    <p>Comuna: {s.commune || "No consta"}</p>
                    <p>Creado: {new Date(s.createdAt).toLocaleDateString("es-CL")}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "expediente-documental":
      case "google-drive":
        return (
          <DocumentManager
            documents={documents}
            isUploading={isUploading}
            onUploadFile={handleFileUpload}
            onOpenDriveModal={() => setShowGoogleModal(true)}
            studyName={selectedStudy?.name}
          />
        );

      case "proveedores-ia":
      case "modelos":
        return <AIProvidersConfig />;

      case "integraciones-google":
        return (
          <div className="max-w-2xl mx-auto py-8">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-white">Integraciones Google Workspace</h2>
              <p className="text-xs text-slate-400">
                Configuración del conector Google Drive con alcance mínimo 'drive.file' para selección segura de documentos.
              </p>
              <button
                onClick={() => setShowGoogleModal(true)}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition"
              >
                Abrir Panel Google & Drive
              </button>
            </div>
          </div>
        );

      case "auditoria":
      case "procesamiento":
        return <AuditCenter auditBundle={auditBundle} />;

      case "detalle-estudio":
      case "hechos-evidencia":
      case "discrepancias":
        if (selectedStudy) {
          return (
            <StudyDetail
              study={selectedStudy}
              documents={documents}
              analysis={analysis}
              isAnalyzing={isAnalyzing}
              onBack={() => setCurrentPage("mis-estudios")}
              onRunAnalysis={handleRunAnalysis}
            />
          );
        }
        return <p className="text-xs text-slate-500">Seleccione un estudio para ver su detalle.</p>;

      default:
        return (
          <div className="p-12 text-center text-slate-400 text-xs">
            Sección en construcción bajo arquitectura modular.
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        studiesCount={studies.length}
        documentsCount={documents.length}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950">
        <Header
          pageTitle={currentPage}
          activeProvider="Google Gemini"
          activeModel="gemini-3.8-flash"
          isDriveConnected={isDriveConnected}
          onOpenGoogleModal={() => setShowGoogleModal(true)}
          onOpenSettings={() => setCurrentPage("proveedores-ia")}
        />

        {errorBanner && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 py-2.5 flex items-center gap-2 text-rose-400 text-xs shrink-0">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorBanner}</span>
          </div>
        )}

        <main className="flex-1 overflow-auto p-6">{renderContent()}</main>
      </div>

      {/* Google Integration & Drive Modal */}
      <GoogleIntegrationModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        isDriveConnected={isDriveConnected}
        onToggleDriveConnection={(conn) => setIsDriveConnected(conn)}
      />

      {/* New Study Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Nuevo Expediente de Estudio</h3>
            <p className="text-xs text-slate-400">
              Ingrese los antecedentes del caso. Cero precarga de datos ficticios.
            </p>

            <form onSubmit={handleCreateStudy} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre del Estudio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Estudio Títulos Predio Santa Elena"
                  value={newStudyName}
                  onChange={(e) => setNewStudyName(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Módulo a Aplicar</label>
                <select
                  value={newStudyModule}
                  onChange={(e) => setNewStudyModule(e.target.value as any)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  <option value="TITLE_STUDY">Estudio de Títulos de Inmuebles</option>
                  <option value="TOPOGRAPHIC_STUDY">Análisis Topográfico y Deslindes</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rol de Avalúo (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: 524-50"
                    value={newStudyRole}
                    onChange={(e) => setNewStudyRole(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Comuna (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: Buin"
                    value={newStudyCommune}
                    onChange={(e) => setNewStudyCommune(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30"
                >
                  Crear Estudio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
