# ESPECIFICACIÓN TÉCNICA DEFINITIVA
## Plataforma modular de análisis documental técnico-jurídico con IA

**Documento canónico:** `ESPECIFICACION_TECNICA_DEFINITIVA.md`  
**Versión de especificación:** `1.1.0`  
**Perfil objetivo inmediato:** `FREE_PROTOTYPE_V1`  
**Arquitectura objetivo posterior:** `PRODUCTION_READY`  
**Módulos iniciales:** `TITLE_STUDY`, `TOPOGRAPHIC_STUDY`  
**Repositorio:** `cmiloarevalo-hash/gemini-informe-1`  
**Baseline de implementación revisado:** commit `86ab7edc69b0f2d37b962977ff9452d9d5d876d0`  
**Revisión operacional incorporada:** Cloud Run, límites de memoria, pipeline por documento, fallback controlado, verificación escalonada de Evidence, sesión prototipo y Audit Bundle reproducible  
**Prioridad normativa:** VERACIDAD → TRAZABILIDAD → SEGURIDAD → FUNCIONALIDAD → ESCALABILIDAD → PRESENTACIÓN

---

# 0. CARÁCTER NORMATIVO Y PRECEDENCIA

Esta especificación define el comportamiento técnico y funcional definitivo de la versión `FREE_PROTOTYPE_V1` y la arquitectura obligatoria para su evolución.

Ante contradicción entre documentos, prevalece el siguiente orden:

1. `ESPECIFICACION_TECNICA_DEFINITIVA.md`
2. decisiones técnicas posteriores aprobadas y versionadas mediante ADR;
3. esquemas versionados de datos;
4. pruebas de aceptación vigentes;
5. `ESPECIFICACION_MAESTRA_AGENTE_ESTUDIO_TITULOS_AI.md`;
6. documentación auxiliar;
7. README;
8. comentarios de código;
9. comportamiento histórico de versiones anteriores.

Ningún README, prompt, archivo de auditoría, dato demo ni implementación previa puede modificar silenciosamente esta especificación.

Los términos normativos se interpretan así:

- **DEBE / OBLIGATORIO:** requisito indispensable.
- **NO DEBE / PROHIBIDO:** comportamiento no permitido.
- **DEBERÍA:** comportamiento preferente salvo justificación documentada.
- **PUEDE:** capacidad opcional.
- **DEFERRED:** explícitamente postergado y no exigible para cerrar V1.
- **VERIFIED:** implementado y demostrado por prueba ejecutada.
- **IMPLEMENTED_UNVERIFIED:** existe código, pero no hay prueba suficiente.
- **ARCHITECTURE_READY:** existe contrato/arquitectura, no implementación funcional completa.
- **BLOCKED:** no puede verificarse por dependencia externa o requisito incumplido.
- **FAILED:** se ejecutó una prueba y falló.
- **NOT_EXECUTED:** la prueba o etapa no fue ejecutada.

## 0.1 Regla de oro de estados

La aplicación, su auditoría y su interfaz DEBEN distinguir:

```text
REQUIRED
IMPLEMENTED
VERIFIED
```

La existencia de código NO equivale a verificación.

Ejemplo:

```text
Capability: REAL_DOCUMENT_ANALYSIS
Required: YES
Implemented: YES
Verified: NO
VerificationTest: T-DOC-001-LIVE
```

Solo `VERIFIED` se representa visualmente como estado verde.

---

# 1. FINALIDAD DEL PRODUCTO

La plataforma asiste a profesionales en la elaboración de análisis técnico-jurídicos basados en antecedentes documentales reales.

Los módulos iniciales son:

```text
TITLE_STUDY
TOPOGRAPHIC_STUDY
```

La función principal es:

```text
DOCUMENTOS REALES
→ HECHOS TRAZABLES
→ RELACIONES
→ COMPARACIONES
→ HALLAZGOS
→ CONCLUSIONES RESPALDADAS
→ INFORME AUDITABLE
```

El producto NO reemplaza la revisión profesional ni certifica por sí mismo validez jurídica, dominio, inexistencia de gravámenes, exactitud topográfica o suficiencia documental.

Si un dato no puede acreditarse:

```text
NO CONSTA EN ANTECEDENTES
```

o se utiliza un estado estructurado equivalente, por ejemplo:

```text
INSUFFICIENT_EVIDENCE
MISSING_EVIDENCE
UNVERIFIED
NOT_EXECUTED
```

Completar vacíos inventando información está prohibido.

---

# 2. ALCANCE DE `FREE_PROTOTYPE_V1`

## 2.1 Obligatorio en V1

V1 DEBE permitir:

1. crear un estudio;
2. seleccionar módulo;
3. subir múltiples antecedentes locales;
4. validar formato y bytes;
5. calcular SHA-256 real;
6. asociar cada documento al estudio;
7. configurar una API de Gemini en servidor;
8. descubrir modelos reales cuando la API lo permita;
9. seleccionar credencial y modelo;
10. enviar contenido documental real al proveedor;
11. obtener salida estructurada;
12. validar esa salida;
13. producir `Fact` con `Evidence`;
14. analizar cadena de títulos cuando aplique;
15. analizar datos topográficos documentales cuando aplique;
16. detectar discrepancias y vacíos;
17. ejecutar revisión crítica;
18. ejecutar Evidence Gate;
19. bloquear informe si falla una compuerta;
20. generar DOCX determinista cuando las compuertas aprueban;
21. mostrar trazabilidad;
22. producir Audit Bundle;
23. ejecutar pruebas offline;
24. ejecutar pruebas live cuando exista credencial válida;
25. fallar explícitamente ante errores;
26. iniciar correctamente el backend compilado en Cloud Run cuando ese sea el destino de hosting;
27. respetar límites explícitos de memoria y concurrencia;
28. analizar documentos de forma individual antes de consolidar el expediente;
29. conservar artefactos de análisis por documento;
30. mantener una identidad de sesión de prototipo separable para probar aislamiento;
31. generar manifests de auditoría sin modificar silenciosamente archivos versionados;
32. registrar cualquier cambio de modelo respecto del solicitado como selección explícita y auditable.

## 2.2 Diferido en V1

No bloquean el cierre de `FREE_PROTOTYPE_V1`:

```text
Google Authentication     = DEFERRED
Google Drive / Picker     = DEFERRED
Firestore                 = DEFERRED
OpenAI                    = ARCHITECTURE_READY
OpenRouter                = ARCHITECTURE_READY
OpenAI-compatible         = ARCHITECTURE_READY
Cloud Tasks               = PRODUCTION_READY
Cloud Storage             = PRODUCTION_READY
Secret Manager / KMS      = PRODUCTION_READY
Cloud Run hardening multi-instancia = PRODUCTION_READY
```

El uso de **Cloud Run como hosting del prototipo** sí forma parte del alcance actual cuando se despliega la aplicación. Lo diferido es el hardening de producción, no el contrato mínimo de arranque y salud del contenedor.

La UI NO DEBE mostrar estas capacidades como conectadas, verificadas o funcionales mientras permanezcan diferidas.

---

# 3. PRINCIPIOS NO NEGOCIABLES

## 3.1 Contenido real

La IA DEBE recibir:

- bytes reales del archivo; o
- una representación fiel, verificable y derivada de esos bytes cuando el proveedor no pueda recibir el archivo directamente.

Nunca es suficiente:

- filename;
- extensión;
- MIME declarado por el navegador;
- tamaño;
- page count;
- metadata;
- nombre del estudio;
- rol ingresado manualmente.

## 3.2 Trazabilidad

Cadena canónica:

```text
DOCUMENT
  ↓
EVIDENCE
  ↓
FACT
  ↓
ENTITY / RELATION
  ↓
COMPARISON / FINDING
  ↓
CONCLUSION
  ↓
REPORT
```

Toda afirmación material del informe DEBE poder retroceder por esta cadena.

## 3.3 Fallos reales

Si falla:

- proveedor;
- credencial;
- modelo;
- lectura;
- JSON;
- esquema;
- evidencia;
- revisión crítica;
- seguridad;
- generación;

el sistema DEBE registrar el fallo y detener la etapa dependiente.

Está prohibido reemplazar un fallo por contenido ficticio.

## 3.4 Separación análisis/presentación

La IA NO genera directamente el documento Word final.

Flujo obligatorio:

```text
AI OUTPUT
→ PARSE
→ SCHEMA VALIDATION
→ SEMANTIC VALIDATION
→ CRITICAL REVIEW
→ EVIDENCE GATE
→ APPROVED CENTRAL ANALYSIS
→ DETERMINISTIC DOCX
```

## 3.5 Ausencia ≠ inexistencia

Un array vacío NO demuestra ausencia jurídica o material.

Aplica a:

- hipotecas;
- gravámenes;
- prohibiciones;
- servidumbres;
- embargos;
- litigios;
- deudas;
- títulos faltantes;
- discrepancias.

## 3.6 No chain-of-thought

No solicitar, guardar ni auditar razonamiento privado paso a paso del modelo.

Guardar únicamente:

- entrada técnica;
- prompt versionado;
- output estructurado;
- evidencia;
- validaciones;
- errores;
- métricas operacionales permitidas.

## 3.7 Procesamiento acotado por recursos

El sistema DEBE operar bajo presupuestos explícitos de memoria, tamaño y concurrencia.

Está prohibido asumir que por admitir `N` archivos en UI el backend puede mantener simultáneamente todos sus buffers, copias Base64 y respuestas de IA en memoria.

La política V1 es:

```text
RAW DOCUMENT BYTES
→ ONE DOCUMENT AT A TIME
→ PROVIDER REQUEST
→ STRUCTURED DOCUMENT RESULT
→ RELEASE TRANSIENT REPRESENTATIONS
```

## 3.8 Fallback de modelo nunca silencioso

El cambio automático de un `modelId` por otro está prohibido.

Política por defecto:

```text
MODEL_FALLBACK_POLICY = BLOCK
```

Solo se admite ejecutar otro modelo si el usuario selecciona explícitamente un modelo descubierto y disponible. Ese cambio debe quedar registrado como `USER_APPROVED`.

---

# 4. ARQUITECTURA DE REFERENCIA

```text
┌────────────────────────────────────┐
│             Frontend               │
│ React + TypeScript + Vite          │
└───────────────┬────────────────────┘
                │ HTTP/JSON + multipart
┌───────────────▼────────────────────┐
│            API Server              │
│ Node.js + Express                  │
├────────────────────────────────────┤
│ Study Service                      │
│ Document Core                      │
│ Credential Store                   │
│ Provider Gateway                   │
│ Analysis Orchestrator              │
│ Critical Reviewer                  │
│ Evidence Gate                      │
│ Report Generator                   │
│ Audit Service                      │
│ Security Guard                     │
└───────────────┬────────────────────┘
                │
┌───────────────▼────────────────────┐
│       External AI Provider         │
│ Google Gemini — V1                 │
│ Other providers — deferred         │
└────────────────────────────────────┘
```

## 4.1 Capas obligatorias

```text
src/
├── core/
│   ├── auth/
│   ├── documents/
│   ├── evidence/
│   ├── analysis/
│   ├── providers/
│   ├── jobs/
│   ├── reports/
│   ├── audit/
│   ├── security/
│   └── storage/
├── modules/
│   ├── title-study/
│   └── topography/
├── schemas/
└── ...
prompts/
tests/
audit/
docs/
```

`storage/` puede ser una abstracción sobre memoria en V1 y persistencia real posteriormente.

## 4.2 Desacoplamiento

Agregar un módulo nuevo NO DEBE requerir reescribir:

- Document Core;
- Credential Store;
- Provider Gateway;
- Evidence Gate;
- Security Guard;
- Audit Service.

## 4.3 Límite de despliegue actual — Cloud Run

Cuando el prototipo se hospeda en Cloud Run, el límite operacional es:

```text
Browser
→ HTTPS
→ Cloud Run revision
→ compiled Node/Express server
→ static dist/ + REST API
```

El contenedor NO debe arrancar Vite en modo desarrollo dentro de Cloud Run. El frontend se compila antes del arranque y Express sirve `dist/`.

Mientras el estado sea `IN_MEMORY / NON_PERSISTENT`, el despliegue hospedado DEBE evitar escalamiento horizontal que implique estados divergentes entre instancias.

---

# 5. PERFIL DE EJECUCIÓN Y ENTORNO

## 5.1 FREE_PROTOTYPE

Características:

```text
Storage de estudios     = IN_MEMORY
Storage de documentos   = IN_MEMORY
Storage de credenciales = IN_MEMORY_SERVER_SIDE
Authentication          = LOCAL_PROTOTYPE_MODE
Drive                    = DEFERRED
CostProfile              = FREE_PROTOTYPE_BUDGET_GOAL
Billing                   = VERIFY_PER_DEPLOYMENT
```

La pérdida de datos al reiniciar el servidor DEBE ser visible como limitación.

El objetivo `FREE_PROTOTYPE` es presupuestario, no una afirmación de que cada servicio desplegado sea siempre gratuito. Antes de habilitar Cloud Run u otro servicio administrado se debe verificar costo, billing requerido, cuotas y configuración vigente en `COST_PROFILE.json`.

No se puede describir memoria RAM como “persistente”.

## 5.2 Usuario local de prototipo

Mientras Google Auth esté diferido:

```text
authMode = LOCAL_PROTOTYPE
isGoogleVerified = false
```

No se deben hardcodear nombres, correos o fotografías personales como si fueran una sesión autenticada.

La UI debe mostrar:

```text
Modo local de prototipo
Autenticación Google: DEFERRED
```

## 5.3 PRODUCTION_READY

La abstracción de almacenamiento DEBE permitir sustituir memoria por un repositorio persistente sin modificar los modelos de dominio.

## 5.4 Perfil `CLOUD_RUN_HOSTED_PROTOTYPE`

Cuando `FREE_PROTOTYPE_V1` se despliega en Cloud Run, aplican obligatoriamente estas reglas:

### 5.4.1 Entry point de producción

El backend TypeScript DEBE compilarse o bundlearse a JavaScript antes del arranque. Para el stack actual, el patrón normativo es equivalente a:

```text
npm run build
→ vite build
→ compile/bundle server.ts
→ server.js

npm start
→ node server.js
```

`node server.ts` NO es el entry point de producción salvo decisión posterior explícitamente verificada y documentada por ADR.

### 5.4.2 Detección de producción

Cloud Run debe considerarse entorno de producción cuando exista `K_SERVICE`, aun si `NODE_ENV` no fue definido correctamente por una herramienta externa.

Ejemplo conceptual:

```ts
const isProduction =
  process.env.NODE_ENV === "production" ||
  Boolean(process.env.K_SERVICE);
```

En ese perfil no se monta Vite dev middleware.

### 5.4.3 Puerto y bind

Obligatorio:

```ts
const port = Number(process.env.PORT || 3000);
app.listen(port, "0.0.0.0");
```

No hardcodear `8080`, `3000` u otro valor como puerto obligatorio de Cloud Run. `3000` puede existir solo como fallback local.

### 5.4.4 Health check

Debe existir:

```text
GET /api/health
→ HTTP 200
```

El health endpoint debe ser rápido y no depender de Gemini, Drive, Firestore ni de una llamada externa.

Si una revisión no inicia, primero se deben inspeccionar logs de proceso y validar build/entrypoint/PORT antes de aumentar timeouts.

El error `container failed to start and listen on PORT` se clasifica inicialmente como `CLOUD_RUN_STARTUP_FAILED` hasta identificar la causa raíz en logs. No debe atribuirse automáticamente a timeout, memoria o puerto sin evidencia.

### 5.4.5 Perfil de instancia mientras exista estado en memoria

Mientras estudios, documentos, credenciales y análisis vivan en RAM:

```text
maxInstances = 1
containerConcurrency = 1   (default de seguridad del prototipo)
minInstances = 0           (permitido para reducir costo)
```

Estos valores son de prototipo, no de producción. Reinicios, scale-to-zero y nuevos despliegues pueden borrar todo el estado.

### 5.4.6 Presupuesto temporal de requests

El flujo síncrono debe tener un presupuesto inferior al timeout configurado del servicio:

```text
syncAnalysisBudgetMs < cloudRunRequestTimeoutMs - safetyMarginMs
```

El valor concreto se define por configuración y se verifica en deployment; no debe deducirse de un timeout histórico asumido. Si el presupuesto se agota y no existe worker durable, responder `ANALYSIS_ASYNC_REQUIRED`.

### 5.4.7 Acceso público

Un despliegue sin autenticación real NO debe considerarse apto para antecedentes jurídicos confidenciales.

Mientras Google Auth siga `DEFERRED`, el hosting debe utilizar una política de acceso restringido para pruebas, o limitarse a fixtures/sintéticos. Si existe una API key global de Gemini en el servidor, no debe quedar expuesta a abuso mediante un endpoint público anónimo sin controles de acceso/cuota.

---

# 6. MODELO DE ESTUDIO

```ts
interface Study {
  id: string;
  ownerId: string;
  name: string;
  moduleType: "TITLE_STUDY" | "TOPOGRAPHIC_STUDY";
  role?: string | null;
  commune?: string | null;
  status: StudyStatus;
  createdAt: string;
  updatedAt: string;
}
```

Estados mínimos:

```text
DRAFT
READY
ANALYZING
REVIEW_REQUIRED
APPROVED
FAILED
```

Un estudio puede contener:

```text
Study
├── Documents[]
├── AnalysisRuns[]
├── ApprovedAnalysis?
└── Reports[]
```

No sobrescribir silenciosamente un análisis anterior.

Cada ejecución debe tener `analysisRunId`.

---

# 7. DOCUMENT CORE

## 7.1 Formatos V1

```text
PDF
DOCX
JPG
JPEG
PNG
```

Cualquier otro formato debe producir:

```text
FILE_FORMAT_ERROR
```

## 7.2 Carga múltiple

Debe aceptar múltiples archivos en una operación.

Límites configurables, con defaults V1:

```text
maxFilesPerRequest        = 5
maxBytesPerFile           = 15 MiB
maxBytesPerUploadRequest  = 60 MiB
maxStoredBytesPerStudy    = 75 MiB
maxStoredBytesPerProcess  = 150 MiB
aiFileConcurrency         = 1
```

Los límites deben provenir de configuración, no quedar dispersos en UI y servidor.

Un archivo fallido no debe cancelar automáticamente los demás.

## 7.3 Validación binaria

No confiar solo en filename o MIME del cliente.

Debe existir inspección de firma/contenedor:

- PDF: firma `%PDF-`;
- JPEG: magic bytes JPEG;
- PNG: firma PNG;
- DOCX: contenedor ZIP + estructura OOXML compatible.

Resultado:

```text
declaredMime
detectedMime
mimeVerificationStatus
```

Estados:

```text
MATCH
MISMATCH
UNKNOWN
```

`MISMATCH` debe bloquear o requerir decisión explícita según política.

## 7.4 Hash

Obligatorio:

```text
sha256 = SHA256(rawBytes)
```

Formato:

```text
64 caracteres hexadecimales
```

No UUID, no placeholder.

## 7.5 Páginas

- PDF: page count real cuando se pueda inspeccionar.
- JPG/JPEG/PNG: `1`.
- DOCX: `null` salvo que exista paginación real derivada de un motor de renderizado.
- archivo ilegible/encriptado sin acceso: no inventar page count.

## 7.6 Calidad de lectura

Al cargar:

```text
UNKNOWN
```

Solo cambia después de lectura real.

Estados:

```text
HIGH
MEDIUM
LOW
UNREADABLE
UNKNOWN
```

## 7.7 Estados documentales

```text
UPLOADED
PREPARING
READY_FOR_AI
ANALYZING
PROCESSED
FAILED
```

Transiciones inválidas deben rechazarse.

## 7.8 Modelo canónico

```ts
interface StudyDocument {
  id: string;
  ownerId: string;
  studyId: string;

  originalName: string;
  declaredMimeType: string;
  detectedMimeType?: string | null;

  size: number;
  sha256: string;

  source: "local" | "drive";
  driveFileId?: string | null;

  status: DocumentStatus;
  pageCount?: number | null;
  readingQuality: ReadingQuality;

  createdAt: string;
  updatedAt: string;
}
```

## 7.9 Gestión de memoria en V1

Los límites anteriores son presupuestos de seguridad y se miden sobre bytes reales antes de Base64.

Reglas:

1. no conservar copias Base64 después de completar la llamada al proveedor;
2. no construir una única solicitud que contenga todos los documentos del expediente;
3. no duplicar buffers innecesariamente entre capas;
4. liberar referencias temporales al finalizar el análisis de cada documento;
5. rechazar nuevas cargas con `MEMORY_BUDGET_EXCEEDED` si superarían el presupuesto configurado;
6. registrar tamaño acumulado por estudio y proceso;
7. procesar IA con `aiFileConcurrency = 1` por defecto.

En Cloud Run, escribir a `/tmp` NO se considera por sí solo una solución de ahorro de memoria. Cualquier scratch temporal debe tratarse como parte del presupuesto de la instancia y eliminarse inmediatamente después de su uso.

## 7.10 Ciclo de vida de bytes

El sistema debe distinguir:

```text
RAW_BYTES_AVAILABLE
RAW_BYTES_IN_USE
RAW_BYTES_EVICTED
RAW_BYTES_MISSING
```

Si el prototipo decide liberar bytes originales para respetar memoria, debe informar que un reanálisis puede requerir re-upload. Nunca fingir que el archivo sigue disponible.

---

# 8. CREDENCIALES Y PROVIDERS

## 8.1 V1

Provider requerido:

```text
google-gemini
```

Otros:

```text
openai
openrouter
openai-compatible
```

deben conservar contratos, pero no simular funcionamiento.

## 8.2 Credential Store

En `FREE_PROTOTYPE_V1`:

```text
IN_MEMORY_CREDENTIAL_STORE
```

La key:

- vive solo server-side;
- no se devuelve;
- no se registra en logs;
- no aparece en audit JSON;
- no se guarda en localStorage;
- no se guarda en sessionStorage;
- no se comitea;
- se pierde al reiniciar.

Modelo público:

```ts
interface CredentialDescriptor {
  id: string;
  alias: string;
  provider: AIProviderType;
  maskedKey: string;
  baseUrl?: string | null;
  status: CredentialStatus;
  defaultModel?: string | null;
  availableModels: string[];
  lastTestedAt?: string | null;
}
```

Estados:

```text
UNTESTED
VERIFIED
BLOCKED
FAILED
```

## 8.3 API mínima

```text
GET    /api/providers
POST   /api/providers
DELETE /api/providers/:id
POST   /api/providers/:id/test
POST   /api/providers/:id/models
```

La respuesta jamás incluye API key completa.

## 8.4 Provider Gateway

```ts
interface AIProvider {
  type: AIProviderType;

  listModels(): Promise<ModelInfo[]>;

  getModelCapabilities(
    modelId: string
  ): Promise<ModelCapabilities>;

  testConnection(
    modelId?: string
  ): Promise<ConnectionResult>;

  analyze(
    request: AIAnalysisRequest
  ): Promise<AIAnalysisResponse>;
}
```

---

# 9. MODELOS DE IA

## 9.1 Modelo objetivo inicial

Objetivo de certificación V1:

```text
gemini-3.6-flash
```

Reglas:

1. nunca traducirlo silenciosamente a otro `modelId`;
2. el `modelId` enviado debe coincidir con el seleccionado;
3. solo puede marcarse `VERIFIED` si discovery/test live confirma disponibilidad;
4. si no aparece en discovery:
   ```text
   MODEL_UNAVAILABLE
   ```
5. no insertar el modelo artificialmente en `listModels()`;
6. un modelo alternativo descubierto puede ser seleccionado explícitamente, pero no presentado como alias de 3.6.

## 9.2 Discovery

Flujo:

```text
credential
→ provider.listModels()
→ raw provider result
→ normalization
→ capability status
→ cache timestamped
```

Si discovery falla:

```text
BLOCKED
```

Puede mostrarse cache anterior únicamente como:

```text
STALE_CACHE
```

Nunca como resultado fresco.

## 9.3 Capacidades

```ts
interface ModelCapabilities {
  text: CapabilityState;
  image: CapabilityState;
  pdf: CapabilityState;
  structuredOutput: CapabilityState;
  reasoning: CapabilityState;

  maxInputTokens?: number | null;
  maxOutputTokens?: number | null;
}

type CapabilityState =
  | "VERIFIED"
  | "DECLARED_BY_PROVIDER"
  | "UNKNOWN"
  | "UNSUPPORTED";
```

No asumir las mismas capacidades para todos los modelos.

## 9.4 Metadata de modelo

```ts
interface ModelInfo {
  modelId: string;
  displayName: string;
  provider: AIProviderType;
  capabilities: ModelCapabilities;
  discoveryStatus: "LIVE" | "STALE_CACHE";
  discoveredAt: string;
}
```

## 9.5 Política de selección alternativa

Estados permitidos:

```text
BLOCK
USER_APPROVED
```

Comportamiento:

```text
requestedModel unavailable
→ MODEL_UNAVAILABLE
→ show live discovered alternatives
→ user explicitly selects one
→ execute selected model
→ record USER_APPROVED
```

El `ExecutionManifest` debe registrar:

```ts
requestedModelId: string;
executedModelId: string;
modelSelectionReason: "EXACT" | "USER_APPROVED";
```

No existe estado `SILENT_FALLBACK`.

---

# 10. PREPARACIÓN Y ENVÍO A IA

## 10.1 Principio

La solicitud debe incluir contenido real.

Cuando el proveedor soporte inline/file input:

```text
RAW BYTES
→ PROVIDER
```

Cuando no:

```text
RAW BYTES
→ TRUSTED PREPARATION
→ TRACEABLE REPRESENTATION
→ PROVIDER
```

## 10.2 PreparedDocument

```ts
interface PreparedDocument {
  documentId: string;
  fileName: string;
  mimeType: string;
  sha256: string;
  pageCount: number | null;

  transport:
    | "INLINE_BYTES"
    | "PROVIDER_FILE_REFERENCE"
    | "EXTRACTED_REPRESENTATION";

  providerFileReference?: string | null;
}
```

## 10.3 Integridad de entrada

Antes de llamar al proveedor:

```text
assert document.studyId === study.id
assert document.ownerId === currentUser.id
assert SHA256(buffer) === document.sha256
```

Si falta el buffer:

```text
DOCUMENT_BYTES_MISSING
```

No ejecutar análisis parcial silencioso.

## 10.4 Una unidad documental por request de extracción

La unidad predeterminada de análisis V1 es **un documento real**.

```text
ONE StudyDocument
→ ONE provider extraction request
→ ONE DocumentAnalysisArtifact
```

Se permite que un mismo PDF contenga varias páginas; eso sigue siendo una unidad documental.

Enviar múltiples documentos completos en una sola llamada solo puede habilitarse mediante ADR, prueba de memoria, prueba de output y justificación de trazabilidad. No es el comportamiento por defecto de V1.

---

# 11. PIPELINE DE ANÁLISIS

## 11.1 Arquitectura en dos niveles

El pipeline definitivo separa **extracción por documento** de **consolidación del expediente**.

### Nivel A — análisis individual por documento

Para cada `StudyDocument`:

```text
D01 DOCUMENT_PREPARE
D02 CLASSIFICATION
D03 EXTRACTION
D04 EVIDENCE_VERIFICATION
D05 DOCUMENT_SCHEMA_VALIDATION
→ DocumentAnalysisArtifact
```

El procesamiento es secuencial por defecto:

```text
Documento 1 → resultado estructurado → liberar transitorios
Documento 2 → resultado estructurado → liberar transitorios
...
Documento N → resultado estructurado → liberar transitorios
```

### Nivel B — consolidación del expediente

La consolidación recibe preferentemente **artefactos estructurados ya validados**, no todos los PDFs crudos juntos:

```text
E01 ENTITY_RESOLUTION
E02 PROPERTY_RESOLUTION
E03 TITLE_CHAIN
E04 TIMELINE
E05 CROSS_DOCUMENT_ANALYSIS
E06 MISSING_EVIDENCE
E07 LEGAL_TECHNICAL_ANALYSIS
E08 CRITICAL_REVIEW
E09 EVIDENCE_GATE
E10 REPORT_DRAFT
```

Para `TOPOGRAPHIC_STUDY`, las etapas específicas de título se sustituyen por las etapas topográficas correspondientes sin alterar Document Core.

## 11.2 Artefacto por documento

```ts
interface DocumentAnalysisArtifact {
  id: string;
  ownerId: string;
  studyId: string;
  documentId: string;
  documentSha256: string;
  provider: string;
  modelId: string;
  classification: DocumentClassification;
  facts: Fact[];
  referencedDocuments: ReferencedDocument[];
  readingQuality: ReadingQuality;
  schemaValidation: "PASS" | "FAIL";
  createdAt: string;
}
```

La consolidación no puede aceptar un artefacto con `documentSha256` distinto del documento canónico.

## 11.3 No mega-prompt de expediente

Está prohibido usar como estrategia predeterminada:

```text
20 PDFs completos
→ 1 prompt masivo
→ 1 JSON masivo
```

La comparación cruzada puede usar:

- artefactos estructurados;
- citas focalizadas;
- páginas puntuales;
- documentos específicos cuando una contradicción requiera relectura.

Esto reduce memoria, riesgo de truncamiento y contaminación de evidencia.

## 11.4 Fallos y reintentos

Un fallo en el documento `N` no invalida automáticamente los artefactos ya verificados de los documentos `1..N-1`.

Debe registrarse:

```text
documentId
stage
errorCode
retryable
attempt
```

Un reintento no puede mezclar resultados de distintas versiones del mismo documento sin comparar SHA-256.

## 11.5 Ejecución HTTP del prototipo

Para `CLOUD_RUN_HOSTED_PROTOTYPE` se prefieren operaciones acotadas por documento. Son válidos dos patrones:

```text
A) POST analyze-document síncrono por documento
   + POST consolidate al finalizar

B) POST analyze del estudio
   + servidor procesa documentos secuencialmente
   + solo si la operación cabe dentro del presupuesto temporal configurado
```

Si el trabajo excede el presupuesto síncrono y no existe worker durable, el sistema debe responder:

```text
ANALYSIS_ASYNC_REQUIRED
```

No se permite responder `202 Accepted` y dejar un `Promise` de larga duración ejecutándose sin infraestructura durable.

## 11.6 Perfil `PRODUCTION_READY`

Producción requiere `AnalysisJob` durable:

```text
POST /analyze
→ 202 + jobId
→ durable queue/worker
→ GET /jobs/:jobId
```

La cola/worker puede implementarse con el servicio aprobado en esa fase. No es requisito habilitarlo durante el prototipo si el flujo síncrono acotado es suficiente.

## 11.7 Visibilidad de etapas

No mostrar fases no ejecutadas. Cada etapa registra:

```ts
interface StageExecution {
  stage: string;
  status:
    | "PENDING"
    | "RUNNING"
    | "PASS"
    | "FAIL"
    | "BLOCKED"
    | "NOT_EXECUTED";
  startedAt?: string;
  finishedAt?: string;
  provider?: string;
  model?: string;
  documentId?: string | null;
  errorCode?: string;
}
```

---

# 12. SALIDA ESTRUCTURADA

## 12.1 Regla

La salida primaria de IA DEBE ser JSON estructurado.

Orden:

```text
provider structured output
→ JSON parse
→ Zod structural validation
→ semantic validation
```

## 12.2 Structured Output

Cuando el SDK/modelo soporte esquema:

- usar `responseMimeType = application/json`;
- enviar el `responseSchema` real compatible;
- no limitarse a `{ type: "object" }`.

Si el proveedor no soporta response schema:

```text
structuredOutput = UNSUPPORTED
```

y se aplica parser estricto + Zod, sin afirmar que el proveedor usó schema enforcement.

## 12.3 JSON inválido

Si no se puede parsear:

```text
MODEL_OUTPUT_INVALID_JSON
```

Debe:

- fallar el job;
- no persistir como análisis aprobado;
- no ejecutar DOCX.

No “reparar” agregando hechos inventados.

## 12.4 Control de tamaño de salida

Los esquemas de extracción por documento deben ser acotados.

Si la respuesta termina truncada o excede la capacidad de salida:

```text
MODEL_OUTPUT_TRUNCATED
```

El sistema puede reintentar dividiendo la etapa en subetapas más pequeñas, pero nunca completar llaves, arrays, hechos o citas mediante invención local.

Los límites de tokens deben provenir de metadata/discovery/configuración vigente del proveedor, no de números históricos hardcodeados como verdad universal.

---

# 13. MODELO CENTRAL DE ANÁLISIS

```ts
interface CentralAnalysis {
  schemaVersion: string;

  analysisRun: {
    id: string;
    studyId: string;
    ownerId: string;
    moduleId: string;
    provider: string;
    modelId: string;
    startedAt: string;
    completedAt?: string | null;
  };

  documents: StudyDocument[];
  facts: Fact[];
  entities: Entity[];
  relations: Relation[];

  titleStudy?: TitleStudyData;
  topography?: TopographicAnalysisData;

  comparisons: Comparison[];
  findings: Finding[];
  conclusions: Conclusion[];
  missingEvidence: MissingEvidenceItem[];

  qualityReview: QualityReview;
  evidenceGate: EvidenceGateResult;
  executionManifest: ExecutionManifest;
}
```

No guardar una salida del modelo sin normalizar como `CentralAnalysis` validado.

---

# 14. EVIDENCE

## 14.1 Modelo

```ts
interface Evidence {
  id: string;
  documentId: string;
  fileName: string;

  page: number | null;

  originalText: string | null;

  confidence:
    | "HIGH"
    | "MEDIUM"
    | "LOW";

  verificationStatus:
    | "VERIFIED_EXACT"
    | "VERIFIED_NORMALIZED"
    | "REVIEW_REQUIRED_FUZZY"
    | "VISUAL_VERIFIED"
    | "UNVERIFIED"
    | "FAILED";
}
```

## 14.2 Regla principal

```text
DOCUMENTED_FACT sin Evidence válida = INVALID
```

## 14.3 Evidencia faltante no es Evidence

Esto está prohibido:

```json
{
  "documentId": "primer-documento-del-estudio",
  "page": 1,
  "originalText": "No se acompañó Certificado de Hipotecas..."
}
```

si esa frase no existe en dicho documento.

Una ausencia se modela así:

```ts
interface MissingEvidenceItem {
  id: string;
  category: "MISSING_EVIDENCE";
  requiredDocumentType?: string | null;
  description: string;
  referencedByFactIds?: string[];
  sourceEvidenceIds?: string[];
  severity: "INFO" | "WARNING" | "BLOCKING";
}
```

## 14.4 Verificación textual escalonada

Orden obligatorio:

```text
1. EXACT MATCH
2. CONSERVATIVE NORMALIZED MATCH
3. FUZZY CANDIDATE DETECTION
4. FAIL / HUMAN REVIEW
```

### Nivel 1 — exacto

La cita coincide literalmente con el texto de la página:

```text
VERIFIED_EXACT
```

### Nivel 2 — normalizado conservador

Se permite normalizar únicamente artefactos de presentación que no cambien el contenido semántico, por ejemplo:

- Unicode equivalente;
- CRLF/LF;
- espacios repetidos;
- saltos de línea;
- comillas tipográficas equivalentes;
- guiones tipográficos equivalentes;
- de-hyphenation de salto de línea cuando pueda demostrarse que es solo corte de palabra.

Resultado:

```text
VERIFIED_NORMALIZED
```

La normalización NO puede alterar dígitos, nombres, roles, RUT, fojas, números, años, repertorios, superficies, porcentajes ni otros identificadores materiales.

### Nivel 3 — fuzzy

Levenshtein/similitud semántica puede usarse solo para **localizar una cita candidata** ante OCR imperfecto.

Resultado:

```text
REVIEW_REQUIRED_FUZZY
```

Un porcentaje de similitud, cualquiera sea el umbral, NO convierte automáticamente la evidencia en verificada.

Datos jurídicamente sensibles deben superar verificación exacta/normalizada o revisión humana.

## 14.5 Documentos visuales/escaneados

Si no existe texto digital:

- puede usarse lectura visual del modelo;
- para elevar a evidencia verificada debe existir mecanismo verificable, por ejemplo OCR focalizado o inspección de página;
- si la inspección visual automatizada queda suficientemente trazada puede usarse `VISUAL_VERIFIED`;
- si no puede verificarse:
  ```text
  UNVERIFIED
  requiresProfessionalReview = true
  ```

La política OCR debe minimizar llamadas innecesarias y aplicarse solo cuando haga falta para acreditar evidencia.

---

# 15. FACT

```ts
interface Fact {
  id: string;

  type: FactType;

  originalValue: unknown;
  normalizedValue?: unknown;
  unit?: string | null;

  explicitInDocument: boolean;

  evidence: Evidence[];

  verificationStatus:
    | "VERIFIED"
    | "UNVERIFIED"
    | "CONTRADICTED";
}
```

Tipos mínimos:

```text
ROL_AVALUO
PROPERTY_ADDRESS
COMMUNE
REGION
CURRENT_OWNER
RUT
REGISTRATION
FOJAS
NUMBER
YEAR
CBR
DEED_DATE
NOTARY
REPERTORY
SELLER
BUYER
INHERITANCE
ADJUDICATION
PRICE
SURFACE
BOUNDARY
ADJACENT_OWNER
ENCUMBRANCE
PROHIBITION
SERVITUDE
USUFRUCT
PLAN_REFERENCE
TOPOGRAPHIC_SEGMENT
OTHER
```

Los identificadores del tipo se pueden ampliar mediante versionado.

---

# 16. ENTIDADES Y RELACIONES

## 16.1 Entidades

```text
PROPERTY
PERSON
LEGAL_ENTITY
REGISTRATION
TITLE
TRANSACTION
PLAN
ROLE
ENCUMBRANCE
```

## 16.2 Relaciones

```text
SAME_PROPERTY
SAME_PERSON
CURRENT_OWNER
PREVIOUS_OWNER
PREVIOUS_TITLE
ACQUIRED_BY
TRANSFERRED_TO
DERIVED_FROM
CORROBORATES
CONTRADICTS
SUPERSEDES
REFERENCES
```

Cada relación material debe tener `supportingFactIds`.

No crear entidad de propietario únicamente porque `propertyDetails.currentOwner` fue emitido por IA si no existe Fact verificable correspondiente.

---

# 17. MÓDULO `TITLE_STUDY`

## 17.1 Objetivos

Analizar, cuando conste:

- individualización del inmueble;
- rol;
- dirección;
- comuna;
- dominio vigente;
- titular;
- título de adquisición;
- escritura;
- fecha;
- notaría;
- repertorio;
- inscripción;
- fojas;
- número;
- año;
- CBR;
- título antecedente;
- herencias;
- adjudicaciones;
- compraventas;
- cadena;
- hipotecas;
- gravámenes;
- prohibiciones;
- servidumbres;
- usufructos;
- embargos;
- anotaciones;
- discrepancias;
- vacíos documentales.

## 17.2 Cadena de títulos

```ts
interface TitleChainLink {
  id: string;

  seller?: string | null;
  buyer?: string | null;

  titleType: string;

  deedDate?: string | null;
  notary?: string | null;
  repertory?: string | null;

  fojas?: string | null;
  numero?: string | null;
  year?: string | null;
  cbr?: string | null;

  previousTitleReference?: string | null;

  status:
    | "CONFIRMED_LINK"
    | "REFERENCED_BUT_NOT_PROVIDED"
    | "MISSING_LINK"
    | "CONTRADICTORY_LINK"
    | "UNVERIFIED_LINK";

  evidence: Evidence[];
}
```

## 17.3 Reglas

`CONFIRMED_LINK` requiere evidencia válida.

Si el documento cita un título anterior que no fue aportado:

```text
REFERENCED_BUT_NOT_PROVIDED
```

No fabricar inscripción, fojas, año, partes ni notaría.

## 17.4 Afirmaciones prohibidas sin respaldo suficiente

No declarar:

```text
cadena ininterrumpida
tradición saneada
títulos ajustados a derecho
inmueble libre de gravámenes
```

si existe:

- eslabón faltante;
- título solo referenciado;
- contradicción;
- documento ilegible;
- falta de certificado;
- evidencia no verificada.

---

# 18. GRAVÁMENES Y CERTIFICADOS

## 18.1 Clasificación por contenido

La existencia de un certificado se determina por clasificación basada en contenido.

Está prohibido:

```ts
fileName.includes("hipoteca")
fileName.includes("gravamen")
```

como fuente probatoria.

## 18.2 Regla de ausencia

Sin certificado vigente suficiente:

```text
verificationStatus = INSUFFICIENT_EVIDENCE
```

No crear Evidence ficticia para representar la ausencia.

## 18.3 Resultado posible

```text
VERIFIED_RECORDS
INSUFFICIENT_EVIDENCE
CONTRADICTORY_EVIDENCE
```

`NO_ENCUMBRANCES_RECORDED` solo puede usarse si existe documento pertinente, evidencia verificable y alcance temporal/documental adecuado.

---

# 19. MÓDULO `TOPOGRAPHIC_STUDY`

## 19.1 IA

La IA interpreta:

- planos;
- escrituras;
- levantamientos;
- superficies;
- deslindes;
- tramos;
- orientaciones;
- colindantes;
- coordenadas cuando existan.

## 19.2 Código determinista

TypeScript calcula:

- ha ↔ m²;
- diferencias absolutas;
- porcentajes;
- sumatoria de tramos;
- perímetros;
- cálculos derivados.

La IA no debe inventar resultados aritméticos cuando pueden calcularse en código.

## 19.3 Parser regional

Debe manejar explícitamente formatos ambiguos:

```text
1.200 m2
1,200 m2
8,85 ha
0.98 ha
9.800 m²
```

Cuando un valor sea ambiguo sin contexto regional suficiente:

```text
AMBIGUOUS_NUMERIC_FORMAT
```

No elegir silenciosamente una interpretación.

## 19.4 Tolerancias

No usar una “tolerancia legal general” hardcodeada como si existiera una única regla universal.

Las tolerancias deben ser:

```ts
interface TolerancePolicy {
  id: string;
  value: number;
  unit: "PERCENT" | "M2";
  source?: string | null;
  status: "CONFIGURED" | "VERIFIED_SOURCE" | "UNVERIFIED";
}
```

Si no existe base normativa/técnica validada:

```text
toleranceStatus = UNVERIFIED
```

y el sistema solo reporta la diferencia matemática.

---

# 20. COMPARACIONES Y DISCREPANCIAS

```ts
interface Comparison {
  id: string;
  topic: string;

  sourceFactIds: string[];

  status:
    | "CONSISTENT"
    | "DISCREPANCY"
    | "PARTIAL"
    | "INSUFFICIENT_EVIDENCE";

  notes?: string | null;
}
```

Comparaciones típicas:

```text
Rol:         CBR ↔ SII ↔ DOM ↔ plano
Propietario: CBR ↔ SII ↔ escritura ↔ herencia
Superficie:  CBR ↔ SII ↔ plano ↔ levantamiento
Dirección:   CBR ↔ SII ↔ CIP ↔ plano
Título:      escritura ↔ inscripción ↔ dominio vigente
Deslindes:   título ↔ plano ↔ levantamiento
```

No inferir consistencia si falta una de las fuentes requeridas.

---

# 21. FINDINGS Y CONCLUSIONES

## 21.1 Categorías

```text
DOCUMENTED_FACT
CALCULATION
CONSISTENCY
DISCREPANCY
INFERENCE
MISSING_EVIDENCE
RISK
RECOMMENDATION_FOR_REVIEW
```

## 21.2 Finding

```ts
interface Finding {
  id: string;
  category: AnalyticalCategory;
  statement: string;

  supportingFactIds: string[];
  evidenceIds: string[];

  confidence:
    | "HIGH"
    | "MEDIUM"
    | "LOW"
    | "UNVERIFIED";

  requiresProfessionalReview: boolean;
}
```

## 21.3 Conclusion

```ts
interface Conclusion {
  id: string;
  category: AnalyticalCategory;
  text: string;

  supportingFactIds: string[];

  confidence:
    | "HIGH"
    | "MEDIUM"
    | "LOW"
    | "UNVERIFIED";

  requiresProfessionalReview: boolean;
}
```

Una conclusión con `supportingFactIds=[]` no puede aprobarse.

Una conclusión no puede contradecir sus hechos de respaldo.

---

# 22. CRITICAL REVIEWER

## 22.1 Arquitectura

La revisión crítica tiene dos capas:

```text
A. DETERMINISTIC REVIEW
B. INDEPENDENT AI REVIEW
```

Para cerrar V1 como `VERIFIED`, ambas deben ejecutarse cuando la credencial/modelo están disponibles.

Si la segunda capa no puede ejecutarse:

```text
criticalReview = BLOCKED
```

no `PASS`.

## 22.2 Revisión determinista

Debe verificar al menos:

- Fact sin Evidence;
- Evidence con documento inexistente;
- Evidence de otro estudio;
- página fuera de rango;
- `originalText` vacío cuando sea requerido;
- cita que no pueda verificarse;
- conclusión sin facts;
- conclusion con fact ID inexistente;
- contradicción de propietarios;
- contradicción de roles;
- títulos `CONFIRMED_LINK` sin evidencia;
- ausencia de certificado presentada como inexistencia;
- mezcla entre estudios;
- entidades no sustentadas;
- resultados topográficos matemáticamente inconsistentes.

## 22.3 Revisión IA independiente

Debe recibir el análisis estructurado + evidencia necesaria, no chain-of-thought previo.

Debe buscar:

- invenciones;
- incompatibilidad entre cita y afirmación;
- cambio de roles;
- cambio de inmueble;
- nombres no documentados;
- interpretación excesiva;
- contradicciones internas;
- conclusiones no respaldadas;
- omisiones críticas evidentes.

Su salida también es estructurada.

## 22.4 Resultado

```ts
interface QualityReview {
  status: "PASS" | "FAIL" | "BLOCKED" | "NOT_EXECUTED";
  issues: ReviewIssue[];
  reviewedAt?: string | null;
}
```

Errores críticos bloquean DOCX.

---

# 23. EVIDENCE GATE

## 23.1 Naturaleza

Evidence Gate es programático y determinista.

La IA no decide si el gate pasa.

## 23.2 Estado

```text
PASS
FAIL
NOT_EXECUTED
```

## 23.3 `NOT_EXECUTED`

Si no existen hechos documentados:

```text
status = NOT_EXECUTED
coverage = 0
passed = false
```

Nunca:

```text
coverage = 100
```

con cero hechos.

## 23.4 Reglas mínimas

Debe fallar por:

1. Fact documentado sin Evidence;
2. documento inexistente;
3. owner/study mismatch;
4. página inválida;
5. cita requerida vacía;
6. evidencia no verificada según política;
7. `CONFIRMED_LINK` sin Evidence válida;
8. conclusión con `supportingFactId` inexistente;
9. conclusión material no sustentada;
10. afirmación de ausencia sin documento pertinente;
11. evidencia sintética creada por código;
12. contaminación entre expedientes;
13. Evidence con `verificationStatus = REVIEW_REQUIRED_FUZZY` cuando no exista revisión humana que la haya adjudicado;
14. Evidence `UNVERIFIED` o `FAILED` usada para sostener un `DOCUMENTED_FACT` material.

Estados automáticamente aceptables para Evidence material en V1:

```text
VERIFIED_EXACT
VERIFIED_NORMALIZED
VISUAL_VERIFIED
```

## 23.5 Cobertura

```text
coverage =
factsWithValidEvidence / documentedFacts
```

Si `documentedFacts == 0`:

```text
coverage = 0
```

---

# 24. GENERACIÓN DOCX

## 24.1 Condición

Solo se genera si:

```text
schemaValidation = PASS
criticalReview   = PASS
evidenceGate     = PASS
```

Si cualquiera no pasa:

```text
DOCX_GENERATION_BLOCKED
```

## 24.2 Fuente

El DOCX usa exclusivamente `Approved CentralAnalysis`.

No hace nuevas inferencias.

## 24.3 Contenido mínimo

1. identificación del estudio;
2. alcance;
3. documentos analizados;
4. hashes;
5. hechos relevantes;
6. cadena de títulos o análisis topográfico;
7. comparaciones;
8. discrepancias;
9. vacíos;
10. conclusiones;
11. advertencia de revisión profesional;
12. anexo de trazabilidad;
13. execution manifest.

## 24.4 Todas las evidencias

Si un Fact posee varias evidencias, el anexo debe incluirlas todas.

No solo `evidence[0]`.

## 24.5 Lenguaje sobre ausencia

Si no hay discrepancias estructuradas, NO escribir:

```text
No existen discrepancias
```

Usar:

```text
No se registraron discrepancias estructuradas en el resultado aprobado.
Esta circunstancia no acredita por sí sola su inexistencia.
```

Si `missingEvidence` está vacío:

```text
No se registraron vacíos documentales estructurados en el resultado aprobado.
Ello no constituye certificación de suficiencia documental absoluta.
```

---

# 25. API REST V1

## 25.1 Health

```text
GET /api/health
```

No exponer secretos.

## 25.2 Studies

```text
GET  /api/studies
POST /api/studies
GET  /api/studies/:studyId
```

## 25.3 Documents

```text
POST /api/studies/:studyId/documents
GET  /api/studies/:studyId/documents
```

Opcional V1:

```text
DELETE /api/studies/:studyId/documents/:documentId
```

## 25.4 Analysis

Endpoints base:

```text
POST /api/studies/:studyId/analyze
GET  /api/studies/:studyId/analysis
```

Para el pipeline por documento, V1 DEBERÍA exponer además:

```text
POST /api/studies/:studyId/documents/:documentId/analyze
POST /api/studies/:studyId/consolidate
GET  /api/jobs/:jobId
```

`POST /analyze` puede ser una fachada que orquesta internamente esos pasos de forma secuencial, siempre que respete presupuesto de memoria/tiempo y no utilice un mega-prompt multi-documento.

Recomendado:

```text
GET /api/studies/:studyId/analyses
GET /api/studies/:studyId/analyses/:analysisRunId
```

## 25.5 Reports

```text
GET /api/studies/:studyId/report/docx
```

Idealmente por run:

```text
GET /api/studies/:studyId/analyses/:analysisRunId/report/docx
```

## 25.6 Authorization invariant

Antes de devolver o modificar recursos:

```text
study.ownerId === currentUser.id
```

Debe aplicarse también a:

- analysis GET;
- report GET;
- documents GET;
- provider credentials cuando exista multiusuario.

Nunca confiar solo en conocer `studyId`.

## 25.7 Errores

Formato:

```ts
interface ApiError {
  error: {
    code: string;
    message: string;
    retryable: boolean;
    details?: unknown;
  };
}
```

Códigos mínimos:

```text
FILE_FORMAT_ERROR
FILE_TOO_LARGE
FILE_SIGNATURE_MISMATCH
STUDY_NOT_FOUND
ACCESS_DENIED
DOCUMENT_BYTES_MISSING
PROVIDER_AUTH_ERROR
PROVIDER_CONNECTION_ERROR
MODEL_UNAVAILABLE
PROVIDER_RESPONSE_ERROR
MODEL_OUTPUT_INVALID_JSON
SCHEMA_VALIDATION_FAILED
SEMANTIC_VALIDATION_FAILED
DATA_CONSISTENCY_ERROR
CRITICAL_REVIEW_FAILED
EVIDENCE_GATE_FAILED
DOCX_GENERATION_BLOCKED
MEMORY_BUDGET_EXCEEDED
ANALYSIS_ASYNC_REQUIRED
MODEL_OUTPUT_TRUNCATED
CLOUD_RUN_STARTUP_FAILED
```

---

# 26. SEGURIDAD

## 26.1 Secretos

Prohibido en:

```text
Git
frontend bundle
localStorage
sessionStorage
logs
audit JSON
error response
URL query string
remote Git URL
```

`.env*` debe estar ignorado, salvo plantilla sin secretos.

## 26.2 Logs

Los logs pueden incluir:

- credentialId;
- provider;
- modelId;
- status;
- duración;
- error code.

No:

- raw key;
- bearer token;
- contenido documental completo salvo modo diagnóstico expresamente autorizado.

## 26.3 Aislamiento

Cada lectura/escritura debe considerar:

```text
ownerId + studyId
```

## 26.4 Archivos

No aceptar rutas locales arbitrarias provenientes del cliente.

Los buffers deben manejarse mediante identificadores internos.

## 26.5 Límites

Configurar:

- body limit;
- multipart size;
- max files;
- timeouts;
- rate limiting para perfil producción.

## 26.6 Identidad de sesión en `LOCAL_PROTOTYPE_MODE`

Mientras no exista Google Auth, el servidor DEBE poder distinguir al menos dos sesiones de prototipo para que las pruebas de aislamiento sean reales.

Preferencia:

```text
server-generated prototypeSessionId
→ signed HttpOnly cookie
→ derived ownerId
```

La cookie de prototipo debe usar `HttpOnly`, `SameSite` apropiado y `Secure` bajo HTTPS.

Está prohibido confiar en un `X-Prototype-User-Id` arbitrario enviado por el navegador como prueba de identidad en el despliegue hospedado. Un header de identidad solo puede existir dentro de tests controlados y deshabilitado en runtime normal.

Este modo NO equivale a autenticación real. Solo permite probar aislamiento lógico mientras Google Auth está diferido.

## 26.7 Restricción de documentos sensibles

Un endpoint Cloud Run público y anónimo con `LOCAL_PROTOTYPE_MODE` debe considerarse `UNSAFE_FOR_CONFIDENTIAL_DOCUMENTS`.

Hasta implementar autenticación real, usar:

- acceso Cloud Run restringido; o
- fixtures/documentos sintéticos; o
- otro control temporal aprobado por ADR.

---

# 27. PERSISTENCIA

## 27.1 V1

La persistencia en memoria está permitida, pero el sistema debe decir:

```text
IN_MEMORY / NON_PERSISTENT
```

Al reiniciar:

- estudios pueden desaparecer;
- documentos pueden desaparecer;
- credenciales desaparecen;
- análisis pueden desaparecer.

## 27.2 Abstracción

Interfaces mínimas:

```ts
StudyRepository
DocumentRepository
AnalysisRepository
CredentialRepository
```

La lógica de negocio no debe acceder directamente a `Map` fuera de la capa de storage.

## 27.3 Futuro

Persistencia real será requisito de `PRODUCTION_READY`.

## 27.4 Implicaciones de Cloud Run + memoria

Los `Map` y buffers de una instancia son **process-local**. Por tanto:

- una segunda instancia no comparte estudios/documentos;
- un restart pierde estado;
- un nuevo deployment pierde estado;
- scale-to-zero pierde estado.

Mientras persista este diseño, `CLOUD_RUN_HOSTED_PROTOTYPE` debe operar con `maxInstances = 1` y declarar visiblemente `NON_PERSISTENT`.

La eliminación de esta restricción requiere un repositorio persistente compartido.

---

# 28. INTERFAZ

## 28.1 Navegación mínima

```text
Dashboard
Estudios
Expediente Documental
Proveedores IA
Centro de Auditoría
```

## 28.2 Acciones obligatorias

En estudio:

```text
[ + Subir antecedentes ]
[ Configurar API ]
[ Analizar antecedentes ]
[ Generar DOCX ]
```

`Generar DOCX` deshabilitado hasta aprobación.

## 28.3 Estados visuales

```text
VERDE:
VERIFIED
PASS

AMARILLO:
ARCHITECTURE_READY
DEFERRED
UNVERIFIED
NOT_EXECUTED
STALE_CACHE

ROJO:
FAILED
BLOCKED
SECURITY_ERROR
```

Los colores derivan de datos backend.

No hardcodear:

```text
Evidence Gate 100% PASS
Google conectado
Proveedor verificado
```

sin estado real.

## 28.4 Resultados

Tabs mínimas:

```text
Resumen
Documentos
Hechos
Evidencias
Cadena de títulos / Topografía
Discrepancias
Vacíos
Revisión
Informe
```

Cada hecho debe permitir:

```text
Ver fuente
```

---

# 29. JOBS Y OBSERVABILIDAD

```ts
interface AnalysisJob {
  id: string;
  ownerId: string;
  studyId: string;
  analysisRunId: string;

  provider: string;
  modelId: string;

  stage: AnalysisStage;
  status:
    | "QUEUED"
    | "RUNNING"
    | "FAILED"
    | "COMPLETED";

  retryable: boolean;

  errorCode?: string | null;
  createdAt: string;
  updatedAt: string;
}
```

La UI puede mostrar:

```text
Analizando documento 1 de 7
Clasificando...
Extrayendo hechos...
Resolviendo propiedad...
Construyendo cadena...
Analizando inconsistencias...
Revisión crítica...
Evidence Gate...
```

Solo etapas reales.

## 29.1 Durabilidad del job

En V1, un `AnalysisJob` en memoria sirve para progreso/estado dentro de una única instancia, pero debe declararse:

```text
JOB_DURABILITY = NON_DURABLE
```

No sobrevive restart ni despliegue.

## 29.2 Prohibición de background no durable

Está prohibido:

```text
HTTP 202
→ response ends
→ untracked Promise continues in same process
```

si el sistema presenta esa operación como durable.

Un `202` de producción requiere cola/worker/persistencia de job.

---

# 30. AUDITORÍA

## 30.1 Archivos obligatorios del Audit Bundle

El bundle generado DEBE contener:

```text
AUDIT_INDEX.json
BUILD_MANIFEST.json
CAPABILITIES.json
REQUIREMENTS_MATRIX.json
RESEARCH_SOURCES.json
MODEL_DISCOVERY.json
TEST_SUMMARY.json
SECURITY_STATUS.json
DEVIATIONS.json
COST_PROFILE.json
```

Ubicación recomendada del artefacto generado:

```text
artifacts/audit/<buildId>/
```

`artifacts/` debe estar ignorado por Git. El directorio fuente `audit/` puede contener scripts, esquemas, plantillas y baselines, pero el build no debe reescribir archivos versionados para insertar timestamps, SHA o resultados dinámicos.

## 30.2 Estados permitidos

```text
PLANNED
DEFERRED
IN_PROGRESS
IMPLEMENTED_UNVERIFIED
VERIFIED
FAILED
BLOCKED
ARCHITECTURE_READY
```

## 30.3 Build manifest

Debe contener el SHA real cuando pueda determinarse sin inventarlo.

```ts
interface BuildManifest {
  buildId: string;
  commitSha: string | null;
  workingTree: "CLEAN" | "DIRTY" | "UNKNOWN";
  specVersion: string;
  appVersion: string;
  builtAt: string;
  nodeVersion: string;
  dependencyLockHash?: string | null;
}
```

Fuentes válidas:

```text
1. GIT_COMMIT_SHA inyectado por CI/build
2. git rev-parse HEAD antes del build
3. null si no puede determinarse
```

Prohibido:

```text
commitSha hardcodeado
```

La generación del manifest debe escribir en el directorio de artefactos/no versionado. No debe modificar el working tree como efecto secundario de `npm run build`, `npm test` o `npm run audit`.

Si no puede determinarse:

```text
commitSha = null
buildStatus = UNVERIFIED
```

## 30.4 Test summary

Debe generarse desde el runner, no editarse a mano.

Cada entrada:

```ts
interface TestResultRecord {
  id: string;
  description: string;
  executed: boolean;
  result: "PASS" | "FAIL" | "BLOCKED" | "SKIPPED";
  durationMs?: number;
  error?: string | null;
  timestamp: string;
  commitSha?: string | null;
}
```

## 30.5 Capabilities

Una capability solo pasa a `VERIFIED` si sus tests obligatorios pasan.

---

# 31. COMANDOS OBLIGATORIOS

```text
npm run lint
npm run build
npm test
npm run audit
npm run audit:bundle
npm run audit:no-mocks
```

Agregar:

```text
npm run test:live
npm run verify
```

`verify` debe orquestar las comprobaciones que no requieren credenciales y reportar por separado las live.

## 31.1 Inicio

Desarrollo:

```text
npm run dev
```

Producción NO debe depender de:

```text
node server.ts
```

salvo que la versión de Node utilizada soporte y se haya verificado explícitamente para ese archivo/configuración.

La ruta recomendada de producción es:

```text
TypeScript server
→ compile/bundle
→ JavaScript artifact
→ node artifact
```

Para el repositorio actual —cuyo baseline usa `build = vite build` y `start = node server.ts`— existe una migración obligatoria del entrypoint de producción. El contrato esperado es equivalente a:

```json
{
  "scripts": {
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=esm --packages=external --outfile=server.js",
    "start": "node server.js"
  }
}
```

Se admite una implementación equivalente mediante `tsc`, Dockerfile u otro bundler si produce el mismo resultado verificable.

El `build` definitivo debe compilar frontend y backend.

Agregar comprobación:

```text
npm run verify:startup
```

que valide, al menos:

```text
dist/index.html exists
server.js exists
PORT=<test> K_SERVICE=<test> NODE_ENV=production node server.js
GET /api/health = 200
```

---

# 32. PRUEBAS DE ACEPTACIÓN

## 32.1 Offline obligatorias

### T-DOC-003 — SHA-256

Input:

```text
bytes conocidos
```

Pass:

```text
DocumentService hash === crypto independent hash
```

### T-DOC-004 — formato inválido

`.exe` o firma incompatible:

```text
FILE_FORMAT_ERROR
```

### T-EVD-001 — Fact sin Evidence

Debe fallar gate.

### T-EVD-002 — página fuera de rango

Debe fallar gate.

### T-EVD-003 — cero hechos

```text
NOT_EXECUTED
coverage = 0
```

### T-CROSS-001 — contaminación

Documento de otro estudio/owner:

```text
ACCESS_DENIED / DATA_CONSISTENCY_ERROR
```

### T-ENC-001 — ausencia de certificado

No puede producir:

```text
NO_ENCUMBRANCES_RECORDED
```

como conclusión positiva sin respaldo.

### T-AI-003 — JSON inválido

Provider test double devuelve JSON truncado.

Esperado:

```text
MODEL_OUTPUT_INVALID_JSON
analysis not approved
DOCX blocked
```

### T-AI-004 — modelo deprecado/no permitido

Validación de política de modelo, separada de JSON.

### T-REV-001 — contradicción

Fact:

```text
owner = Persona A
```

Conclusion:

```text
owner = Persona B
```

Esperado:

```text
criticalReview = FAIL
DOCX blocked
```

### T-DOCX-001 — gate

Si cualquier compuerta no es PASS:

```text
DOCX_GENERATION_BLOCKED
```

### T-TOPO-001 — aritmética

Conversiones y diferencias con resultados deterministas.

### T-SEC-001 — análisis ajeno

Usuario A no puede leer análisis de B.

### T-SEC-002 — reporte ajeno

Usuario A no puede descargar DOCX de B.

### T-SEC-003 — sesiones de prototipo separadas

Crear dos sesiones server-side distintas.

Esperado:

```text
ownerId A != ownerId B
A cannot access B resources
B cannot access A resources
```

### T-EVD-004 — normalización conservadora

Una cita que difiere solo por whitespace/salto de línea/Unicode equivalente debe poder resultar:

```text
VERIFIED_NORMALIZED
```

sin modificar dígitos o identificadores materiales.

### T-EVD-005 — fuzzy no auto-verifica

Una cita OCR similar pero no exacta debe resultar:

```text
REVIEW_REQUIRED_FUZZY
```

y no puede por sí sola hacer pasar Evidence Gate.

### T-MEM-001 — límites de carga

Debe rechazar:

- archivo > `maxBytesPerFile`;
- request > `maxBytesPerUploadRequest`;
- carga que supere el presupuesto de memoria del estudio/proceso.

### T-MEM-002 — concurrencia IA

Con default V1, dos documentos no deben mantenerse simultáneamente como payload Base64 activo hacia el proveedor.

### T-PIPE-001 — procesamiento por documento

Con test double del provider y tres documentos:

```text
3 documents
→ 3 extraction calls
→ 3 DocumentAnalysisArtifact
→ 1 consolidation
```

No una llamada de extracción con los tres PDFs.

### T-DEPLOY-001 — artefactos de producción

`npm run build` debe producir:

```text
dist/index.html
server.js
```

### T-DEPLOY-002 — Cloud Run startup contract

Arrancar con variables de prueba:

```text
PORT=3000
K_SERVICE=test-service
NODE_ENV=production
```

Esperado:

```text
process remains alive
listens 0.0.0.0:3000
GET /api/health = 200
```

### T-DEPLOY-003 — no Vite dev en Cloud Run

Con `K_SERVICE` definido, el servidor no debe crear Vite middleware de desarrollo.

### T-AUDIT-001 — auditoría reproducible

Generar Audit Bundle no debe modificar archivos tracked. El `commitSha` debe ser el real o `null/UNVERIFIED`.

## 32.2 Live obligatorias para certificar IA

### T-DOC-001-LIVE — contenido real

Fixture PDF contiene únicamente dentro de sus bytes/página:

```text
ROL DE AVALÚO: 777-88
```

Flujo:

```text
fixture bytes
→ upload
→ single-document provider extraction
→ DocumentAnalysisArtifact
→ selected model
→ Fact ROL_AVALUO = 777-88
→ Evidence
→ page = 1
→ originalText verificable
```

Si no existe API key:

```text
BLOCKED
```

No PASS.

Si el modelo falla:

```text
FAIL
```

### T-DOC-002-LIVE — independencia de filename

Mismos bytes:

```text
sample-inscripcion.pdf
archivo-sin-relacion-con-el-contenido.pdf
```

Ejecutar dos análisis.

Comparar resultados sustantivos normalizados:

- facts;
- valores;
- title references;
- property data.

El filename puede diferir dentro de `Evidence.fileName`; el contenido sustantivo debe ser equivalente.

Comparar solo SHA no satisface el test.

### T-MODEL-001-LIVE — modelo exacto

Debe probar que la solicitud se envió al `modelId` seleccionado.

No alias.

### T-STRUCT-001-LIVE — structured output

Verifica que:

- schema enforcement se envía cuando está soportado;
- respuesta parsea;
- Zod pasa.

### T-REV-002-LIVE — reviewer IA

Inyectar caso estructurado con contradicción controlada y exigir detección.

---

# 33. REGLAS DEL RUNNER DE TESTS

Está prohibido:

```ts
try {
  await importantLiveTest()
} catch (e) {
  console.log(e)
}
```

si luego la suite puede terminar PASS.

Todo test obligatorio debe registrar:

```text
PASS
FAIL
BLOCKED
```

y modificar el exit code según el perfil.

Política recomendada:

```text
npm test
→ offline
→ FAIL si cualquier test offline falla

npm run test:live
→ live
→ FAIL si existe credencial y prueba falla
→ BLOCKED si no existe credencial

npm run verify
→ resume ambos
```

Una release candidata `VERIFIED` requiere live tests PASS.

---

# 34. `audit:no-mocks`

Debe detectar en producción:

- nombres/facts de demo conocidos;
- `fakeData`;
- `mock*` usados en runtime;
- `simulateAnalysis`;
- evidence originalText generado para aparentar cita;
- detección jurídica por filename;
- SHA de commit fijo;
- `schemaValidationPass = true` fijo;
- `criticalReviewPass = true` fijo;
- badges/verificaciones fijas.

No debe penalizar fixtures dentro de:

```text
tests/
fixtures/
```

El script debe salir con código distinto de cero si detecta infracciones.

---

# 35. PROMPTS

## 35.1 Versionado

Cada prompt:

```text
name
version
module
stage
hash
```

## 35.2 Prohibiciones

No incluir datos de ejemplo que puedan filtrarse a resultados.

No pedir chain-of-thought.

## 35.3 Reglas obligatorias en prompts de extracción

- usar solo documentos;
- no inventar;
- preservar valor original;
- cada Fact material con Evidence;
- `NO CONSTA EN ANTECEDENTES` para ausencias;
- distinguir inferencia;
- no declarar ausencia jurídica sin documento.

## 35.4 Uso real

Los archivos de `prompts/` deben cargarse o incorporarse programáticamente.

No basta con tenerlos versionados si runtime no los utiliza.

---

# 36. CONFIGURACIÓN

Toda configuración operacional debe centralizarse:

```ts
interface AppConfig {
  environment: "FREE_PROTOTYPE" | "PRODUCTION";

  maxFilesPerUpload: number;          // V1 default 5
  maxBytesPerFile: number;            // V1 default 15 MiB
  maxBytesPerUploadRequest: number;   // V1 default 60 MiB
  maxStoredBytesPerStudy: number;     // V1 default 75 MiB
  maxStoredBytesPerProcess: number;   // V1 default 150 MiB
  aiFileConcurrency: number;          // V1 default 1

  defaultProvider?: string | null;
  preferredModelId?: string | null;
  modelFallbackPolicy: "BLOCK" | "USER_APPROVED";

  evidencePolicy: EvidencePolicy;

  hostedOnCloudRun: boolean;
  prototypeSessionMode: boolean;
  cloudRunRequestTimeoutMs?: number | null;
  syncAnalysisBudgetMs?: number | null;
  requestTimeoutSafetyMarginMs?: number | null;
}
```

No duplicar valores en componentes, server y tests.

---

# 37. VERSIONADO

## 37.1 Especificación

Cambio incompatible:

```text
major version
```

Nueva capacidad compatible:

```text
minor version
```

Corrección editorial:

```text
patch
```

## 37.2 Aplicación

`package.json`, `BUILD_MANIFEST.json` y UI deben reflejar una versión coherente.

No mantener:

```text
package version 0.0.0
audit version 1.0.0
```

sin explicación.

---

# 38. CONTROL DE CAMBIOS

Toda desviación de esta especificación debe:

1. quedar documentada;
2. indicar motivo;
3. impacto;
4. riesgo;
5. fecha;
6. estado;
7. aprobación.

Usar:

```text
docs/decisions/ADR-*.md
audit/DEVIATIONS.json
```

Un agente no puede redefinir la arquitectura por conveniencia sin ADR.

---

# 39. DEFINICIÓN DE TERMINADO — FREE_PROTOTYPE_V1

La versión puede declararse `FREE_PROTOTYPE_V1 VERIFIED` solo si:

```text
[ ] aplicación compila frontend
[ ] backend compila a artefacto JavaScript de producción
[ ] backend inicia correctamente con PORT dinámico y bind 0.0.0.0
[ ] /api/health devuelve 200 en perfil Cloud Run
[ ] K_SERVICE no inicia Vite dev middleware
[ ] Cloud Run usa maxInstances=1 y concurrency=1 mientras el storage siga IN_MEMORY
[ ] error de startup se diagnostica con logs antes de modificar timeouts
[ ] no existen secretos en repo
[ ] estudio puede crearse
[ ] multi-upload funciona dentro de límites V1
[ ] presupuesto de memoria y concurrencia está aplicado
[ ] procesamiento IA es documento-por-documento
[ ] consolidación opera sobre artefactos estructurados
[ ] formatos V1 se validan
[ ] SHA-256 pasa
[ ] bytes reales llegan a Gemini
[ ] model discovery no inventa modelos
[ ] modelId seleccionado es el usado
[ ] no existe fallback silencioso; USER_APPROVED queda auditado
[ ] T-DOC-001-LIVE pasa
[ ] T-DOC-002-LIVE pasa
[ ] structured output está verificado o su limitación está declarada
[ ] Zod valida CentralAnalysis
[ ] Evidence no se fabrica
[ ] Evidence Gate pasa tests
[ ] Critical Reviewer pasa tests
[ ] rutas sensibles validan ownerId
[ ] sesiones de prototipo separadas pasan T-SEC-003
[ ] DOCX se bloquea ante cualquier gate fallido
[ ] DOCX aprobado contiene trazabilidad completa
[ ] TEST_SUMMARY deriva del runner
[ ] BUILD_MANIFEST contiene SHA real o null/UNVERIFIED
[ ] generar auditoría no ensucia archivos tracked
[ ] CAPABILITIES no exagera estado
[ ] audit:no-mocks falla cuando corresponde
[ ] npm run lint PASS
[ ] npm run build PASS
[ ] npm test PASS
[ ] npm run audit PASS
```

Si una prueba live está bloqueada por credencial:

```text
RELEASE STATUS = IMPLEMENTED_UNVERIFIED / BLOCKED
```

no `VERIFIED`.

---

# 40. DEFINITION OF DONE — PRODUCTION_READY

Además de V1:

```text
[ ] autenticación real
[ ] persistencia real
[ ] Drive real si se mantiene como requisito
[ ] almacenamiento seguro de secretos
[ ] despliegue reproducible
[ ] aislamiento multiusuario probado
[ ] políticas de backup
[ ] logging seguro
[ ] observabilidad
[ ] rate limiting
[ ] retención de datos
[ ] eliminación de datos
[ ] recuperación ante fallos
[ ] AnalysisJob durable + queue/worker
[ ] almacenamiento compartido compatible con múltiples instancias
[ ] Cloud Run multi-instancia sin estado process-local
[ ] escaneo de dependencias
[ ] pruebas de seguridad
```

---

# 41. ROADMAP POST-V1

## Fase A — Núcleo verificable

Objetivo:

```text
Cloud Run startup contract
Document Core con límites de memoria
Pipeline por documento
Gemini
Structured Output
Evidence
Critical Review
Evidence Gate
DOCX
Audit
```

## Fase B — Identidad y persistencia

```text
Google/Firebase Auth
Persistent Storage
repository abstraction implementation
```

## Fase C — Google Drive

```text
OAuth permission
Picker
drive.file
fileId
real bytes
Document Core
```

## Fase D — Multi-provider

```text
OpenAI
OpenRouter
OpenAI-compatible
```

## Fase E — Production

```text
managed deployment hardening
secret management
durable queues/workers
persistent object storage
monitoring
```

---

# 42. MATRIZ DE CAPACIDADES V1

| Capability | V1 Required | Verification |
|---|---:|---|
| Crear estudio | Sí | API/UI test |
| Multi-upload local | Sí | integration test |
| Cloud Run startup | Sí cuando se hospeda | T-DEPLOY-* |
| Presupuesto de memoria | Sí | T-MEM-* |
| Pipeline por documento | Sí | T-PIPE-001 + live |
| SHA-256 real | Sí | T-DOC-003 |
| MIME/firma binaria | Sí | T-DOC-004 + signature tests |
| Page count PDF | Sí | document test |
| Gemini real | Sí | T-DOC-001-LIVE |
| Modelo exacto | Sí | T-MODEL-001-LIVE |
| Fallback controlado | Sí | model selection tests |
| Discovery real | Sí | live provider test |
| Structured output | Sí cuando soportado | T-STRUCT-001-LIVE |
| Zod | Sí | schema tests |
| Fact/Evidence | Sí | T-EVD-* |
| Quote verification escalonada | Sí | T-EVD-004/T-EVD-005 |
| Title chain | Sí para TITLE_STUDY | title tests |
| Topographic arithmetic | Sí para TOPOGRAPHIC_STUDY | T-TOPO-* |
| Critical Review | Sí | T-REV-* |
| Evidence Gate | Sí | T-EVD-* |
| DOCX | Sí | T-DOCX-* |
| Audit Bundle | Sí | T-AUDIT-001 + audit tests |
| Sesión prototipo aislable | Sí mientras Auth esté deferred | T-SEC-003 |
| Google Auth | No | DEFERRED |
| Google Drive | No | DEFERRED |
| Firestore | No | DEFERRED |
| OpenAI | No | ARCHITECTURE_READY |
| OpenRouter | No | ARCHITECTURE_READY |

---

# 43. SNAPSHOT DE IMPLEMENTACIÓN AL BASELINE REVISADO

> Esta sección es informativa, no normativa. Puede quedar obsoleta después de nuevos commits.

Baseline:

```text
86ab7edc69b0f2d37b962977ff9452d9d5d876d0
```

Observaciones del baseline revisado:

| Área | Estado observado |
|---|---|
| Repositorio sincronizado | IMPLEMENTED |
| Multi-upload | IMPLEMENTED |
| SHA-256 | IMPLEMENTED |
| Buffers reales enviados a Gemini | IMPLEMENTED |
| `gemini-3.6-flash` sin alias silencioso | IMPLEMENTED |
| Credential Store en memoria | IMPLEMENTED |
| Zod después del análisis | IMPLEMENTED |
| `NOT_EXECUTED` con cero hechos | IMPLEMENTED |
| Google Auth / Drive | DEFERRED |
| Structured output con schema completo | IMPLEMENTED_UNVERIFIED / parcial |
| Model discovery sin valores sintéticos | PENDIENTE |
| Evidencia semánticamente verificable | PENDIENTE |
| Critical Reviewer completo | PENDIENTE |
| Live test obligatorio de Gemini | PENDIENTE |
| Test filename a nivel de análisis | PENDIENTE |
| SHA real de commit en manifest | PENDIENTE |
| autorización GET analysis/DOCX | PENDIENTE |
| Audit status totalmente coherente | PENDIENTE |
| persistencia durable | DEFERRED |
| Cloud Run revision actual | FAILED / container no inicia según error reportado |
| Build backend a `server.js` | PENDIENTE en baseline |
| Cloud Run health contract | PENDIENTE |
| Límites seguros 5×15 MiB + presupuesto agregado | PENDIENTE |
| Pipeline documento-por-documento | PENDIENTE |
| Verificación Evidence escalonada | PENDIENTE |
| Sesiones de prototipo separables | PENDIENTE |
| Audit Bundle generado fuera de tracked files | PENDIENTE |

Esta tabla NO debe utilizarse para declarar PASS en auditoría; los estados finales provienen del runner y del Audit Bundle.

---

# 43.1 MATRIZ DE INCORPORACIÓN DE REVISIÓN TÉCNICA EXTERNA

Esta revisión `1.1.0` incorpora explícitamente los siguientes riesgos y decisiones:

| Observación | Decisión normativa |
|---|---|
| Riesgo OOM por 20×30 MiB y Base64 | ACEPTADA: 5 archivos, 15 MiB, presupuesto agregado y concurrencia IA 1 |
| Usar `/tmp` como solución de RAM en Cloud Run | NO ADOPTADA como solución: scratch temporal cuenta dentro del presupuesto de instancia |
| Mega-prompt con todo el expediente | ACEPTADA: análisis por documento + consolidación estructurada |
| Riesgo de truncamiento de output | ACEPTADA: outputs acotados por documento y `MODEL_OUTPUT_TRUNCATED` |
| Análisis necesariamente asíncrono | PARCIAL: síncrono acotado en prototipo; durable queue/worker obligatorio en producción |
| `202` + Promise en background | PROHIBIDO si no existe ejecución durable |
| Fallback automático de modelo | RECHAZADO: default `BLOCK`; alternativo solo `USER_APPROVED` |
| Fuzzy > umbral = Evidence válida | RECHAZADO: fuzzy solo `REVIEW_REQUIRED_FUZZY` |
| Normalización textual | ACEPTADA con reglas conservadoras que preservan identificadores materiales |
| `commitSha` dinámico ensucia Git | RESUELTO: Audit Bundle generado en artefactos no tracked |
| Usuario prototipo estático invalida aislamiento | ACEPTADA: sesión server-side separable y T-SEC-003 |
| Cloud Run no escucha PORT actualmente | ACEPTADA como P0: backend compilado, `node server.js`, `K_SERVICE`, `PORT`, `0.0.0.0`, `/api/health` |

---

# 44. PROHIBICIONES DEFINITIVAS

Queda prohibido en runtime de producción:

```text
datos demo presentados como reales
hechos legales hardcodeados
personas ficticias usadas como resultado
roles/fojas/superficies fijas
clasificación sustantiva por filename
fallback con análisis sintético
fallback silencioso de modelId
mega-prompt multi-documento como estrategia por defecto
HTTP 202 con background Promise no durable
fuzzy matching convertido automáticamente en Evidence VERIFIED
fake Google connection
fake Drive
fake latency/test success
model list inventada
evidence originalText inventado
criticalReviewPass = true fijo
schemaValidationPass = true fijo
evidenceGate = PASS fijo
coverage 100 con cero facts
commit SHA fijo
API keys en frontend
API keys en Git
API keys en logs
cross-study access
DOCX sin gates
```

Los fixtures de `tests/` son permitidos y deben estar claramente aislados.

---

# 45. CRITERIO DE DECISIÓN ANTE AMBIGÜEDAD

Si el sistema debe elegir entre:

```text
A) entregar un resultado completo pero no verificable
B) entregar un resultado incompleto y declarar la incertidumbre
```

DEBE elegir:

```text
B
```

Si debe elegir entre:

```text
A) afirmar ausencia
B) indicar evidencia insuficiente
```

DEBE elegir:

```text
B
```

Si debe elegir entre:

```text
A) continuar con un proveedor/modelo no verificado
B) bloquear y explicar
```

DEBE elegir:

```text
B
```

---

# 46. RESULTADO OBJETIVO

La versión definitiva del flujo V1 es:

```text
CREAR ESTUDIO
→ SUBIR ANTECEDENTES REALES
→ VALIDAR BYTES
→ CALCULAR SHA-256
→ CONFIGURAR API SERVER-SIDE
→ DESCUBRIR MODELO
→ SELECCIONAR MODELO
→ ANALIZAR DOCUMENTOS REALES
→ OBTENER JSON ESTRUCTURADO
→ VALIDAR ZOD
→ VERIFICAR EVIDENCIA
→ CONSTRUIR HECHOS / RELACIONES
→ ANALIZAR TÍTULOS O TOPOGRAFÍA
→ DETECTAR VACÍOS / DISCREPANCIAS
→ CRITICAL REVIEW
→ EVIDENCE GATE
→ APROBAR CENTRAL ANALYSIS
→ GENERAR DOCX
→ AUDIT BUNDLE
```

Ninguna etapa posterior puede convertir una etapa previa fallida en PASS.

---

# 47. CLÁUSULA FINAL

Esta plataforma se considera correctamente implementada cuando el sistema puede demostrar, mediante código, pruebas y trazabilidad, que:

> cada conclusión material deriva de antecedentes reales identificables; cada hecho documental relevante conserva su fuente; las ausencias se reportan como ausencia de evidencia y no como inexistencia; los fallos permanecen visibles; y ningún estado de verificación se declara sin prueba ejecutada.

La exactitud y trazabilidad prevalecen sobre apariencia, velocidad y completitud.