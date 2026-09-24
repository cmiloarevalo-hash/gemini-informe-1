# Finalidad y Principios Fundamentales del Sistema
**Plataforma modular de análisis documental técnico-jurídico con IA**

## 1. Misión
Asistir a abogados, topógrafos, peritos y revisores en la elaboración de **informes técnico-jurídicos basados en documentos reales**, comenzando por:
1. **Estudios de Títulos de Inmuebles en Chile** (cadena de tradición, dominio vigente, gravámenes, anotaciones marginales, discrepancias y vacíos documentales).
2. **Análisis Topográficos Documentales y Comparativos** (superficies, tramos, deslindes, escrituras vs. planos vs. levantamientos de terreno).

## 2. Principios No Negociables
- **La IA debe estudiar el contenido real:** Prohibido inferir hechos basándose exclusivamente en el nombre del archivo, extensión, MIME o tamaño. Se transfieren bytes reales al modelo multimodal.
- **Cadena de Trazabilidad Matemática:** `DOCUMENT -> EVIDENCE -> FACT -> ENTITY / RELATION -> COMPARISON / FINDING -> CONCLUSION -> REPORT`.
- **Los Fallos Deben Fallar:** Si la API falla o la información no consta, el sistema emite un error estructurado o declara `NO CONSTA EN ANTECEDENTES`. Queda terminantemente prohibido utilizar datos demo o ficticios como fallback.
- **Separación entre Análisis y Presentación:** La IA genera únicamente datos estructurados validados por esquema (Zod/JSON Schema). La generación del documento DOCX se ejecuta mediante un motor determinista en código.
- **Evidence Gate:** Todo hecho documentado debe poseer al menos una evidencia auditable con ID de documento real, página verificable y cita textual.
