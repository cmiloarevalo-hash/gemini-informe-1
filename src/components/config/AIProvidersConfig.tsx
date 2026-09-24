import React, { useState, useEffect } from "react";
import {
  Cpu,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  Play,
  Key,
  Layers,
  Lock,
  X,
  Clock,
  Server
} from "lucide-react";

export interface PublicCredential {
  id: string;
  provider: "google-gemini" | "openai" | "openrouter" | "openai-compatible";
  alias: string;
  maskedKey: string;
  baseUrl?: string;
  defaultModel: string;
  availableModels: string[];
  status: "VERIFIED" | "IMPLEMENTED_UNVERIFIED" | "ARCHITECTURE_READY" | "BLOCKED";
  lastTestedAt?: string;
  testLatencyMs?: number;
  testMessage?: string;
}

export const AIProvidersConfig: React.FC = () => {
  const [credentials, setCredentials] = useState<PublicCredential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [refreshingModelsId, setRefreshingModelsId] = useState<string | null>(null);

  // Form State
  const [formProvider, setFormProvider] = useState<"google-gemini" | "openai" | "openrouter" | "openai-compatible">("google-gemini");
  const [formAlias, setFormAlias] = useState("");
  const [formApiKey, setFormApiKey] = useState("");
  const [formBaseUrl, setFormBaseUrl] = useState("");
  const [formDefaultModel, setFormDefaultModel] = useState("gemini-3.6-flash");
  const [formError, setFormError] = useState<string | null>(null);
  const [formIsSubmitting, setFormIsSubmitting] = useState(false);

  const fetchCredentials = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/providers");
      if (res.ok) {
        const data = await res.json();
        setCredentials(data);
      }
    } catch (e) {
      console.error("Error fetching credentials:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleOpenModal = () => {
    setFormProvider("google-gemini");
    setFormAlias("");
    setFormApiKey("");
    setFormBaseUrl("");
    setFormDefaultModel("gemini-3.6-flash");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleProviderChange = (p: typeof formProvider) => {
    setFormProvider(p);
    if (p === "google-gemini") {
      setFormDefaultModel("gemini-3.6-flash");
    } else if (p === "openai") {
      setFormDefaultModel("gpt-4o");
    } else if (p === "openrouter") {
      setFormDefaultModel("anthropic/claude-3.5-sonnet");
    } else {
      setFormDefaultModel("llama-3.3-70b-instruct");
    }
  };

  const handleSaveCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAlias.trim()) {
      setFormError("El alias de la credencial es requerido.");
      return;
    }
    if (!formApiKey.trim()) {
      setFormError("La clave de API es requerida.");
      return;
    }

    setFormIsSubmitting(true);
    setFormError(null);

    try {
      const res = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: formProvider,
          alias: formAlias.trim(),
          apiKey: formApiKey.trim(),
          baseUrl: formBaseUrl.trim() || undefined,
          defaultModel: formDefaultModel.trim() || undefined
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Fallo al guardar credencial");
      }

      setIsModalOpen(false);
      await fetchCredentials();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setFormError(msg);
    } finally {
      setFormIsSubmitting(false);
    }
  };

  const handleDeleteCredential = async (id: string) => {
    if (!confirm("¿Desea eliminar esta configuración de proveedor?")) return;
    try {
      const res = await fetch(`/api/providers/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCredentials((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (e) {
      console.error("Error deleting credential:", e);
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      const res = await fetch(`/api/providers/${id}/test`, { method: "POST" });
      const result = await res.json();
      setCredentials((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                status: result.ok ? "VERIFIED" : "BLOCKED",
                lastTestedAt: new Date().toISOString(),
                testLatencyMs: result.latencyMs,
                testMessage: result.message
              }
            : c
        )
      );
    } catch (e) {
      console.error("Error testing connection:", e);
    } finally {
      setTestingId(null);
    }
  };

  const handleRefreshModels = async (id: string) => {
    setRefreshingModelsId(id);
    try {
      const res = await fetch(`/api/providers/${id}/models`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        const modelIds = data.models ? data.models.map((m: any) => m.modelId) : [];
        setCredentials((prev) =>
          prev.map((c) =>
            c.id === id
              ? {
                  ...c,
                  availableModels: modelIds
                }
              : c
          )
        );
      }
    } catch (e) {
      console.error("Error refreshing models:", e);
    } finally {
      setRefreshingModelsId(null);
    }
  };

  const getStatusBadge = (status: PublicCredential["status"]) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            VERIFIED
          </span>
        );
      case "IMPLEMENTED_UNVERIFIED":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono font-bold">
            IMPLEMENTED_UNVERIFIED
          </span>
        );
      case "ARCHITECTURE_READY":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono font-bold">
            ARCHITECTURE_READY
          </span>
        );
      case "BLOCKED":
        return (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono font-bold flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            BLOCKED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Proveedores de Inteligencia Artificial</h2>
          <p className="text-xs text-slate-400">
            Administración de credenciales de inferencia con almacenamiento seguro en memoria (IN_MEMORY_CREDENTIAL_STORE).
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>+ Agregar API</span>
        </button>
      </div>

      {/* Security Architecture Notice */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold">
          <Lock className="h-4 w-4" />
          <span>Seguridad y Cero Exposición de API Keys</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Las claves de API se transmiten mediante canal cifrado directamente al servidor y se mantienen únicamente en
          memoria durante el ciclo de vida del proceso (<code className="text-indigo-300 font-mono">IN_MEMORY_CREDENTIAL_STORE</code>).
          Ninguna clave se persiste en localStorage, sessionStorage ni se expone al navegador.
        </p>
      </div>

      {/* Credentials List */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 text-xs">Cargando proveedores configurados...</div>
      ) : credentials.length === 0 ? (
        /* Task 4: Con cero credenciales mostrar mensaje */
        <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/40 space-y-3">
          <Cpu className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No hay proveedores configurados.</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Agrega tu clave de API de Google Gemini para habilitar el análisis de documentos y extracción fáctica.
          </p>
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition mt-2"
          >
            <Plus className="h-4 w-4" />
            <span>+ Agregar API</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {credentials.map((cred) => (
            <div
              key={cred.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700/80 transition space-y-4 shadow-sm"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{cred.alias}</h3>
                    {getStatusBadge(cred.status)}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5 capitalize">
                    {cred.provider.replace("-", " ")}
                  </p>
                </div>

                <button
                  onClick={() => handleDeleteCredential(cred.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                  title="Eliminar credencial"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-[10px] text-slate-500 block">Clave Protegida:</span>
                  <span className="text-slate-300 font-semibold">{cred.maskedKey}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Modelo Predeterminado:</span>
                  <span className="text-indigo-400 font-semibold">{cred.defaultModel}</span>
                </div>
                {cred.baseUrl && (
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-500 block">Base URL:</span>
                    <span className="text-slate-400 truncate block">{cred.baseUrl}</span>
                  </div>
                )}
              </div>

              {/* Models discovery list */}
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                  <span className="flex items-center gap-1 font-medium">
                    <Layers className="h-3 w-3 text-indigo-400" />
                    Modelos Detectados ({cred.availableModels?.length || 0})
                  </span>
                  <button
                    onClick={() => handleRefreshModels(cred.id)}
                    disabled={refreshingModelsId === cred.id}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                    title="Actualizar modelos reales consultando a la API"
                  >
                    <RefreshCw className={`h-2.5 w-2.5 ${refreshingModelsId === cred.id ? "animate-spin" : ""}`} />
                    <span>Actualizar modelos</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1">
                  {cred.availableModels && cred.availableModels.length > 0 ? (
                    cred.availableModels.slice(0, 4).map((m) => (
                      <span
                        key={m}
                        className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300 border border-slate-700/60"
                      >
                        {m}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-500 italic">No hay modelos descubiertos aún</span>
                  )}
                  {cred.availableModels && cred.availableModels.length > 4 && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-800/50 text-[10px] font-mono text-slate-500">
                      +{cred.availableModels.length - 4} más
                    </span>
                  )}
                </div>
              </div>

              {/* Test Message / Latency */}
              {cred.testMessage && (
                <p className="text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
                  {cred.testMessage}
                  {cred.testLatencyMs !== undefined && (
                    <span className="text-slate-500 ml-1.5 font-mono">({cred.testLatencyMs} ms)</span>
                  )}
                </p>
              )}

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  {cred.lastTestedAt
                    ? `Verificado: ${new Date(cred.lastTestedAt).toLocaleTimeString("es-CL")}`
                    : "No verificado"}
                </span>

                <button
                  onClick={() => handleTestConnection(cred.id)}
                  disabled={testingId === cred.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                >
                  <Play className={`h-3 w-3 fill-slate-300 ${testingId === cred.id ? "animate-pulse" : ""}`} />
                  <span>{testingId === cred.id ? "Probando..." : "Probar conexión"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Agregar API (Task 4) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Agregar Proveedor de IA</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveCredential} className="space-y-4 text-xs">
              {/* Proveedor */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">Proveedor:</label>
                <select
                  value={formProvider}
                  onChange={(e) => handleProviderChange(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="google-gemini">Google Gemini (Recomendado / Nativo)</option>
                  <option value="openai">OpenAI (Architecture Ready)</option>
                  <option value="openrouter">OpenRouter (Architecture Ready)</option>
                  <option value="openai-compatible">OpenAI-compatible (vLLM / Ollama)</option>
                </select>
              </div>

              {/* Alias */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">Alias:</label>
                <input
                  type="text"
                  placeholder="ej. Gemini 3.6 Producción"
                  value={formAlias}
                  onChange={(e) => setFormAlias(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* API Key */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">API Key:</label>
                <input
                  type="password"
                  placeholder="••••••••••••••••••••••••••••••••"
                  value={formApiKey}
                  onChange={(e) => setFormApiKey(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  required
                />
                <span className="text-[10px] text-slate-500 block">
                  Se resguardará exclusivamente en memoria del servidor.
                </span>
              </div>

              {/* Base URL (when applicable) */}
              {(formProvider === "openrouter" || formProvider === "openai-compatible") && (
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold block">Base URL:</label>
                  <input
                    type="url"
                    placeholder="https://api.openrouter.ai/v1 o http://localhost:11434/v1"
                    value={formBaseUrl}
                    onChange={(e) => setFormBaseUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              {/* Modelo predeterminado */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold block">Modelo Predeterminado:</label>
                <input
                  type="text"
                  value={formDefaultModel}
                  onChange={(e) => setFormDefaultModel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Botones: [ Guardar ] [ Cancelar ] */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formIsSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition shadow-md shadow-indigo-600/30"
                >
                  {formIsSubmitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
