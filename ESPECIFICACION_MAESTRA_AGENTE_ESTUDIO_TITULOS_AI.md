# ESPECIFICACIÓN MAESTRA DEL PROYECTO
## Plataforma modular de análisis documental técnico-jurídico con IA
### Instrucciones obligatorias para el agente desarrollador de Google AI Studio

**Estado:** ESPECIFICACIÓN MAESTRA  
**Modo inicial:** `FREE_PROTOTYPE`  
**Objetivo del agente:** terminar la aplicación completa de extremo a extremo, dejando código, pruebas, documentación y trazabilidad suficientes para una auditoría externa.

---

# 0. REGLA PRINCIPAL

Este proyecto se construye **desde cero**.

El proyecto anterior se considera solamente una referencia de errores que no deben repetirse.

Está prohibido trasladar desde proyectos anteriores:

- datos demo o expedientes ficticios;
- propietarios, RUT, roles, superficies, deslindes, inscripciones o CBR inventados;
- fallbacks que generen resultados ficticios;
- Google Drive simulado;
- autenticación simulada;
- almacenamiento inseguro de secretos;
- modelos hardcodeados como única fuente de verdad;
- análisis basado solamente en filename, MIME o cantidad de páginas;
- conclusiones jurídicas precargadas;
- valores topográficos de ejemplo usados como datos reales.

Si una integración no está implementada, debe declararse como `NOT_IMPLEMENTED`, `PLANNED`, `BLOCKED` o `ARCHITECTURE_READY`. Nunca presentarla como funcional.

---

# 1. FINALIDAD DE LA APLICACIÓN

La aplicación se desarrolla para asistir en la elaboración de **informes técnico-jurídicos basados en documentos reales**, comenzando por:

1. **Estudios de Títulos de inmuebles en Chile**.
2. **Análisis Topográficos documentales y comparativos**.

La arquitectura debe permitir incorporar futuros módulos, por ejemplo:

- auditoría predial;
- revisión de subdivisiones;
- due diligence inmobiliaria;
- informes técnico-legales;
- análisis urbanístico;
- peritajes documentales;
- revisión de planos;
- otros tipos de informe definidos posteriormente.

La función principal es:

> recibir documentos reales, analizarlos con IA, extraer hechos verificables, relacionarlos, detectar inconsistencias y vacíos, producir conclusiones respaldadas por evidencia y generar un informe auditable.

La aplicación **no reemplaza la revisión profesional** ni debe presentar como certeza jurídica una inferencia no respaldada.

La exactitud y trazabilidad tienen prioridad sobre la completitud.

Si un hecho no puede verificarse, usar:

`NO CONSTA EN ANTECEDENTES`

o el estado estructurado correspondiente.

Nunca inventar para completar un informe.

---

# 2. PRINCIPIOS NO NEGOCIABLES

## 2.1 La IA debe estudiar el contenido real

La IA/API debe recibir el archivo real o una representación fiel y trazable de su contenido.

Nunca considerar suficiente:

- nombre del archivo;
- extensión;
- MIME;
- tamaño;
- número de páginas;
- metadata del estudio;
- datos ingresados manualmente.

Debe existir una prueba objetiva que demuestre que el modelo recibió el contenido correcto.

## 2.2 Cadena de trazabilidad

Toda la arquitectura documental debe seguir:

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

## 2.3 Los fallos deben fallar

Si una API o modelo falla:

- registrar el fallo;
- marcar el job como `FAILED`;
- indicar si es reintentable;
- permitir reintento cuando corresponda.

Está prohibido reemplazar un fallo por un estudio ficticio.

## 2.4 Separar análisis de presentación

La IA produce datos estructurados.

El DOCX se genera después desde un JSON validado.

La IA no controla directamente el Word final.

## 2.5 Modularidad

Autenticación, documentos, IA, evidencia, jobs, auditoría, seguridad y almacenamiento deben ser independientes de los módulos de informe.

---

# 3. FASE 0 OBLIGATORIA — INVESTIGACIÓN TÉCNICA

Antes de programar integraciones relevantes, ejecutar:

```text
PHASE 0 — TECHNICAL RESEARCH
```

Consultar prioritariamente fuentes oficiales:

- `ai.google.dev`
- `firebase.google.com`
- `cloud.google.com`
- `developers.google.com`
- documentación oficial de OpenAI/OpenRouter cuando corresponda

Crear:

```text
docs/RESEARCH_BASELINE.md
audit/RESEARCH_SOURCES.json
```

Registrar por tema:

- fecha;
- producto;
- SDK;
- API;
- versión;
- endpoint;
- capacidades;
- límites;
- autenticación;
- costos/free tier;
- fuente oficial;
- decisión adoptada.

No asumir que información conocida previamente sigue vigente.

---

# 4. GEMINI

La primera implementación funcional debe soportar y probar expresamente:

```text
gemini-3.6-flash
```

Antes de implementarlo, confirmar oficialmente:

- disponibilidad actual del model ID;
- método recomendado de invocación;
- SDK vigente;
- Files API o mecanismo equivalente;
- PDF;
- imágenes;
- structured output;
- descubrimiento de modelos;
- límites de tamaño;
- límites de contexto;
- autenticación;
- condiciones del free tier.

**No hardcodear `gemini-3.6-flash` como único modelo.**

Debe ser el primer modelo certificado, no el único modelo futuro.

---

# 5. OBJETIVO DE COSTO

El prototipo se ejecutará bajo:

```text
FREE_PROTOTYPE
```

Objetivo:

> desarrollar, probar y utilizar la primera versión sin costo mientras sea posible dentro de los niveles gratuitos vigentes.

Reglas:

1. No activar servicios pagados sin autorización explícita.
2. No exigir billing si existe una alternativa gratuita razonable.
3. Verificar el costo real antes de integrar cada servicio.
4. Si un servicio requiere billing, documentarlo para `PRODUCTION_READY`.
5. Mantener arquitectura preparada para migrar a producción.

Crear:

```text
audit/COST_PROFILE.json
```

Debe indicar:

- servicio;
- propósito;
- si requiere billing;
- nivel gratuito;
- alternativa de prototipo;
- estado.

---

# 6. ARQUITECTURA OBJETIVO

## FREE_PROTOTYPE

Preferir, previa verificación actual:

```text
Firebase Hosting
Firebase Authentication
Firestore
Google Drive / Google Picker
Firebase AI Logic o mecanismo Google equivalente vigente
Gemini Developer API
gemini-3.6-flash
```

Durante el prototipo, Google Drive puede servir como repositorio de archivos para evitar servicios que exijan facturación.

## PRODUCTION_READY

La arquitectura debe quedar preparada para incorporar:

```text
Cloud Run
Cloud Tasks
Cloud Storage
Secret Manager
Cloud KMS
OpenAI
OpenRouter
OpenAI-compatible APIs
```

No es obligatorio habilitar servicios que impliquen costo durante `FREE_PROTOTYPE`.

---

# 7. ESTRUCTURA MODULAR

Separar al menos:

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
│   └── security/
│
├── modules/
│   ├── title-study/
│   └── topography/
│
├── prompts/
└── schemas/
```

La estructura puede adaptarse, pero el desacoplamiento es obligatorio.

---

# 8. REGISTRO DE MÓDULOS

Los tipos de informe deben provenir de un registro, no de lógica dispersa.

Interfaz conceptual:

```ts
interface ReportModule {
  id: string;
  version: string;
  name: string;
  requiredCapabilities: string[];

  buildAnalysisPlan(context: StudyContext): AnalysisStage[];
  validate(result: CentralAnalysis): ValidationResult;
  buildReport(result: CentralAnalysis): Promise<ReportArtifact>;
}
```

Módulos iniciales:

```text
TITLE_STUDY
TOPOGRAPHIC_STUDY
```

Debe ser posible agregar un nuevo módulo sin reescribir Document Core ni Provider Gateway.

---

# 9. MODELO DE ESTUDIO

Un estudio puede contener múltiples documentos y múltiples análisis.

```text
Study
├── Documents
├── Facts
├── Entities
├── Relations
└── Analyses
    ├── TitleStudyAnalysis
    ├── TopographicAnalysis
    └── FutureModuleAnalysis
```

Un mismo expediente debe poder alimentar varios módulos.

---

# 10. AUTENTICACIÓN

Usar autenticación Google real mediante Firebase Authentication o mecanismo oficial equivalente verificado.

Requisitos:

- Google Sign-In;
- nombre;
- correo;
- fotografía;
- logout real;
- user ID estable;
- sesión verificable.

No mostrar “Cuenta Google Verificada” si no existe verificación real.

Cada usuario accede solo a:

- sus estudios;
- documentos;
- análisis;
- informes;
- logs;
- auditoría;
- configuraciones.

---

# 11. GOOGLE DRIVE

Google Sign-In y Drive son permisos distintos.

Implementar Google Picker/Drive con scopes mínimos.

Preferir `drive.file` si continúa siendo la opción oficial adecuada al momento de implementación.

Flujo:

```text
Google Sign-In
   ↓
Autorizar Drive
   ↓
Google Picker
   ↓
Usuario selecciona archivo
   ↓
fileId
   ↓
Document Core
```

No usar archivos demo ni una lista simulada de Drive.

---

# 12. DOCUMENT CORE

Crear un servicio central de ingestión.

Responsabilidades:

1. recibir archivo local o Drive;
2. obtener bytes reales;
3. validar formato;
4. calcular SHA-256 real;
5. detectar MIME;
6. determinar páginas cuando sea posible;
7. mantener referencia al original;
8. preparar input para IA;
9. conservar mapeo de evidencia;
10. impedir contaminación entre estudios.

Modelo conceptual:

```ts
interface StudyDocument {
  id: string;
  userId: string;
  studyId: string;
  originalName: string;
  mimeType: string;
  size: number;
  sha256: string;
  source: "local" | "drive";
  driveFileId?: string;
  status: DocumentStatus;
  pageCount?: number | null;
  readingQuality?: ReadingQuality | null;
  createdAt: string;
}
```

---

# 13. SHA-256 REAL

Incorrecto:

```text
sha256-<uuid>
```

Correcto:

```text
SHA256(bytes reales)
```

Agregar test independiente.

---

# 14. ESTADOS DOCUMENTALES

Al subir:

```text
UPLOADED
```

Estados sugeridos:

```text
UPLOADED
PREPARING
READY_FOR_AI
ANALYZING
PROCESSED
FAILED
```

Calidad:

```text
HIGH
MEDIUM
LOW
UNREADABLE
UNKNOWN
```

No marcar calidad óptima antes de leer el archivo.

---

# 15. FORMATOS

Inicialmente:

- PDF;
- DOCX;
- JPG;
- JPEG;
- PNG.

No usar OCR cuando el PDF ya contiene texto útil.

OCR solo cuando sea necesario.

---

# 16. DOCUMENTO PREPARADO

```ts
interface PreparedDocument {
  documentId: string;
  fileName: string;
  mimeType: string;
  sha256: string;
  pageCount: number | null;
  providerFileReference?: string;
  pages?: PreparedPage[];
}
```

Si el proveedor admite el archivo:

```text
FILE REAL → PROVIDER
```

Si no:

```text
FILE REAL
→ extracción fiel
→ representación estructurada
→ PROVIDER
```

Nunca enviar solo metadata.

---

# 17. PROVIDER GATEWAY

Diseñar desde el principio para:

```text
Google Gemini
OpenAI
OpenRouter
OpenAI-compatible
```

Interfaz conceptual:

```ts
interface AIProvider {
  type: AIProviderType;

  listModels(
    credential: CredentialReference
  ): Promise<ModelInfo[]>;

  getModelCapabilities(
    modelId: string
  ): Promise<ModelCapabilities>;

  testConnection(
    credential: CredentialReference,
    modelId?: string
  ): Promise<ConnectionResult>;

  analyze(
    request: AIAnalysisRequest
  ): Promise<AIAnalysisResponse>;
}
```

---

# 18. CAPACIDADES DE MODELOS

```ts
interface ModelCapabilities {
  text: boolean;
  image: boolean;
  pdf: boolean;
  structuredOutput: boolean;
  reasoning: boolean;
  maxInputTokens?: number;
  maxOutputTokens?: number;
}
```

El motor debe elegir únicamente modelos compatibles con la fase.

---

# 19. MODELOS DINÁMICOS

Cuando la API lo permita:

```text
credential
   ↓
listModels()
   ↓
normalizeModelId()
   ↓
capabilities
   ↓
cache con timestamp
```

No usar catálogos rígidos como fuente principal.

Si la sincronización falla:

- no inventar modelos;
- cache previa solo como `STALE_CACHE`.

---

# 20. MULTI CREDENCIAL

Permitir varias credenciales por proveedor.

Cada una tendrá:

- ID;
- alias;
- provider;
- enabled;
- priority;
- defaultModel;
- enabledModels;
- última prueba;
- estado;
- referencia segura del secreto.

Nunca devolver claves completas al navegador.

---

# 21. SEGURIDAD DE API KEYS

Durante `FREE_PROTOTYPE`:

- no implementar almacenamiento inseguro solo para aparentar multi-API;
- si no existe backend seguro, OpenAI/OpenRouter pueden quedar `ARCHITECTURE_READY`.

En producción:

- Secret Manager para secretos propios;
- KMS/servicio seguro equivalente para claves de usuario cuando corresponda.

Nunca:

```text
localStorage
frontend bundle
GitHub
Firestore plaintext
logs
rawApiKey
```

---

# 22. ORQUESTADOR DE ANÁLISIS

No usar un único prompt “lee esto y haz un informe”.

Fases:

```text
01 CLASSIFICATION
02 EXTRACTION
03 ENTITY_RESOLUTION
04 PROPERTY_RESOLUTION
05 TITLE_CHAIN
06 TIMELINE
07 CROSS_DOCUMENT_ANALYSIS
08 MISSING_EVIDENCE
09 LEGAL_TECHNICAL_ANALYSIS
10 CRITICAL_REVIEW
11 EVIDENCE_GATE
12 REPORT_DRAFT
```

Cada fase debe devolver salida estructurada.

No pedir ni almacenar chain-of-thought.

---

# 23. CLASIFICACIÓN

Analizar documento real.

Tipos iniciales:

```text
INSCRIPCION_DOMINIO
DOMINIO_VIGENTE
ESCRITURA_PUBLICA
POSESION_EFECTIVA
INSCRIPCION_ESPECIAL_HERENCIA
CERTIFICADO_HIPOTECAS_GRAVAMENES
CERTIFICADO_PROHIBICIONES
CERTIFICADO_SII
AVALUO_FISCAL
CIP
PLANO
RESOLUCION
SUBDIVISION
LEVANTAMIENTO_TOPOGRAFICO
COMPROBANTE
OTRO
```

No clasificar solo por filename.

---

# 24. EXTRACCIÓN POR DOCUMENTO

Extraer cuando corresponda:

- Rol;
- dirección;
- comuna;
- región;
- inmueble;
- fojas;
- número;
- año;
- repertorio;
- CBR;
- Notaría;
- escritura;
- fecha;
- vendedor;
- comprador;
- causante;
- heredero;
- adjudicatario;
- propietario;
- RUT;
- derechos;
- porcentajes;
- precio;
- superficie;
- unidades;
- deslindes;
- colindantes;
- título antecedente;
- anotaciones;
- hipotecas;
- gravámenes;
- prohibiciones;
- servidumbres;
- usufructos;
- embargos;
- resoluciones;
- planos;
- referencias a otros documentos.

---

# 25. FACT

```ts
interface Fact {
  id: string;
  type: string;
  originalValue: unknown;
  normalizedValue?: unknown;
  unit?: string | null;
  explicitInDocument: boolean;
  evidence: Evidence[];
}
```

---

# 26. EVIDENCE

```ts
interface Evidence {
  id: string;
  documentId: string;
  fileName: string;
  page: number | null;
  originalText: string | null;
  confidence: "HIGH" | "MEDIUM" | "LOW";
}
```

Regla:

```text
DOCUMENTED_FACT sin Evidence = INVALID
```

---

# 27. NORMALIZACIÓN

Mantener siempre el valor original.

Ejemplo:

```text
originalValue: "00524-00050"
normalizedValue: "524-50"
```

Ejemplo:

```text
originalValue: "8,85 hectáreas"
normalizedValue: 88500
unit: "m2"
```

---

# 28. ENTIDADES

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

---

# 29. RELACIONES

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

Cada relación material debe ser trazable.

---

# 30. AISLAMIENTO ENTRE ESTUDIOS

Antes de analizar:

```ts
for (const document of documents) {
  assert(document.studyId === currentStudy.id)
  assert(document.userId === currentUser.id)
}
```

Crear test de contaminación cruzada.

---

# 31. MÓDULO TITLE_STUDY

Priorizar:

1. individualización;
2. dominio vigente;
3. titulares;
4. derechos y porcentajes;
5. título de adquisición;
6. escritura;
7. fecha;
8. Notaría;
9. repertorio;
10. inscripción;
11. fojas;
12. número;
13. año;
14. CBR;
15. título antecedente;
16. cadena de tradición;
17. herencias;
18. adjudicaciones;
19. compraventas;
20. hipotecas;
21. gravámenes;
22. prohibiciones;
23. servidumbres;
24. usufructos;
25. anotaciones;
26. discrepancias;
27. vacíos documentales;
28. cronología;
29. conclusiones.

---

# 32. CADENA DE TÍTULOS

```ts
interface TitleChainLink {
  id: string;
  seller?: string;
  buyer?: string;
  titleType: string;
  deedDate?: string;
  notary?: string;
  repertory?: string;
  fojas?: string;
  numero?: string;
  year?: string;
  cbr?: string;
  previousTitleReference?: string;
  status:
    | "CONFIRMED_LINK"
    | "REFERENCED_BUT_NOT_PROVIDED"
    | "MISSING_LINK"
    | "CONTRADICTORY_LINK"
    | "UNVERIFIED_LINK";
  evidence: Evidence[];
}
```

No usar simplemente `valid: true`.

---

# 33. CADENA ININTERRUMPIDA

No declarar:

- “cadena ininterrumpida”;
- “títulos ajustados a derecho”;
- “tradición saneada”;

si hay títulos faltantes, solo citados, contradicciones, documentos ilegibles o evidencia insuficiente.

---

# 34. CRONOLOGÍA

Cada evento:

- fecha;
- tipo;
- descripción;
- participantes;
- inscripción;
- documentIds;
- evidence.

No inventar eventos para cubrir períodos.

---

# 35. ANÁLISIS CRUZADO

Comparar:

```text
Rol: CBR ↔ SII ↔ DOM ↔ plano
Propietario: CBR ↔ SII ↔ escritura ↔ herencia
Superficie: CBR ↔ SII ↔ plano ↔ levantamiento
Dirección: CBR ↔ SII ↔ CIP ↔ plano
Título: escritura ↔ inscripción ↔ dominio vigente
Deslindes: título ↔ plano ↔ levantamiento
```

Estados:

```text
CONSISTENTDISCREPANCY
PARTIAL
INSUFFICIENT_EVIDENCE
```

---

# 36. MÓDULO TOPOGRAPHIC_STUDY

Debe analizar:

- escrituras;
- planos;
- levantamientos;
- superficies;
- tramos;
- orientaciones;
- deslindes;
- colindantes;
- coordenadas cuando existan;
- diferencias título/plano/terreno.

La IA interpreta.

El código realiza aritmética determinista.

---

# 37. CÁLCULOS

El código calcula:

- ha ↔ m²;
- diferencias absolutas;
- porcentajes;
- sumatoria de tramos;
- perímetros;
- cálculos exactos adicionales.

No recalcular el mismo dato en múltiples secciones.

---

# 38. PARSER DE SUPERFICIES

Debe soportar:

```text
1.200 m2
1,200 m2
8,85 ha
0.98 ha
9.800 m²
```

Considerar configuración regional y agregar tests.

---

# 39. AUSENCIA ≠ INEXISTENCIA

Incorrecto:

```text
mortgages = []
→ no existen hipotecas
```

Correcto:

```text
verificationStatus = INSUFFICIENT_EVIDENCE
```

Aplicar a:

- hipotecas;
- gravámenes;
- prohibiciones;
- servidumbres;
- embargos;
- litigios;
- deudas.

---

# 40. CATEGORÍAS ANALÍTICAS

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

No presentar inferencias como hechos.

---

# 41. FINDINGS

```ts
interface Finding {
  id: string;
  category: AnalyticalCategory;
  statement: string;
  supportingFactIds: string[];
  evidenceIds: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW" | "UNVERIFIED";
  requiresProfessionalReview: boolean;
}
```

---

# 42. CONCLUSIONES

```ts
interface Conclusion {
  id: string;
  category: AnalyticalCategory;
  text: string;
  supportingFactIds: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW" | "UNVERIFIED";
  requiresProfessionalReview: boolean;
}
```

Una conclusión documental sin `supportingFactIds` debe fallar.

---

# 43. REVISOR CRÍTICO

Ejecutar una segunda revisión que busque:

- hechos sin evidencia;
- propietarios/RUT/superficies inventados;
- Rol incorrecto;
- comuna/CBR incorrectos;
- contaminación de otro expediente;
- cálculos contradictorios;
- títulos faltantes;
- gravámenes sin fuente;
- conclusiones excesivas;
- páginas inexistentes;
- documentId inválidos.

Si hay error crítico:

```text
approved = false
```

No generar informe final.

---

# 44. EVIDENCE GATE

Debe existir en código.

Reglas mínimas:

```text
DOCUMENTED_FACT → evidence >= 1
Evidence.documentId → existe
Evidence.documentId → pertenece al study
Evidence.page → rango válido cuando verificable
CurrentOwner → supporting Fact
Registration → Evidence
CONFIRMED_LINK → Evidence
Encumbrance → Evidence
Mortgage → Evidence
Prohibition → Evidence
Servitude → Evidence
Conclusion → supportingFactIds
```

Si falla:

```text
EVIDENCE_GATE_FAILED
```

No generar DOCX.

---

# 45. STRUCTURED OUTPUT

Pipeline:

```text
AI RESPONSE
   ↓
STRUCTURED JSON
   ↓
SCHEMA VALIDATION
   ↓
SEMANTIC VALIDATION
   ↓
CRITICAL REVIEW
   ↓
EVIDENCE GATE
```

Usar JSON Schema/Zod o mecanismo oficial equivalente.

No depender de regex para datos críticos.

---

# 46. CENTRAL ANALYSIS JSON

Debe incluir:

```text
schemaVersion
study
documents
facts
entities
relations
titleChain
timeline
comparisons
calculations
discrepancies
missingEvidence
encumbrances
findings
conclusions
qualityReview
executionManifest
```

---

# 47. DOCX

Solo generar si:

```text
schemaValidation = PASS
criticalReview = PASS
evidenceGate = PASS
```

---

# 48. PLANTILLA ESTUDIO DE TÍTULOS

1. Portada.
2. Alcance.
3. Documentos analizados.
4. Individualización.
5. Dominio vigente.
6. Titulares y derechos.
7. Inscripción actual.
8. Título de adquisición.
9. Cadena de títulos.
10. Antecedentes sucesorios.
11. Gravámenes y limitaciones.
12. Comparación entre fuentes.
13. Discrepancias.
14. Vacíos documentales.
15. Cronología.
16. Hallazgos.
17. Conclusiones.
18. Recomendaciones.
19. Anexo de trazabilidad.

No incluir topografía extensa si no corresponde.

---

# 49. PLANTILLA TOPOGRAFÍA

1. Portada.
2. Objeto.
3. Documentos.
4. Identificación.
5. Antecedentes registrales relevantes.
6. Plano histórico.
7. Levantamiento actual.
8. Superficies.
9. Deslindes.
10. Tramos.
11. Diferencias.
12. Cálculos.
13. Observaciones técnicas.
14. Limitaciones.
15. Conclusiones.
16. Trazabilidad.

---

# 50. TRAZABILIDAD EN DOCX

Agregar anexo:

```text
Fact ID
Afirmación
Documento
Página
```

---

# 51. VER FUENTE

Debe abrir el documento real o una vista verificable.

No mostrar texto generado por IA como si fuera texto del PDF.

---

# 52. JOBS

Cada ejecución debe registrar:

```text
jobId
studyId
userId
moduleId
status
stage
provider
credentialId
model
promptVersion
schemaVersion
applicationVersion
commitSha
attempt
startedAt
finishedAt
documents
```

---

# 53. LOGS

Registrar:

- timestamp;
- job;
- stage;
- provider;
- model;
- documento;
- página;
- duración;
- request ID;
- retry;
- fallback.

Nunca secretos.

---

# 54. ERRORES

Categorías:

```text
AUTHENTICATION
AUTHORIZATION
FILE_UPLOAD
FILE_FORMAT
FILE_CORRUPTED
DOCUMENT_PARSING
OCR
DRIVE
PROVIDER_CONNECTION
PROVIDER_AUTH
PROVIDER_RATE_LIMIT
PROVIDER_TIMEOUT
PROVIDER_RESPONSE
INVALID_JSON
SCHEMA_VALIDATION
DATA_CONSISTENCY
EVIDENCE_GATE
CRITICAL_REVIEW
DATABASE
DOCX_GENERATION
STORAGE
UNKNOWN
```

---

# 55. REINTENTOS

```text
timeout → retry
rate limit → esperar + retry
5xx → retry controlado
invalid API key → no retry automático
invalid JSON → reparación/retry controlado
corrupt file → no retry automático
```

Registrar todos los intentos.

---

# 56. FALLBACK

Puede existir fallback de provider/modelo, pero:

- configurable;
- registrado;
- visible;
- nunca hacia datos ficticios.

---

# 57. REANALIZAR DESDE CERO

Debe:

- conservar originales;
- crear nuevo job;
- no reutilizar facts/conclusions como evidencia;
- ejecutar pipeline completo.

---

# 58. VERSIONADO

Cada análisis registra:

```text
applicationVersion
commitSha
moduleId
moduleVersion
promptVersion
schemaVersion
provider
model
```

---

# 59. PROMPTS VERSIONADOS

Crear:

```text
prompts/
├── title-study/
│   ├── classifier.v1.md
│   ├── extractor.v1.md
│   ├── entity-resolution.v1.md
│   ├── title-chain.v1.md
│   ├── cross-analysis.v1.md
│   ├── reviewer.v1.md
│   └── report.v1.md
└── topography/
```

No sobrescribir silenciosamente una versión.

---

# 60. SYSTEM PROMPT BASE

Principios mínimos:

```text
Eres un analista documental técnico-jurídico especializado en inmuebles y estudios de títulos de Chile.

Estudia únicamente los DOCUMENTOS REALES recibidos.

No inventes personas, RUT, roles, fechas, inscripciones, superficies, fojas, números, títulos, gravámenes, servidumbres, planos, resoluciones ni actos.

No uses datos de otros casos.

Cada hecho documental debe señalar documento, página y evidencia.

Conserva el valor original y el normalizado por separado.

Si no puede verificarse, usa NO CONSTA EN ANTECEDENTES.

Distingue DOCUMENTED_FACT, CALCULATION, CONSISTENCY, DISCREPANCY, INFERENCE, MISSING_EVIDENCE, RISK y RECOMMENDATION_FOR_REVIEW.

Nunca presentes una inferencia como hecho.

Documento citado pero no aportado = REFERENCED_BUT_NOT_PROVIDED.

No declares inexistencia de cargas o litigios sin evidencia suficiente.

Si dos documentos parecen corresponder a inmuebles diferentes, no mezcles los datos y genera DATA_CONSISTENCY_ERROR.

Las conclusiones deben ser reconstruibles desde supportingFactIds.

Es preferible declarar NO CONSTA EN ANTECEDENTES antes que completar información dudosa.

Devuelve exclusivamente la estructura solicitada.
```

---

# 61. NO CHAIN-OF-THOUGHT

No solicitar ni almacenar razonamiento interno.

Para auditoría se requieren:

- decisiones;
- fuentes;
- alternativas;
- configuración;
- pruebas;
- resultados;
- errores;
- consecuencias.

---

# 62. DOCUMENTACIÓN OBLIGATORIA

Crear:

```text
docs/
├── PURPOSE.md
├── RESEARCH_BASELINE.md
├── ARCHITECTURE.md
├── DEVELOPMENT_STRATEGY.md
├── CONFIGURATION.md
├── DOCUMENT_ANALYSIS_PROTOCOL.md
├── AI_PROVIDER_PROTOCOL.md
├── REPORT_MODULE_PROTOCOL.md
├── DATA_MODEL.md
├── SECURITY.md
├── TRACEABILITY.md
├── TEST_PLAN.md
├── TEST_RESULTS.md
├── KNOWN_LIMITATIONS.md
├── DEPLOYMENT.md
├── OPERATIONS.md
├── decisions/
└── logs/
```

---

# 63. ADR

Toda decisión relevante debe generar un ADR:

```text
ADR-XXXX
Estado
Fecha
Contexto
Requisitos
Alternativas
Decisión
Fuentes
Pruebas
Consecuencias
Impacto futuro
```

---

# 64. DECISIONES QUE REQUIEREN ADR

Como mínimo:

- Firebase Authentication;
- Hosting;
- Firestore;
- Drive;
- scope Drive;
- Gemini;
- estrategia de archivos;
- structured output;
- Zod;
- Provider Gateway;
- módulos;
- Evidence Gate;
- secretos;
- FREE_PROTOTYPE;
- Cloud Run futuro;
- multi API;
- DOCX.

---

# 65. IMPLEMENTATION LOG

Crear:

```text
docs/logs/IMPLEMENTATION_LOG.md
```

Registrar cronológicamente:

- objetivo;
- archivos;
- componentes;
- configuración;
- pruebas;
- resultado;
- problemas;
- pendientes;
- commit.

---

# 66. CONFIGURATION LOG

Crear:

```text
docs/logs/CONFIGURATION_LOG.md
```

No incluir secretos.

---

# 67. INCIDENT LOG

Crear:

```text
docs/logs/INCIDENT_LOG.md
```

Todo defecto crítico permanece registrado.

---

# 68. MATRIZ DE REQUISITOS

Usar IDs:

```text
AUTH-001
DRIVE-001
DOC-001
AI-001
MOD-001
EVD-001
REP-001
SEC-001
AUD-001
COST-001
```

Crear:

```text
audit/REQUIREMENTS_MATRIX.json
```

Relacionar:

```text
Requisito → Diseño → Código → Test → Resultado
```

---

# 69. AUDIT BUNDLE

Crear:

```text
audit/
├── AUDIT_INDEX.json
├── BUILD_MANIFEST.json
├── CAPABILITIES.json
├── REQUIREMENTS_MATRIX.json
├── RESEARCH_SOURCES.json
├── MODEL_DISCOVERY.json
├── TEST_SUMMARY.json
├── SECURITY_STATUS.json
├── DEVIATIONS.json
└── COST_PROFILE.json
```

---

# 70. CAPABILITIES.json

Estados:

```text
PLANNED
IN_PROGRESS
IMPLEMENTED_UNVERIFIED
VERIFIED
FAILED
BLOCKED
ARCHITECTURE_READY
```

No usar `VERIFIED` sin prueba.

---

# 71. MODEL_DISCOVERY.json

Registrar:

- provider;
- timestamp;
- modelos devueltos;
- IDs normalizados;
- capacidades;
- modelo utilizado;
- estado.

Sin secretos.

---

# 72. MANIFEST DE EJECUCIÓN

Cada informe debe registrar:

```json
{
  "reportId": "...",
  "studyId": "...",
  "applicationVersion": "...",
  "commitSha": "...",
  "moduleId": "...",
  "moduleVersion": "...",
  "provider": "...",
  "model": "...",
  "promptVersion": "...",
  "schemaVersion": "...",
  "documentHashes": [],
  "schemaValidation": "PASS",
  "criticalReview": "PASS",
  "evidenceGate": "PASS",
  "evidenceCoverage": 0,
  "jobId": "...",
  "generatedAt": "..."
}
```

---

# 73. EVIDENCE COVERAGE

Calcular:

```text
documentedFactsWithEvidence / documentedFacts
```

Nunca inventar el porcentaje.

---

# 74. AUDITORÍA EN UI

Agregar vista `Auditoría` con:

- versión app;
- commit;
- cost profile;
- módulo;
- provider;
- modelo;
- prompt;
- schema;
- hashes;
- job;
- Evidence Gate;
- Critical Review;
- cobertura;
- tests relevantes.

---

# 75. COMANDOS DE AUDITORÍA

Agregar:

```text
npm run audit
npm run audit:bundle
npm run audit:no-mocks
```

o equivalente.

---

# 76. NO MOCKS EN PRODUCCIÓN

`audit:no-mocks` debe detectar posibles:

```text
mock
demo
fake
sample
fixture
hardcoded fallback
simulation
```

Mocks permitidos en tests.

Si aparecen en código productivo, deben justificarse y no permitir estado `VERIFIED` si afectan funcionalidad real.

---

# 77. TESTS OBLIGATORIOS

## T-DOC-001 — Contenido real
La IA extrae datos desde un PDF real de prueba.

## T-DOC-002 — Filename irrelevante
Mismos bytes, nombre diferente. Resultado sustantivo equivalente.

## T-DOC-003 — Hash
SHA-256 coincide con cálculo independiente.

## T-DATA-001 — Inmueble diferente
Generar `DATA_CONSISTENCY_ERROR`.

## T-TITLE-001 — Título antecedente ausente
Generar `REFERENCED_BUT_NOT_PROVIDED`.

## T-AI-001 — API inválida
`FAILED`, nunca resultado ficticio.

## T-AI-002 — Modelo seleccionado
Provider utiliza exactamente el modelId seleccionado.

## T-AI-003 — JSON inválido
Fallo o reparación estructural controlada.

## T-EVD-001 — Hecho sin evidencia
Evidence Gate falla.

## T-EVD-002 — Página inválida
Evidence Gate falla.

## T-CROSS-001 — Contaminación entre estudios
Cero datos cruzados.

## T-ENC-001 — Sin certificado de gravámenes
No afirmar ausencia de gravámenes.

## T-DOCX-001 — Trazabilidad
Todo dato material del DOCX deriva del JSON validado.

---

# 78. TESTS TOPOGRÁFICOS

Usar fixtures sintéticos con:

- plano;
- superficie;
- tramos;
- discrepancias.

Verificar cálculos con código, no con IA.

---

# 79. TEST PLAN Y TEST RESULTS

Antes de implementar funciones críticas, definir prueba.

Registrar:

```text
Test ID
Requirement
Objective
Input
Procedure
Expected
Observed
PASS/FAIL
Commit
```

---

# 80. HONESTIDAD TÉCNICA

Nunca declarar:

```text
implementado
operativo
seguro
verificado
integrado
```

sin evidencia.

---

# 81. DEVIATIONS

Crear:

```text
audit/DEVIATIONS.json
```

Si un requisito no puede cumplirse:

- Requirement ID;
- motivo;
- implementación actual;
- riesgo;
- solución propuesta;
- fase futura;
- estado.

No desviarse silenciosamente.

---

# 82. GITHUB

Usar un repositorio nuevo.

Nombre recomendado:

```text
estudio-titulos-ai
```

El agente debe:

- conectar el nuevo repo;
- usar commits pequeños;
- mantener historial claro;
- no subir secretos;
- no subir documentos privados reales.

---

# 83. .gitignore OBLIGATORIO

Como mínimo:

```text
.env
.env.*
node_modules/
dist/
coverage/
tmp/
uploads/
private/
*.key
*.pem
service-account*.json
```

---

# 84. COMMITS

Ejemplos:

```text
docs(research): add verified Google technical baseline
feat(auth): implement Firebase Google sign-in
feat(document-core): ingest real document bytes
feat(gemini): add PDF analysis with selected model
feat(evidence): enforce evidence gate
test(title-study): add contamination regression
docs(adr): record Drive scope decision
```

---

# 85. SECRET SCANNING
Agregar verificación para evitar:

- API keys;
- tokens;
- client secrets;
- private keys;
- service account JSON.

---

# 86. README

Debe explicar:

- finalidad;
- arquitectura;
- quick start;
- estado;
- cost profile;
- requisitos;
- cómo ejecutar;
- cómo auditar;
- limitaciones;
- roadmap.

---

# 87. UI INICIAL

Menú:

```text
Inicio
Estudios
Documentos
Configuración
  Proveedores IA
  Google Drive
  Perfil
Actividad
Auditoría
```

Dentro del estudio:

```text
Resumen
Documentos
Hechos
Cadena de títulos
Discrepancias
Vacíos
Informe
Actividad
Auditoría
```

Topografía aparece solo cuando el módulo está activo.

---

# 88. NUEVO ESTUDIO

No precargar:

- Región Metropolitana;
- propietario;
- Rol;
- dirección;
- superficie;
- CBR;
- títulos.

Campos desconocidos deben ser `null`.

La UI puede mostrar “Pendiente” sin persistirlo como hecho.

---

# 89. DATOS DEMO

Solo en:

```text
tests/
fixtures/
examples/
```

Siempre marcados como sintéticos.

Nunca en runtime productivo.

---

# 90. PRIVACIDAD

No registrar innecesariamente:

- RUT;
- nombres;
- documentos completos;
- contenido sensible;
- tokens;
- credenciales.

Minimizar datos personales en logs.

---

# 91. BORRADO

Documentar política de conservación y borrado para:

- estudio;
- metadata;
- análisis;
- informes;
- artifacts temporales;
- referencias Drive;
- jobs.

---

# 92. MULTI API FUTURO

Aunque solo Gemini esté verificado en `FREE_PROTOTYPE`, la arquitectura debe permitir:

- OpenAI;
- OpenRouter;
- OpenAI-compatible.

No acoplar lógica de dominio a Gemini.

---

# 93. ESTRATEGIA DE DESARROLLO

Orden recomendado:

```text
PHASE 0  Research
PHASE 1  Repo + audit + schemas
PHASE 2  Firebase Auth
PHASE 3  Document Core + Drive
PHASE 4  Provider Gateway
PHASE 5  Gemini 3.6 Flash real document analysis
PHASE 6  Facts + Evidence
PHASE 7  Title Study Module
PHASE 8  Reviewer + Evidence Gate
PHASE 9  DOCX
PHASE 10 Audit UI
PHASE 11 Topography Module
PHASE 12 Hardening + tests
```

---

# 94. PHASE REVIEW

Al final de cada fase:

```text
Objective
Requirements
Implemented
Not implemented
Tests
PASS
FAIL
Risks
Technical debt
Decisions
Commits
READY FOR NEXT PHASE
```

---

# 95. CONDICIÓN DE FINALIZACIÓN

No considerar terminado solo porque compile o tenga interfaz.

Debe demostrarse:

```text
REAL DOCUMENT
   ↓
REAL INGESTION
   ↓
REAL AI INPUT
   ↓
FACT EXTRACTION
   ↓
EVIDENCE
   ↓
ENTITY / RELATION
   ↓
TITLE CHAIN / TOPOGRAPHY
   ↓
CROSS CHECK
   ↓
CRITICAL REVIEW
   ↓
EVIDENCE GATE
   ↓
VALID JSON
   ↓
AUDIT MANIFEST
   ↓
DOCX
```

---

# 96. REGLA DE DEMOSTRACIÓN

Antes de marcar `VERIFIED`, el agente debe poder demostrar:

1. qué archivo recibió la IA;
2. SHA-256;
3. provider;
4. modelo;
5. prompt/version;
6. hechos extraídos;
7. evidencia;
8. test;
9. commit;
10. limitaciones.

---

# 97. PROHIBICIONES FINALES

No hacer:

- datos ficticios como fallback;
- mocks disfrazados;
- login falso;
- Drive falso;
- hash falso;
- pageCount ficticio;
- calidad ficticia;
- owner/CBR/superficie ficticios;
- evidencia inventada;
- `originalText` generado como si fuera literal;
- resultados no validados;
- DOCX desde JSON inválido;
- conclusiones sin facts;
- ausencia inferida por array vacío;
- modelos hardcodeados como catálogo único;
- secretos en repo;
- servicios pagados sin autorización;
- cambios de arquitectura sin ADR;
- desviaciones silenciosas.

---

# 98. ENTREGABLE FINAL DEL AGENTE

Entregar:

1. aplicación funcional;
2. repositorio GitHub actualizado;
3. README;
4. documentación;
5. ADRs;
6. audit bundle;
7. tests y resultados;
8. capability matrix;
9. requirements traceability;
10. research baseline;
11. cost profile;
12. security status;
13. known limitations;
14. deployment instructions;
15. funcionalidades verificadas;
16. funcionalidades pendientes;
17. commit SHA final.

---

# 99. INSTRUCCIÓN FINAL AL AGENTE

No te limites a explicar qué harías.

Debes:

1. investigar;
2. documentar;
3. diseñar;
4. implementar;
5. probar;
6. corregir;
7. auditar;
8. dejar evidencia;
9. completar la aplicación.

Si alguna parte no puede implementarse por credenciales, permisos, límites del entorno o costo:

- no simularla;
- marcarla `BLOCKED` o `ARCHITECTURE_READY`;
- documentar exactamente qué falta;
- completar todo lo demás.

Orden de prioridad:

```text
VERACIDAD
→ TRAZABILIDAD
→ SEGURIDAD
→ FUNCIONALIDAD
→ ESCALABILIDAD
→ PRESENTACIÓN
```

Una aplicación que falla explícitamente es preferible a una que genera un informe convincente pero incorrecto.

---

# 100. CRITERIO MAESTRO

**La IA debe hacer el trabajo real de estudiar los documentos.**

El software debe asegurar que ese trabajo:

- recibe los archivos correctos;
- usa el modelo correcto;
- queda estructurado;
- queda respaldado por evidencia;
- puede ser auditado;
- puede repetirse;
- no se contamina entre expedientes;
- no inventa cuando falta información.

Ese es el criterio principal para aceptar o rechazar la implementación.