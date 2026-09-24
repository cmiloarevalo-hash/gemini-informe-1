# Registro de Incidentes y Defectos Críticos (Incident Log)

| Incidente ID | Fecha | Componente | Severidad | Descripción | Causa Raíz | Mitigación Implementada | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **INC-001** | 2026-09-23 | Deprecated Models | ALTA | El SDK y documentación antigua mencionaban `gemini-1.5-flash` o `gemini-2.0-flash`. | Cambios de ciclo de vida de Google AI Studio. | Actualización estricta a `gemini-3.8-flash` y `gemini-3.1-pro-preview` con filtro de modelos prohibidos. | RESUELTO |
| **INC-002** | 2026-09-23 | Evidence Gate | CRÍTICA | Riesgo de que inferencias del modelo se presentaran como hechos documentales comprobados. | Respuestas del LLM sin anclaje a citas textuales. | Implementación de `EvidenceGate` determinista en código que exige `evidence.length >= 1`, documento existente y página válida. | RESUELTO |
