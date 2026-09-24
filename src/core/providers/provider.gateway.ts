export type AIProviderType = "google-gemini" | "openai" | "openrouter" | "openai-compatible";

export interface ModelCapabilities {
  text: boolean;
  image: boolean;
  pdf: boolean;
  structuredOutput: boolean;
  reasoning: boolean;
  maxInputTokens?: number;
  maxOutputTokens?: number;
}

export interface ModelInfo {
  modelId: string;
  normalizedId: string;
  displayName: string;
  capabilities: ModelCapabilities;
  status: string;
}

export interface ConnectionResult {
  ok: boolean;
  provider: AIProviderType;
  selectedModel: string;
  latencyMs: number;
  message?: string;
}

export interface AIAnalysisRequest {
  modelId?: string;
  systemInstruction?: string;
  prompt: string;
  files?: Array<{
    mimeType: string;
    buffer: Buffer;
    fileName: string;
  }>;
  jsonSchema?: Record<string, unknown>;
}

export interface AIAnalysisResponse {
  provider: AIProviderType;
  model: string;
  text: string;
  parsedJson?: unknown;
  inputTokens?: number;
  outputTokens?: number;
  durationMs: number;
}

export interface AIProvider {
  type: AIProviderType;
  listModels(): Promise<ModelInfo[]>;
  getModelCapabilities(modelId: string): Promise<ModelCapabilities>;
  testConnection(modelId?: string): Promise<ConnectionResult>;
  analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse>;
}
