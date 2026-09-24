# Plan de Pruebas Unitarias, de Integración y de Auditoría

| ID | Requisito | Objetivo | Entrada | Procedimiento | Resultado Esperado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **T-DOC-001** | DOC-001 | Extracción sobre PDF real | Buffer binario de PDF con inscripción CBR | Ingestión vía Document Core y extracción | Hechos extraídos con fojas, año y CBR auténticos |
| **T-DOC-002** | DOC-002 | Filename irrelevante | Dos archivos con contenido idéntico pero distinto nombre | Ingestión simultánea | Mismo SHA-256 y extracción equivalente |
| **T-DOC-003** | DOC-001 | Verificación de SHA-256 | Bytes binarios sintéticos conocidos | Comparar con hash nativo Node.js | Exacta igualdad hexadecimal de 64 caracteres |
| **T-DATA-001** | MOD-001 | Detección de inmueble distinto | Dos escrituras con diferentes roles (ej. 120-4 vs 999-1) | Ejecución de Cross-Analysis | Generación de error estructurado `DATA_CONSISTENCY_ERROR` |
| **T-TITLE-001** | MOD-001 | Título antecedente ausente | Escritura cita inscripción anterior no adjunta | Ejecución de cadena de títulos | Estatus `REFERENCED_BUT_NOT_PROVIDED` |
| **T-AI-001** | AI-002 | Falla explícita de API | API Key inválida o endpoint inaccesible | Invocación de Provider Gateway | Rechazo con `PROVIDER_AUTH_ERROR` sin mock |
| **T-AI-002** | AI-001 | Negociación y selección de modelo | Solicitud explícita de modelo | Verificación de payload | Uso estricto del modelo elegido |
| **T-AI-003** | AI-002 | Manejo de JSON inválido | Respuesta truncada o malformada | Parser estructurado con schema | Error controlado de validación de esquema |
| **T-EVD-001** | EVD-001 | Hecho sin evidencia | Fact sin elemento en array `evidence` | Paso por Evidence Gate | Excepción `EVIDENCE_GATE_FAILED` |
| **T-EVD-002** | EVD-002 | Página fuera de rango | Evidencia con página 99 en documento de 3 páginas | Paso por Evidence Gate | Excepción `EVIDENCE_GATE_FAILED` |
| **T-CROSS-001** | SEC-001 | Anti-contaminación entre estudios | Documentos con `studyId` dispar | Invocación de orquestador | Excepción de seguridad antes de procesar |
| **T-ENC-001** | MOD-001 | Ausencia de gravámenes sin cert. | Estudio sin Certificado de Hipotecas | Evaluación de gravámenes | Estado `INSUFFICIENT_EVIDENCE` |
| **T-DOCX-001** | REP-001 | Trazabilidad en DOCX | CentralAnalysis JSON validado | Compilación DOCX | Documento con anexo completo de trazabilidad |
| **T-TOPO-001** | MOD-002 | Parser y cálculos de superficies | Textos con "8,85 ha", "1.200 m2", etc. | Invocación de motor aritmético | Valores normalizados a m2 exactos |
