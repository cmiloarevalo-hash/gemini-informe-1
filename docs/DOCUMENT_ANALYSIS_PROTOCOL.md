# Protocolo de Análisis Documental y Orquestación

## Pipeline de 12 Fases
1. **01_CLASSIFICATION:** Identificación del tipo documental (Inscripción de Dominio, Dominio Vigente, Escritura Pública, Posesión Efectiva, Certificado de Hipotecas y Gravámenes, Certificado de Prohibiciones, Certificado SII, Avalúo Fiscal, CIP, Plano, Levantamiento Topográfico, etc.) analizando el contenido textual y visual.
2. **02_EXTRACTION:** Extracción por documento de fojas, número, año, CBR, notaría, otorgantes, RUTs, roles de avalúo, superficies, deslindes y anotaciones marginales.
3. **03_ENTITY_RESOLUTION:** Unificación de personas jurídicas y naturales, identificando variantes ortográficas o escrituras con o sin puntos en el RUT.
4. **04_PROPERTY_RESOLUTION:** Validación de singularización del inmueble (comuna, dirección, deslindes, rol). Si se detecta disparidad insalvable, emite `DATA_CONSISTENCY_ERROR`.
5. **05_TITLE_CHAIN:** Construcción de la cadena de tradición hacia atrás (vendedor, comprador, fecha escritura, repertorio, fojas, número, año CBR, título antecedente). Marcado de eslabones faltantes como `REFERENCED_BUT_NOT_PROVIDED` o `MISSING_LINK`.
6. **06_TIMELINE:** Ordenamiento cronológico estricto de cada acto jurídico registrado.
7. **07_CROSS_DOCUMENT_ANALYSIS:** Cotejo cruzado entre fuentes (CBR vs. SII vs. Plano vs. Escrituras).
8. **08_MISSING_EVIDENCE:** Identificación explícita de documentos no aportados que impiden certificar tradición continua o ausencia de litigios.
9. **09_LEGAL_TECHNICAL_ANALYSIS:** Calificación de riesgos, servidumbres, hipotecas y concordancia topográfica.
10. **10_CRITICAL_REVIEW:** Segunda pasada de auditoría interna para detectar alucinaciones o datos sin respaldo.
11. **11_EVIDENCE_GATE:** Verificación matemática estricta de que todo hecho cuente con evidencia trazable.
12. **12_REPORT_DRAFT:** Consolidación del objeto CentralAnalysis validado listo para exportación DOCX.
