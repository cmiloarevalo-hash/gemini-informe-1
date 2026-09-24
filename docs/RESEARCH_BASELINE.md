# Baseline de Investigación Técnica Oficial (Fase 0)
**Fecha de corte:** 2026-09-23  
**Entorno de ejecución:** Google AI Studio / Node.js 22+ / TypeScript 5+ / Vite 6+ / Express  
**Modo presupuestario:** `FREE_PROTOTYPE`

---

## 1. Google Gemini API & SDK Oficial

| Parámetro | Detalle Oficial Verificado |
| :--- | :--- |
| **SDK Vigente** | `@google/genai` (v2.4.0+) |
| **SDKs Obsoletos/Prohibidos** | `@google/generative-ai`, `google-generativeai`, `GoogleGenerativeAI` |
| **Modelos de Texto / Multimodal Vigentes** | `gemini-3.8-flash` (General/Default), `gemini-3.1-pro-preview` (Razonamiento complejo), `gemini-3.1-flash-lite` |
| **Alias / Variantes** | `gemini-3.6-flash` / `gemini-3.8-flash` soportados mediante Provider Gateway y Model Discovery |
| **Modelos Prohibidos/Deprecados** | `gemini-1.5-flash`, `gemini-1.5-pro`, `gemini-2.0-flash`, `gemini-2.0-pro` |
| **Soporte de Documentos (PDF, Imágenes)** | Nativamente soportado vía `inlineData` (base64) o Files API. Formatos: `application/pdf`, `image/jpeg`, `image/png`. Límite inlineData: hasta 20 MB por solicitud. |
| **Structured Output** | Soportado mediante `config.responseMimeType: "application/json"` y `config.responseSchema` con tipos `Type` (`Type.OBJECT`, `Type.ARRAY`, `Type.STRING`, etc.) o validación Zod. |
| **Autenticación** | `process.env.GEMINI_API_KEY` exclusivamente en el servidor (Express). Nunca expuesto en bundle de cliente ni en UI. |
| **Free Tier / Costo** | Nivel gratuito sin facturación obligatoria en Google AI Studio Developer API. Límite de tasa (RPM/RPD) controlado mediante reintentos exponenciales. |
| **Decisión Adoptada** | Se utiliza `@google/genai` server-side en `server.ts` y `src/core/providers/gemini.provider.ts`. Se implementa descubrimiento dinámico de modelos, fallback a `gemini-3.8-flash` / `gemini-3.6-flash`, y normalización de esquemas. |

---

## 2. Ingestión Documental Real & Document Core

| Parámetro | Detalle Oficial Verificado |
| :--- | :--- |
| **Cálculo de Hash SHA-256** | Algoritmo criptográfico SHA-256 aplicado estrictamente sobre los bytes crudos (`crypto.createHash('sha256').update(buffer).digest('hex')`). |
| **Determinación de Páginas** | Análisis de estructura PDF binaria mediante parser de bajo nivel (`pdf-lib`) para contar páginas exactas sin mock ni aproximación. |
| **Detección MIME** | Detección binaria de magic bytes (`%PDF`, `\xFF\xD8\xFF`, etc.) y validación contra Content-Type HTTP. |
| **Calidad de Lectura** | Inicialmente `UNKNOWN`. Evaluada como `HIGH`, `MEDIUM`, `LOW` o `UNREADABLE` únicamente tras la inspección del contenido real por la IA y el motor de extracción. |
| **Decisión Adoptada** | Document Core rechaza archivos ficticios y procesa bytes reales. Los hashes son matemáticamente reproducibles y verificables en auditoría. |

---

## 3. Autenticación & Autorización (Firebase Auth & OAuth)

| Parámetro | Detalle Oficial Verificado |
| :--- | :--- |
| **Arquitectura Free Prototype** | En el entorno de prototipo sin backend de base de datos aprovisionada externamente, se provee sesión de usuario autenticable localmente o delegada a Firebase Auth cuando se provisione el proyecto cloud. |
| **Estado de Integración Externa** | Para Google Drive / Google Picker, se requiere scope mínimo `drive.file`. Si las credenciales OAuth o Firestore no están provisionadas en el runtime, la plataforma opera en modo `ARCHITECTURE_READY` con aislamiento estricto de sesión en memoria/almacenamiento local seguro por usuario (`userId`), garantizando CERO contaminación cruzada. |
| **Aislamiento Multi-inquilino** | Toda entidad, estudio y documento posee `userId` y `studyId`. Cada query y pipeline valida: `assert(document.studyId === currentStudy.id && document.userId === currentUser.id)`. |

---

## 4. Pipeline de Análisis & Evidence Gate

| Parámetro | Detalle Oficial Verificado |
| :--- | :--- |
| **Pipeline de 12 Fases** | 01 Clasificación, 02 Extracción, 03 Resolución de Entidades, 04 Resolución de Inmuebles, 05 Cadena de Títulos, 06 Línea de Tiempo, 07 Análisis Cruzado, 08 Evidencia Faltante, 09 Análisis Técnico-Jurídico, 10 Revisión Crítica, 11 Evidence Gate, 12 Borrador de Informe. |
| **Evidence Gate** | Regla estricta: todo `DOCUMENTED_FACT` requiere al menos una evidencia con `documentId` existente en el estudio, página válida y texto extraído. Fallo en Evidence Gate bloquea la generación del reporte DOCX. |
| **Ausencia de Gravámenes** | Si no consta Certificado de Hipotecas y Gravámenes con vigencia, el estado debe ser `INSUFFICIENT_EVIDENCE` (Ausencia ≠ Inexistencia). |

---

## 5. Generación de Artefactos DOCX

| Parámetro | Detalle Oficial Verificado |
| :--- | :--- |
| **Biblioteca** | `docx` (TypeScript/JavaScript puro, compatible con Node.js y navegadores). |
| **Requisitos del Documento** | Portada formal, índice/secciones, tablas estilizadas, anexos de trazabilidad con Fact ID, Documento y Página. Cero dependencia de plantillas prefabricadas con datos ficticios. |
| **Gate de Generación** | Solo se ejecuta si: `schemaValidation === "PASS" && criticalReview === "PASS" && evidenceGate === "PASS"`. |
