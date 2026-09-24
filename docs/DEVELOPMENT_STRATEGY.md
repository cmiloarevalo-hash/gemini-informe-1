# Estrategia de Desarrollo Modular y Fases de Ejecución

El proyecto sigue una secuencia de 13 fases conforme a la especificación maestra:
- **PHASE 0:** Investigación técnica con fuentes oficiales (`ai.google.dev`, Google Cloud).
- **PHASE 1:** Repositorio, auditoría, esquemas Zod y matrices de requisitos.
- **PHASE 2:** Autenticación multi-usuario con aislamiento por `userId`.
- **PHASE 3:** Document Core con ingestión real, cálculo de SHA-256 sobre bytes y adaptador Drive.
- **PHASE 4:** Provider Gateway multi-modelo (`gemini-3.8-flash`, `gemini-3.6-flash`, etc.).
- **PHASE 5:** Análisis multimodal real de PDF e imágenes sin reliance en filename.
- **PHASE 6:** Extracción estructurada de Hechos (`Fact`) y Evidencias (`Evidence`).
- **PHASE 7:** Módulo de Estudio de Títulos (`TITLE_STUDY`) con cadena de tradición y gravámenes.
- **PHASE 8:** Revisor Crítico y compuerta determinista `Evidence Gate`.
- **PHASE 9:** Generador de reportes DOCX con anexo de trazabilidad.
- **PHASE 10:** Interfaz de usuario para auditoría, trazabilidad e inspección de evidencias.
- **PHASE 11:** Módulo de Análisis Topográfico (`TOPOGRAPHIC_STUDY`) con aritmética determinista.
- **PHASE 12:** Hardening, suite de pruebas automatizada y verificación final de no-mocks.
