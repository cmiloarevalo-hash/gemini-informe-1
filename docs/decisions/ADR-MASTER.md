# Registro Maestro de Decisiones de Arquitectura (ADR-0001 a ADR-0016)

---

### ADR-0001: Arquitectura FREE_PROTOTYPE y Protección de Secretos
- **Estado:** ACEPTADO
- **Fecha:** 2026-09-23
- **Contexto:** Se requiere ejecutar la plataforma sin exigir activación de facturación pagada en GCP.
- **Decisión:** Desplegar una aplicación full-stack Node.js (Express `server.ts`) con Vite SPA en el puerto 3000. La API key de Gemini reside exclusivamente en el entorno server-side y nunca se expone al navegador ni en bundles estáticos.
- **Consecuencias:** Cumplimiento 100% de la política de seguridad y costo cero.

---

### ADR-0002: Adopción del SDK @google/genai y Modelos Vigentes
- **Estado:** ACEPTADO
- **Fecha:** 2026-09-23
- **Contexto:** Las versiones anteriores del SDK (`@google/generative-ai`) y modelos (`gemini-1.5-*`, `gemini-2.0-*`) están obsoletos o prohibidos por las directrices vigentes.
- **Decisión:** Emplear exclusivamente `@google/genai` (v2.4.0+) con modelo de referencia `gemini-3.8-flash` y soporte para `gemini-3.6-flash`.
- **Consecuencias:** Acceso a capacidades nativas de comprensión multimodal de PDF e imágenes sin conversiones de pérdida.

---

### ADR-0003: Document Core e Ingestión Basada en Bytes Reales y SHA-256
- **Estado:** ACEPTADO
- **Fecha:** 2026-09-23
- **Contexto:** Está terminantemente prohibido inferir contenido a partir del nombre del archivo, extensión o tamaño.
- **Decisión:** Todo documento recibido se procesa extrayendo su buffer real, calculando el digest SHA-256 criptográfico con `crypto.createHash('sha256')`, y determinando páginas exactas con `pdf-lib`.
- **Consecuencias:** Hash matemática y forensemente reproducible en auditorías externas.

---

### ADR-0004: Evidence Gate y Regla Estricta de Trazabilidad
- **Estado:** ACEPTADO
- **Fecha:** 2026-09-23
- **Contexto:** Un modelo generativo puede alucinar afirmaciones si no se restringe su epistemología.
- **Decisión:** Implementar un validador en código `EvidenceGate` que rechaza cualquier hecho documentado que carezca de al menos una cita de evidencia con documento perteneciente al estudio y página válida.
- **Consecuencias:** Ningún informe DOCX puede generarse si el Evidence Gate falla.

---

### ADR-0005: Separación entre Análisis Estructurado y Presentación DOCX
- **Estado:** ACEPTADO
- **Fecha:** 2026-09-23
- **Contexto:** La IA no debe controlar directamente la maquetación binaria del documento Word final.
- **Decisión:** La IA emite exclusivamente un objeto estructurado `CentralAnalysis`. Un motor en código TypeScript basado en `docx` compila el informe respetando estilos, jerarquía y anexos de trazabilidad.
- **Consecuencias:** Documentos corporativos limpios, consistentes y 100% auditables.

---

### ADR-0006: Zod para Validación de Esquemas y Salida Estructurada
- **Estado:** ACEPTADO
- **Fecha:** 2026-09-23
- **Contexto:** La salida de los modelos debe encajar exactamente en el contrato de datos del sistema.
- **Decisión:** Definir esquemas rigurosos en Zod (`src/schemas/`) que validan cada campo antes de que la información ingrese al estado de la aplicación.
- **Consecuencias:** Manejo robusto de errores de parsing y protección contra datos corruptos.

---

### ADR-0007: Provider Gateway Multi-Modelo y Model Discovery
- **Estado:** ACEPTADO
- **Fecha:** 2026-09-23
- **Contexto:** El sistema debe soportar Gemini hoy y permitir OpenAI u OpenRouter en producción sin reescribir lógica de negocio.
- **Decisión:** Crear `AIProvider` como interfaz desacoplada con métodos `listModels()`, `getModelCapabilities()` y `analyze()`.
- **Consecuencias:** Arquitectura modular y extensible (`ARCHITECTURE_READY` para otros proveedores).

---

### ADR-0008: Manejo de Ausencia de Evidencia (Ausencia ≠ Inexistencia)
- **Estado:** ACEPTADO
- **Fecha:** 2026-09-23
- **Contexto:** La falta de mención de una hipoteca en un documento no significa que la propiedad esté libre de gravámenes.
- **Decisión:** Salvo que conste expresamente un Certificado de Hipotecas y Gravámenes con vigencia, el estatus es obligatoriamente `INSUFFICIENT_EVIDENCE`.
- **Consecuencias:** Prevención total de contingencias jurídicas falsas.

---

### ADR-0009: Aislamiento Multi-Inquilino (Anti-Contaminación)
- **Estado:** ACEPTADO
- **Fecha:** 2026-09-23
- **Contexto:** Jamás se deben mezclar documentos ni hechos de expedientes distintos.
- **Decisión:** Toda entidad valida `assert(document.studyId === currentStudy.id && document.userId === currentUser.id)`.
- **Consecuencias:** Cero contaminación cruzada garantizada por tests unitarios obligatorios.

---

### ADR-0010: Arquitectura de Módulos Registrados (Title Study & Topography)
- **Estado:** ACEPTADO
- **Fecha:** 2026-09-23
- **Contexto:** Nuevos tipos de informes (subdivisiones, due diligence) se agregarán en el futuro.
- **Decisión:** Implementar un `ModuleRegistry` donde cada módulo aporta su plan de análisis, validaciones y plantilla de reporte.
- **Consecuencias:** Nuevos módulos se añaden sin modificar Document Core ni Provider Gateway.

---

### ADR-0011: Cálculos Aritméticos Deterministas en Topografía
- **Estado:** ACEPTADO
- **Fecha:** 2026-09-23
- **Contexto:** Los modelos de lenguaje son propensos a errores aritméticos en conversión de unidades o sumatorias.
- **Decisión:** La IA extrae los valores declarados en texto; el código TypeScript realiza las conversiones (ha <-> m2), sumatoria de tramos perimetrales y cálculo de diferencias porcentuales.
- **Consecuencias:** Exactitud matemática absoluta.

---

### ADR-0012: Generación DOCX con Anexo de Trazabilidad
- **Estado:** ACEPTADO
- **Fecha:** 2026-09-23
- **Contexto:** Los revisores legales deben poder auditar la fuente de cada afirmación del informe.
- **Decisión:** Todo informe Word incluye un "Anexo de Trazabilidad y Evidencia" que lista cada Fact ID, la afirmación técnica, el documento fuente y la página exacta.
- **Consecuencias:** Trazabilidad de extremo a extremo comprobable.

---

### ADR-0013: Google Drive y Scope Mínimo (drive.file)
- **Estado:** ACEPTADO
- **Fecha:** 2026-09-23
- **Contexto:** Se debe permitir la ingestión desde Drive respetando el principio de menor privilegio.
- **Decisión:** Configurar el adaptador con scope restrictivo `https://www.googleapis.com/auth/drive.file`, limitando el acceso exclusivamente a los archivos abiertos por el usuario a través de Google Picker.
- **Consecuencias:** Máxima seguridad y cumplimiento de políticas de privacidad de Google.

---

### ADR-0014: Firebase Authentication y Persistencia
- **Estado:** ACEPTADO
- **Fecha:** 2026-09-23
- **Contexto:** El prototipo requiere funcionar de inmediato sin bloquear la ejecución por ventanas de términos externas, pero debe ser compatible con Firebase.
- **Decisión:** Modelar las entidades con contratos compatibles con Firestore y Auth, operando con almacén de memoria/local seguro en `FREE_PROTOTYPE` y dejando preparado el conector para Firebase.
- **Consecuencias:** Cero fricción en el despliegue del prototipo y camino de migración directo.

---

### ADR-0015: Estrategia de Reintentos y Fallo Explícito
- **Estado:** ACEPTADO
- **Fecha:** 2026-09-23
- **Contexto:** Errores transitorios de red o rate limit no deben tumbar el proceso, pero fallas definitivas no deben ocultarse con mocks.
- **Decisión:** Reintentos automáticos con backoff exponencial para 429 y 5xx. Errores de autenticación o parsing corrupto fallan explícitamente y marcan el Job como `FAILED`.
- **Consecuencias:** "Los fallos deben fallar", garantizando honestidad técnica.

---

### ADR-0016: Preparación para Producción Futura (Cloud Run y Cloud Tasks)
- **Estado:** ACEPTADO
- **Fecha:** 2026-09-23
- **Contexto:** Para escalar a cargas masivas de expedientes con cientos de fojas se requerirá procesamiento en cola.
- **Decisión:** Desacoplar la orquestación en fases asíncronas con persistencia de estado intermedio de Jobs, facilitando el traslado a Cloud Tasks y Cloud Run.
- **Consecuencias:** Transición fluida a `PRODUCTION_READY` cuando se active la facturación corporativa.
