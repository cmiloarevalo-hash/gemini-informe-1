# Arquitectura del Sistema

```
+---------------------------------------------------------------------------------+
|                                 CLIENTE (REACT SPA)                             |
|  +------------------+  +------------------+  +-------------------------------+  |
|  | Estudio Titulos  |  |   Topografia     |  | Vista Auditoria / Evidencia   |  |
|  +------------------+  +------------------+  +-------------------------------+  |
+----------------------------------------^----------------------------------------+
                                         | HTTP / REST API (Express server.ts)
+----------------------------------------v----------------------------------------+
|                                SERVIDOR FULL-STACK                              |
|                                                                                 |
|  [Document Core Ingestor]                                                       |
|  - Multipart upload handler                                                     |
|  - Real SHA-256 byte digest (`crypto.createHash('sha256')`)                     |
|  - MIME inspection & PDF parser (`pdf-lib`)                                     |
|                                                                                 |
|  [Orchestrator de Analisis (12 Fases)]                                          |
|  01 Classification  -> 02 Extraction          -> 03 Entity Resolution           |
|  04 Property Res.   -> 05 Title Chain         -> 06 Timeline                    |
|  07 Cross-Analysis  -> 08 Missing Evidence    -> 09 Legal-Technical Analysis    |
|  10 Critical Review -> 11 EVIDENCE GATE G01   -> 12 Report Draft & DOCX Gen     |
|                                                                                 |
|  [Provider Gateway]                                                             |
|  - @google/genai SDK (Server-Side only)                                          |
|  - Model Discovery & Capabilities Negotiation                                    |
|  - Fallback controlado y registro de jobs y telemetría                          |
|                                                                                 |
|  [DOCX Engine]                                                                  |
|  - Pure TypeScript docx generator                                               |
|  - Generates full audit annex: Fact ID <-> Doc ID <-> Page <-> Quote            |
+---------------------------------------------------------------------------------+
```

## Aislamiento y Seguridad
1. **Multi-inquilino estricto:** Todo documento y estudio se indexa con `userId` y `studyId`.
2. **Protección de Secretos:** `GEMINI_API_KEY` reside exclusivamente en el entorno del servidor y nunca se transmite al cliente.
3. **Cero Mocks en Producción:** Todo proceso productivo opera sobre datos reales o reporta `NO CONSTA EN ANTECEDENTES`.
