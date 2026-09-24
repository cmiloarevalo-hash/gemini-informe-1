# Protocolo de Proveedores de Inteligencia Artificial

## 1. Abstracción del Provider Gateway
Todo proveedor implementa la interfaz universal:
```typescript
interface AIProvider {
  type: "google-gemini" | "openai" | "openrouter";
  listModels(): Promise<ModelInfo[]>;
  getModelCapabilities(modelId: string): Promise<ModelCapabilities>;
  testConnection(): Promise<ConnectionResult>;
  analyze(request: AIAnalysisRequest): Promise<AIAnalysisResponse>;
}
```

## 2. Inicialización y Políticas de Seguridad
- Inicialización en servidor con `User-Agent: 'aistudio-build'` en `httpOptions`.
- Modelo primario: `gemini-3.8-flash` y soporte para `gemini-3.6-flash`.
- Prohibición estricta de modelos obsoletos (`gemini-1.5-*`, `gemini-2.0-*`).
- Si la llamada a la API falla o la clave es inválida, se devuelve un objeto estructurado de error (`PROVIDER_ERROR`); nunca se genera un estudio simulado ni datos sustitutivos.
