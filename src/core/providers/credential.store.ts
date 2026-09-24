import { AIProviderType, ModelInfo } from "./provider.gateway";
import { GeminiProvider } from "./gemini.provider";

export interface ServerCredential {
  id: string;
  provider: AIProviderType;
  alias: string;
  apiKey: string;
  baseUrl?: string;
  defaultModel: string;
  availableModels: string[];
  status: "VERIFIED" | "IMPLEMENTED_UNVERIFIED" | "ARCHITECTURE_READY" | "BLOCKED";
  lastTestedAt?: string;
  testLatencyMs?: number;
  testMessage?: string;
  createdAt: string;
}

export interface PublicCredential {
  id: string;
  provider: AIProviderType;
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

export class CredentialStore {
  // Stored strictly in-memory on the server (IN_MEMORY_CREDENTIAL_STORE)
  private static credentials: Map<string, ServerCredential> = new Map();

  static {
    // Seed default Google Gemini from server environment if available
    const envGeminiKey = process.env.GEMINI_API_KEY;
    if (envGeminiKey) {
      const id = "cred-gemini-env";
      this.credentials.set(id, {
        id,
        provider: "google-gemini",
        alias: "Google Gemini (Entorno AI Studio)",
        apiKey: envGeminiKey,
        defaultModel: "gemini-3.6-flash",
        availableModels: ["gemini-3.6-flash", "gemini-3.8-flash", "gemini-3.1-pro-preview"],
        status: "VERIFIED",
        lastTestedAt: new Date().toISOString(),
        testMessage: "Credencial oficial provista por el entorno.",
        createdAt: new Date().toISOString()
      });
    }
  }

  public static listCredentials(): PublicCredential[] {
    return Array.from(this.credentials.values()).map((c) => this.toPublic(c));
  }

  public static getCredential(id: string): ServerCredential | undefined {
    return this.credentials.get(id);
  }

  public static addCredential(data: {
    provider: AIProviderType;
    alias: string;
    apiKey: string;
    baseUrl?: string;
    defaultModel?: string;
  }): PublicCredential {
    if (!data.alias || !data.alias.trim()) {
      throw new Error("El alias de la credencial es obligatorio.");
    }
    if (!data.apiKey || !data.apiKey.trim()) {
      throw new Error("La clave de API es obligatoria.");
    }

    const id = `cred-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const defaultModel =
      data.defaultModel ||
      (data.provider === "google-gemini"
        ? "gemini-3.6-flash"
        : data.provider === "openai"
        ? "gpt-4o"
        : data.provider === "openrouter"
        ? "anthropic/claude-3.5-sonnet"
        : "llama-3.3-70b-instruct");

    const status = data.provider === "google-gemini" ? "IMPLEMENTED_UNVERIFIED" : "ARCHITECTURE_READY";

    const record: ServerCredential = {
      id,
      provider: data.provider,
      alias: data.alias.trim(),
      apiKey: data.apiKey.trim(),
      baseUrl: data.baseUrl ? data.baseUrl.trim() : undefined,
      defaultModel,
      availableModels: [defaultModel],
      status,
      createdAt: new Date().toISOString()
    };

    this.credentials.set(id, record);
    return this.toPublic(record);
  }

  public static deleteCredential(id: string): boolean {
    return this.credentials.delete(id);
  }

  public static updateTestResult(
    id: string,
    result: { ok: boolean; latencyMs: number; message?: string; selectedModel?: string }
  ): PublicCredential | undefined {
    const cred = this.credentials.get(id);
    if (!cred) return undefined;

    cred.status = result.ok ? "VERIFIED" : "BLOCKED";
    cred.lastTestedAt = new Date().toISOString();
    cred.testLatencyMs = result.latencyMs;
    cred.testMessage = result.message;
    if (result.selectedModel) {
      cred.defaultModel = result.selectedModel;
    }

    return this.toPublic(cred);
  }

  public static updateAvailableModels(id: string, models: string[]): PublicCredential | undefined {
    const cred = this.credentials.get(id);
    if (!cred) return undefined;
    cred.availableModels = models;
    return this.toPublic(cred);
  }

  public static toPublic(c: ServerCredential): PublicCredential {
    const key = c.apiKey;
    const maskedKey =
      key.length > 8 ? `${key.slice(0, 3)}••••••••${key.slice(-4)}` : "••••••••";

    return {
      id: c.id,
      provider: c.provider,
      alias: c.alias,
      maskedKey,
      baseUrl: c.baseUrl,
      defaultModel: c.defaultModel,
      availableModels: c.availableModels,
      status: c.status,
      lastTestedAt: c.lastTestedAt,
      testLatencyMs: c.testLatencyMs,
      testMessage: c.testMessage
    };
  }
}
