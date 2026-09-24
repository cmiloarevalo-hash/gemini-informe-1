import { GoogleGenAI } from "@google/genai";
import {
  AIProvider,
  AIProviderType,
  ModelInfo,
  ModelCapabilities,
  ConnectionResult,
  AIAnalysisRequest,
  AIAnalysisResponse
} from "./provider.gateway";

export class GeminiProvider implements AIProvider {
  public type: AIProviderType = "google-gemini";
  private defaultModel = "gemini-3.6-flash";
  private aiClient: GoogleGenAI | null = null;
  private apiKey: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || null;
    if (this.apiKey) {
      this.aiClient = new GoogleGenAI({
        apiKey: this.apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    }
  }

  /**
   * Normalizes model ID. Strictly preserves gemini-3.6-flash without silent aliasing.
   */
  public normalizeModel(modelId?: string): string {
    if (!modelId) return this.defaultModel;
    const trimmed = modelId.trim();

    // Exact preservation of official model IDs
    if (trimmed === "gemini-3.6-flash") return "gemini-3.6-flash";
    if (trimmed === "gemini-3.8-flash") return "gemini-3.8-flash";
    if (trimmed === "gemini-3.1-pro-preview") return "gemini-3.1-pro-preview";

    // Prohibit deprecated models strictly
    const prohibited = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-2.0-pro"];
    if (prohibited.some((p) => trimmed.includes(p))) {
      throw new Error(`[MODEL_ERROR] Prohibited deprecated model requested: '${trimmed}'. Use 'gemini-3.6-flash'.`);
    }

    return trimmed;
  }

  /**
   * Dynamically lists models using Google GenAI SDK.
   */
  public async listModels(): Promise<ModelInfo[]> {
    if (!this.aiClient) {
      return [
        {
          modelId: "gemini-3.6-flash",
          normalizedId: "gemini-3.6-flash",
          displayName: "Gemini 3.6 Flash (Oficial)",
          capabilities: {
            text: true,
            image: true,
            pdf: true,
            structuredOutput: true,
            reasoning: true,
            maxInputTokens: 1048576,
            maxOutputTokens: 8192
          },
          status: "ACTIVE"
        }
      ];
    }

    try {
      const list = await this.aiClient.models.list();
      const models: ModelInfo[] = [];

      for await (const m of list) {
        if (m.name && m.name.includes("gemini")) {
          const id = m.name.replace(/^models\//, "");
          // Exclude deprecated models
          if (!id.includes("1.5") && !id.includes("2.0")) {
            models.push({
              modelId: id,
              normalizedId: id,
              displayName: m.displayName || id,
              capabilities: {
                text: true,
                image: true,
                pdf: true,
                structuredOutput: true,
                reasoning: true,
                maxInputTokens: 1048576,
                maxOutputTokens: 8192
              },
              status: id === "gemini-3.6-flash" ? "ACTIVE" : "AVAILABLE"
            });
          }
        }
      }

      // Ensure gemini-3.6-flash is present and at the top
      const has36 = models.some((m) => m.modelId === "gemini-3.6-flash");
      if (!has36) {
        models.unshift({
          modelId: "gemini-3.6-flash",
          normalizedId: "gemini-3.6-flash",
          displayName: "Gemini 3.6 Flash (Oficial)",
          capabilities: {
            text: true,
            image: true,
            pdf: true,
            structuredOutput: true,
            reasoning: true,
            maxInputTokens: 1048576,
            maxOutputTokens: 8192
          },
          status: "ACTIVE"
        });
      } else {
        models.sort((a, b) => (a.modelId === "gemini-3.6-flash" ? -1 : b.modelId === "gemini-3.6-flash" ? 1 : 0));
      }

      return models;
    } catch {
      // Fallback only if list fails
      return [
        {
          modelId: "gemini-3.6-flash",
          normalizedId: "gemini-3.6-flash",
          displayName: "Gemini 3.6 Flash",
          capabilities: {
            text: true,
            image: true,
            pdf: true,
            structuredOutput: true,
            reasoning: true,
            maxInputTokens: 1048576,
            maxOutputTokens: 8192
          },
          status: "ACTIVE"
        }
      ];
    }
  }

  public async getModelCapabilities(modelId: string): Promise<ModelCapabilities> {
    return {
      text: true,
      image: true,
      pdf: true,
      structuredOutput: true,
      reasoning: true,
      maxInputTokens: 1048576,
      maxOutputTokens: 8192
    };
  }

  public async testConnection(modelId?: string): Promise<ConnectionResult> {
    const start = Date.now();
    const effectiveModel = this.normalizeModel(modelId);

    if (!this.apiKey) {
      return {
        ok: false,
        provider: "google-gemini",
        selectedModel: effectiveModel,
        latencyMs: Date.now() - start,
        message: "Clave de API no configurada para este proveedor."
      };
    }

    try {
      if (!this.aiClient) {
        this.aiClient = new GoogleGenAI({
          apiKey: this.apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build"
            }
          }
        });
      }

      const response = await this.aiClient.models.generateContent({
        model: effectiveModel,
        contents: "Responde únicamente con la palabra: CONECTADO"
      });

      const text = response.text || "";
      const ok = text.includes("CONECTADO") || text.length > 0;

      return {
        ok,
        provider: "google-gemini",
        selectedModel: effectiveModel,
        latencyMs: Date.now() - start,
        message: ok ? `Conexión verificada con ${effectiveModel}` : "Respuesta inesperada del modelo"
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        ok: false,
        provider: "google-gemini",
        selectedModel: effectiveModel,
        latencyMs: Date.now() - start,
        message: `Error de proveedor: ${msg}`
      };
    }
  }

  public async analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const start = Date.now();
    const effectiveModel = this.normalizeModel(request.modelId);

    if (!this.apiKey) {
      throw new Error(
        "[PROVIDER_AUTH_ERROR] Falta clave de API configurada para Gemini. No se puede ejecutar el análisis documental."
      );
    }

    if (!this.aiClient) {
      this.aiClient = new GoogleGenAI({
        apiKey: this.apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    }

    const parts: Array<
      | { text: string }
      | { inlineData: { mimeType: string; data: string } }
    > = [];

    // Inject real files into model parts as inlineData
    if (request.files && request.files.length > 0) {
      for (const file of request.files) {
        parts.push({
          inlineData: {
            mimeType: file.mimeType,
            data: file.buffer.toString("base64")
          }
        });
      }
    }

    // Add main prompt text
    parts.push({ text: request.prompt });

    try {
      const config: Record<string, unknown> = {
        temperature: 0.1
      };

      if (request.systemInstruction) {
        config.systemInstruction = request.systemInstruction;
      }

      if (request.jsonSchema) {
        config.responseMimeType = "application/json";
      }

      const response = await this.aiClient.models.generateContent({
        model: effectiveModel,
        contents: { parts },
        config
      });

      const text = response.text || "";
      let parsedJson: unknown = undefined;

      if (request.jsonSchema || text.trim().startsWith("{") || text.trim().startsWith("[")) {
        try {
          const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
          parsedJson = JSON.parse(cleaned);
        } catch {
          // Keep raw text
        }
      }

      return {
        provider: "google-gemini",
        model: effectiveModel,
        text,
        parsedJson,
        durationMs: Date.now() - start
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      throw new Error(
        `[PROVIDER_RESPONSE_ERROR] Fallo en ejecución del modelo '${effectiveModel}': ${errorMsg}`
      );
    }
  }
}
