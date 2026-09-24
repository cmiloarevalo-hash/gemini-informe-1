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

export const RETRYABLE_HTTP_STATUSES = [408, 429, 500, 502, 503, 504] as const;
export const NON_RETRYABLE_HTTP_STATUSES = [400, 401, 403, 404, 422] as const;

export interface StructuredProviderError {
  code: string;
  provider: string;
  modelId: string;
  retryable: boolean;
  attempts: number;
  status?: number;
  message: string;
}

export class GeminiProviderError extends Error implements StructuredProviderError {
  public readonly code: string;
  public readonly provider: string;
  public readonly modelId: string;
  public readonly retryable: boolean;
  public readonly attempts: number;
  public readonly status?: number;

  constructor(options: {
    code: string;
    message: string;
    provider?: string;
    modelId: string;
    retryable: boolean;
    attempts: number;
    status?: number;
  }) {
    super(options.message);
    this.name = "GeminiProviderError";
    this.code = options.code;
    this.provider = options.provider || "google-gemini";
    this.modelId = options.modelId;
    this.retryable = options.retryable;
    this.attempts = options.attempts;
    this.status = options.status;
    Object.setPrototypeOf(this, GeminiProviderError.prototype);
  }

  public toJSON(): StructuredProviderError {
    return {
      code: this.code,
      provider: this.provider,
      modelId: this.modelId,
      retryable: this.retryable,
      attempts: this.attempts,
      status: this.status,
      message: this.message
    };
  }
}

/**
 * Sanitizes messages to prevent accidental leakage of credentials or sensitive tokens.
 */
export function sanitizeLogMessage(message: string): string {
  if (!message) return "";
  return message
    .replace(/AIza[0-9A-Za-z-_]{35}/g, "[REDACTED_API_KEY]")
    .replace(/ghp_[0-9A-Za-z]{36}/g, "[REDACTED_GH_TOKEN]")
    .replace(/key=[^&\s]+/gi, "key=[REDACTED]")
    .replace(/apiKey=[^&\s]+/gi, "apiKey=[REDACTED]")
    .replace(/bearer\s+[a-zA-Z0-9._-]+/gi, "Bearer [REDACTED]")
    .replace(/token=[^&\s]+/gi, "token=[REDACTED]");
}

/**
 * Extracts numeric HTTP or gRPC-equivalent status code from various error shapes.
 */
export function extractStatusCode(err: unknown): number | null {
  if (!err) return null;
  if (typeof err === "object") {
    const e = err as Record<string, any>;
    if (typeof e.status === "number") return e.status;
    if (typeof e.statusCode === "number") return e.statusCode;
    if (e.response && typeof e.response.status === "number") return e.response.status;
    if (e.cause && typeof (e.cause as any).status === "number") return (e.cause as any).status;
    if (typeof e.status === "string") {
      const num = Number(e.status);
      if (!isNaN(num) && num > 0) return num;
      if (e.status === "UNAVAILABLE") return 503;
      if (e.status === "RESOURCE_EXHAUSTED") return 429;
      if (e.status === "DEADLINE_EXCEEDED") return 504;
      if (e.status === "INVALID_ARGUMENT") return 400;
      if (e.status === "PERMISSION_DENIED") return 403;
      if (e.status === "UNAUTHENTICATED") return 401;
      if (e.status === "NOT_FOUND") return 404;
    }
    if (typeof e.statusCode === "string") {
      const num = Number(e.statusCode);
      if (!isNaN(num) && num > 0) return num;
    }
  }
  const msg = err instanceof Error ? err.message : String(err);
  const match = msg.match(/\b(400|401|403|404|408|422|429|500|502|503|504)\b/);
  if (match) {
    return parseInt(match[1], 10);
  }
  if (/UNAVAILABLE/i.test(msg)) return 503;
  if (/RESOURCE_EXHAUSTED/i.test(msg)) return 429;
  if (/DEADLINE_EXCEEDED/i.test(msg)) return 504;
  return null;
}

/**
 * Determines whether an error is retryable according to the provider policy:
 * RETRYABLE: 408, 429, 500, 502, 503, 504
 * NON-RETRYABLE: 400, 401, 403, 404, 422 and other client non-transient errors.
 */
export function isRetryableStatus(status: number | null, err?: unknown): boolean {
  if (status !== null) {
    if ((NON_RETRYABLE_HTTP_STATUSES as readonly number[]).includes(status)) {
      return false;
    }
    if ((RETRYABLE_HTTP_STATUSES as readonly number[]).includes(status)) {
      return true;
    }
    if (status >= 400 && status < 500) {
      return false;
    }
    if (status >= 500 && status < 600) {
      return true;
    }
  }

  if (err) {
    const msg = (err instanceof Error ? err.message : String(err)).toUpperCase();
    if (
      msg.includes("UNAVAILABLE") ||
      msg.includes("RESOURCE_EXHAUSTED") ||
      msg.includes("DEADLINE_EXCEEDED") ||
      msg.includes("HIGH DEMAND") ||
      msg.includes("ECONNRESET") ||
      msg.includes("ETIMEDOUT")
    ) {
      return true;
    }
    if (
      msg.includes("INVALID_ARGUMENT") ||
      msg.includes("PERMISSION_DENIED") ||
      msg.includes("UNAUTHENTICATED") ||
      msg.includes("NOT_FOUND")
    ) {
      return false;
    }
  }

  return false;
}

export interface GeminiRetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  jitterMs?: number;
  sleepFn?: (ms: number) => Promise<void>;
}

export class GeminiProvider implements AIProvider {
  public type: AIProviderType = "google-gemini";
  private defaultModel = "gemini-3.6-flash";
  private aiClient: GoogleGenAI | null = null;
  private apiKey: string | null = null;
  private retryOptions: Required<GeminiRetryOptions>;

  constructor(apiKey?: string, retryOptions?: GeminiRetryOptions, client?: GoogleGenAI) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || null;
    this.retryOptions = {
      maxAttempts: retryOptions?.maxAttempts ?? 4,
      baseDelayMs: retryOptions?.baseDelayMs ?? 1000,
      jitterMs: retryOptions?.jitterMs ?? 250,
      sleepFn: retryOptions?.sleepFn ?? ((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)))
    };

    if (client) {
      this.aiClient = client;
    } else if (this.apiKey) {
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

  public setClient(client: GoogleGenAI | any): void {
    this.aiClient = client;
  }

  public setRetryOptions(options: Partial<GeminiRetryOptions>): void {
    this.retryOptions = {
      ...this.retryOptions,
      ...options
    };
  }

  public getRetryOptions(): Required<GeminiRetryOptions> {
    return { ...this.retryOptions };
  }

  public calculateBackoffDelay(retryIndex: number): number {
    const factor = Math.pow(2, retryIndex);
    const jitter = this.retryOptions.jitterMs > 0 ? Math.floor(Math.random() * this.retryOptions.jitterMs) : 0;
    return this.retryOptions.baseDelayMs * factor + jitter;
  }

  /**
   * Executes an operation with controlled retry for transient errors.
   */
  public async executeWithRetry<T>(
    operation: (attempt: number) => Promise<T>,
    modelId: string
  ): Promise<T> {
    const maxAttempts = this.retryOptions.maxAttempts;
    let lastError: unknown = null;
    let lastStatus: number | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation(attempt);
      } catch (err: unknown) {
        lastError = err;
        lastStatus = extractStatusCode(err);
        const retryable = isRetryableStatus(lastStatus, err);

        // Non-retryable error (e.g. 400, 401, 403, 404, 422) -> fail immediately
        if (!retryable) {
          const safeMsg = sanitizeLogMessage(err instanceof Error ? err.message : String(err));
          throw new GeminiProviderError({
            code: lastStatus === 401 || lastStatus === 403 ? "PROVIDER_AUTH_ERROR" : "PROVIDER_CLIENT_ERROR",
            provider: "google-gemini",
            modelId,
            retryable: false,
            attempts: attempt,
            status: lastStatus ?? undefined,
            message: `[PROVIDER_RESPONSE_ERROR] Fallo en ejecución del modelo '${modelId}': ${safeMsg}`
          });
        }

        // Exhausted attempts -> break to throw structured error
        if (attempt >= maxAttempts) {
          break;
        }

        // Backoff: retry 1 (index 0) ~1s+jitter, retry 2 ~2s+jitter, retry 3 ~4s+jitter
        const delayMs = this.calculateBackoffDelay(attempt - 1);
        const safeMsg = sanitizeLogMessage(err instanceof Error ? err.message : String(err));

        console.warn(
          `[GeminiProvider] Intento ${attempt}/${maxAttempts} para modelo '${modelId}' falló (HTTP ${lastStatus ?? "transient"}). Reintentando en ${delayMs}ms... Motivo: ${safeMsg}`
        );

        await this.retryOptions.sleepFn(delayMs);
      }
    }

    // All retry attempts exhausted
    const safeErrorMsg = sanitizeLogMessage(lastError instanceof Error ? lastError.message : String(lastError));

    if (lastStatus === 503 || (lastError && String(lastError).includes("UNAVAILABLE"))) {
      throw new GeminiProviderError({
        code: "PROVIDER_TEMPORARILY_UNAVAILABLE",
        provider: "google-gemini",
        modelId,
        retryable: true,
        attempts: maxAttempts,
        status: 503,
        message: `[PROVIDER_TEMPORARILY_UNAVAILABLE] Fallo en ejecución del modelo '${modelId}' tras ${maxAttempts} intentos: El servicio no está disponible temporalmente (HTTP 503). ${safeErrorMsg}`
      });
    }

    if (lastStatus === 429 || (lastError && String(lastError).includes("RESOURCE_EXHAUSTED"))) {
      throw new GeminiProviderError({
        code: "PROVIDER_RATE_LIMITED",
        provider: "google-gemini",
        modelId,
        retryable: true,
        attempts: maxAttempts,
        status: 429,
        message: `[PROVIDER_RESPONSE_ERROR] Fallo en ejecución del modelo '${modelId}' tras ${maxAttempts} intentos: Límite de tasa excedido (HTTP 429). ${safeErrorMsg}`
      });
    }

    throw new GeminiProviderError({
      code: lastStatus === 408 || lastStatus === 504 ? "PROVIDER_TIMEOUT" : "PROVIDER_TEMPORARILY_UNAVAILABLE",
      provider: "google-gemini",
      modelId,
      retryable: true,
      attempts: maxAttempts,
      status: lastStatus ?? undefined,
      message: `[PROVIDER_RESPONSE_ERROR] Fallo en ejecución del modelo '${modelId}' tras ${maxAttempts} intentos: Error de proveedor (${lastStatus ?? "transient"}). ${safeErrorMsg}`
    });
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

    if (!this.apiKey && !this.aiClient) {
      return {
        ok: false,
        provider: "google-gemini",
        selectedModel: effectiveModel,
        latencyMs: Date.now() - start,
        message: "Clave de API no configurada para este proveedor."
      };
    }

    try {
      if (!this.aiClient && this.apiKey) {
        this.aiClient = new GoogleGenAI({
          apiKey: this.apiKey,
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build"
            }
          }
        });
      }

      const response = await this.executeWithRetry(
        async () => {
          return await this.aiClient!.models.generateContent({
            model: effectiveModel,
            contents: "Responde únicamente con la palabra: CONECTADO"
          });
        },
        effectiveModel
      );

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
      const msg = sanitizeLogMessage(err instanceof Error ? err.message : String(err));
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

    if (!this.apiKey && !this.aiClient) {
      throw new GeminiProviderError({
        code: "PROVIDER_AUTH_ERROR",
        provider: "google-gemini",
        modelId: effectiveModel,
        retryable: false,
        attempts: 0,
        message:
          "[PROVIDER_AUTH_ERROR] Falta clave de API configurada para Gemini. No se puede ejecutar el análisis documental."
      });
    }

    if (!this.aiClient && this.apiKey) {
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

    const config: Record<string, unknown> = {
      temperature: 0.1
    };

    if (request.systemInstruction) {
      config.systemInstruction = request.systemInstruction;
    }

    if (request.jsonSchema) {
      config.responseMimeType = "application/json";
    }

    const response = await this.executeWithRetry(
      async () => {
        return await this.aiClient!.models.generateContent({
          model: effectiveModel,
          contents: { parts },
          config
        });
      },
      effectiveModel
    );

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
  }
}
