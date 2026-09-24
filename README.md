# Plataforma Modular de Análisis Documental Técnico-Jurídico con IA
**LexTech Titulos & Topografía IA**  
*Modo presupuestario activo: `FREE_PROTOTYPE`*

---

## 1. Finalidad del Sistema
Plataforma especializada en asistir en la elaboración de **informes técnico-jurídicos fundados en documentos reales** para el mercado inmobiliario chileno:
1. **Estudios de Títulos de Inmuebles:** Cadena de tradición sucesiva, titularidad vigente, fojas/número/año/CBR, títulos de adquisición, antecedentes sucesorios, hipotecas, gravámenes, prohibiciones, servidumbres, anotaciones marginales, discrepancias y vacíos documentales.
2. **Análisis Topográficos Documentales:** Cotejo de superficies (ha a m²), tramos métricos, colindantes, poligonales, tolerancias periciales y discrepancias entre títulos, planos y levantamientos de terreno.

## 2. Principios de Integridad Técnica (No Negociables)
- **Inspección de Contenido Real:** La IA recibe los bytes auténticos del archivo (PDF, JPG, PNG) o su representación binaria fiel. Prohibido extraer conclusiones basándose únicamente en el filename, extensión o tamaño.
- **Cadena de Trazabilidad Estricta:** `DOCUMENT -> EVIDENCE -> FACT -> ENTITY / RELATION -> COMPARISON / FINDING -> CONCLUSION -> REPORT`.
- **Evidence Gate Determinista:** Ningún hecho fáctico ingresa al informe sin al menos una evidencia con ID de documento existente en el estudio, página verificable y cita textual.
- **Ausencia ≠ Inexistencia:** Sin un Certificado de Hipotecas y Gravámenes vigente, el sistema prohíbe declarar la propiedad libre de gravámenes (`INSUFFICIENT_EVIDENCE`).
- **Los Fallos Deben Fallar:** Errores de API o falta de datos emiten excepciones estructuradas o declaran `NO CONSTA EN ANTECEDENTES`. Queda terminantemente prohibido utilizar datos demo como fallback en producción.

---

## 3. Arquitectura
```
+-------------------------------------------------------------------------+
|                           CLIENTE (REACT SPA)                           |
|  - Estudios | Documentos | Cadena Títulos | Topografía | Auditoría      |
+------------------------------------^------------------------------------+
                                     | HTTP REST
+------------------------------------v------------------------------------+
|                         SERVIDOR EXPRESS (server.ts)                    |
|  - Document Core (Ingestión de bytes, SHA-256 criptográfico, pdf-lib)   |
|  - Orquestador de Análisis (12 Fases)                                  |
|  - Evidence Gate (Verificación matemática de respaldos)                 |
|  - Provider Gateway (@google/genai server-side, gemini-3.8-flash)       |
|  - DocxReportGenerator (Generación de Word con anexo de trazabilidad)   |
+-------------------------------------------------------------------------+
```

---

## 4. Cost Profile (`FREE_PROTOTYPE`)
| Servicio | Nivel | Costo |
| :--- | :--- | :--- |
| **Gemini Developer API** | Free Tier en Google AI Studio | $0.00 |
| **Document Ingestion** | In-Memory Buffer local en Express | $0.00 |
| **Generador DOCX** | Motor en código TypeScript (`docx`) | $0.00 |
| **Google Drive** | `ARCHITECTURE_READY` (Scope mínimo `drive.file`) | $0.00 |
| **Firestore / Auth** | `ARCHITECTURE_READY` (Persistencia local segura) | $0.00 |

---

## 5. Ejecución Rápida (Quick Start)

### Iniciar servidor de desarrollo
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:3000`.

### Ejecutar Suite de Pruebas Obligatorias
```bash
npm run test
```
Ejecuta las pruebas `T-DOC-001`, `T-DOC-002`, `T-DOC-003`, `T-DATA-001`, `T-TITLE-001`, `T-AI-001`, `T-AI-002`, `T-AI-003`, `T-EVD-001`, `T-EVD-002`, `T-CROSS-001`, `T-ENC-001`, `T-DOCX-001` y `T-TOPO-001`.

### Comandos de Auditoría
```bash
npm run audit          # Valida la integridad del Audit Bundle (10 archivos JSON)
npm run audit:bundle   # Regenera los metadatos y matrices de auditoría
npm run audit:no-mocks # Escanea el código fuente en busca de posibles mocks no autorizados
```

---

## 6. Documentación del Proyecto
- `docs/PURPOSE.md`: Finalidad y principios rectores.
- `docs/RESEARCH_BASELINE.md`: Investigación técnica con fuentes oficiales de Google.
- `docs/ARCHITECTURE.md`: Diagramas y flujo de datos.
- `docs/DATA_MODEL.md`: Interfaces TypeScript y esquemas Zod.
- `docs/TRACEABILITY.md`: Protocolo de Evidence Gate.
- `docs/SECURITY.md`: Reglas de aislamiento y gestión de secretos.
- `docs/TEST_PLAN.md`: Matriz de pruebas.
- `docs/TEST_RESULTS.md`: Registro de resultados (14/14 PASS).
- `docs/decisions/ADR-MASTER.md`: Decisiones de arquitectura (ADR-0001 a ADR-0016).
- `audit/`: Audit Bundle con 10 archivos JSON para auditorías forenses externas.
