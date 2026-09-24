# Resultados de Ejecución de Pruebas

**Fecha de ejecución:** 2026-09-23T18:42:00Z  
**Entorno:** tsx runner / Node.js 22+ / Linux Sandbox  
**Resultado Global:** `14/14 PASS` (100% de cumplimiento)

| Test ID | Requisito | Estado | Observación |
| :--- | :--- | :--- | :--- |
| **T-DOC-001** | DOC-001 | **PASS** | Extracción verificada sobre contenido binario real; fojas y roles cotejados. |
| **T-DOC-002** | DOC-002 | **PASS** | Cambio de nombre de archivo no altera el SHA-256 ni los hechos extraídos. |
| **T-DOC-003** | DOC-001 | **PASS** | Hash SHA-256 coincide bit a bit con crypto nativo independiente. |
| **T-DATA-001** | MOD-001 | **PASS** | Conflicto de Roles (120-4 vs 999-1) genera `DATA_CONSISTENCY_ERROR`. |
| **T-TITLE-001** | MOD-001 | **PASS** | Título citado no acompañado catalogado como `REFERENCED_BUT_NOT_PROVIDED`. |
| **T-AI-001** | AI-002 | **PASS** | Error de red o credencial incorrecta rechaza con error explícito; cero mocks generados. |
| **T-AI-002** | AI-001 | **PASS** | Provider Gateway selecciona `gemini-3.8-flash` o `gemini-3.6-flash` sin sustitución arbitraria. |
| **T-AI-003** | AI-002 | **PASS** | JSON malformado es interceptado por Zod; se rechaza la mutación sin corromper el estado. |
| **T-EVD-001** | EVD-001 | **PASS** | Hecho sin evidencia es rechazado por Evidence Gate bloqueando la generación del informe. |
| **T-EVD-002** | EVD-002 | **PASS** | Página 99 en documento de 3 páginas bloquea el proceso por inconsistencia física. |
| **T-CROSS-001** | SEC-001 | **PASS** | Intento de mezclar documentos de estudios distintos arroja excepción de seguridad. |
| **T-ENC-001** | MOD-001 | **PASS** | Sin Certificado de Hipotecas se declara `INSUFFICIENT_EVIDENCE` (Ausencia ≠ Inexistencia). |
| **T-DOCX-001** | REP-001 | **PASS** | Archivo .docx generado contiene tabla de trazabilidad Fact ID -> Documento -> Página. |
| **T-TOPO-001** | MOD-002 | **PASS** | Parser convierte "8,85 ha" a 88.500 m2 y "1.200 m2" a 1.200 m2 determinísticamente. |
