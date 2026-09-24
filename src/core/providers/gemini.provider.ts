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
  private defaultModel = "gemini-3.8-flash";
  private aiClient: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
    }
  }

  public normalizeModel(modelId?: string): string {
    if (!modelId) return this.defaultModel;
    // Map certification alias gemini-3.6-flash to gemini-3.8-flash or vice versa
    if (modelId === "gemini-3.6-flash") return "gemini-3.8-flash";
    if (modelId === "gemini-flash" || modelId === "flash") return "gemini-3.8-flash";
    if (modelId === "gemini-pro" || modelId === "pro") return "gemini-3.1-pro-preview";

    // Prohibit deprecated models strictly
    const prohibited = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash", "gemini-2.0-pro"];
    if (prohibited.some((p) => modelId.includes(p))) {
      throw new Error(`[MODEL_ERROR] Prohibited deprecated model requested: '${modelId}'. Use 'gemini-3.8-flash'.`);
    }

    return modelId;
  }

  public async listModels(): Promise<ModelInfo[]> {
    return [
      {
        modelId: "gemini-3.8-flash",
        normalizedId: "gemini-3.8-flash",
        displayName: "Gemini 3.8 Flash (Vigente / Oficial)",
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
      },
      {
        modelId: "gemini-3.6-flash",
        normalizedId: "gemini-3.8-flash",
        displayName: "Gemini 3.6 Flash (Certificado)",
        capabilities: {
          text: true,
          image: true,
          pdf: true,
          structuredOutput: true,
          reasoning: true,
          maxInputTokens: 1048576,
          maxOutputTokens: 8192
        },
        status: "SUPPORTED_ALIAS"
      },
      {
        modelId: "gemini-3.1-pro-preview",
        normalizedId: "gemini-3.1-pro-preview",
        displayName: "Gemini 3.1 Pro Preview (Razonamiento Complejo)",
        capabilities: {
          text: true,
          image: true,
          pdf: true,
          structuredOutput: true,
          reasoning: true,
          maxInputTokens: 2097152,
          maxOutputTokens: 8192
        },
        status: "ACTIVE"
      }
    ];
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

    if (!process.env.GEMINI_API_KEY) {
      return {
        ok: false,
        provider: "google-gemini",
        selectedModel: effectiveModel,
        latencyMs: Date.now() - start,
        message: "GEMINI_API_KEY no encontrada en las variables de entorno del servidor."
      };
    }

    try {
      if (!this.aiClient) {
        this.aiClient = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
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
        message: ok ? "Conexión exitosa verificada" : "Respuesta inesperada del modelo"
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

    if (!process.env.GEMINI_API_KEY) {
      throw new Error(
        "[PROVIDER_AUTH_ERROR] Falta GEMINI_API_KEY en el entorno del servidor. No se puede ejecutar el análisis documental."
      );
    }

    if (!this.aiClient) {
      this.aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
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
        temperature: 0.1 // High precision for legal-technical extraction
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
          // Clean possible markdown code fence
          const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
          parsedJson = JSON.parse(cleaned);
        } catch {
          // If JSON parsing fails, we keep raw text and let semantic validator handle it
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
