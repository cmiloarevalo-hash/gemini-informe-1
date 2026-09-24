# Protocolo de Trazabilidad y Evidence Gate

## 1. Cadena Inmutable
Cada afirmación que se presente en el informe final debe responder a:
```
DOCUMENT (sha256) -> EVIDENCE (página, cita literal) -> FACT -> CONCLUSION -> REPORT
```

## 2. Reglas del Evidence Gate
El Evidence Gate es un validador determinista en código (`src/core/evidence/evidence.gate.ts`).
Aplica las siguientes aserciones antes de autorizar la emisión de informes:

1. **G01 - Cobertura de Hechos:** Todo `DOCUMENTED_FACT` debe contar con `evidence.length >= 1`.
2. **G02 - Integridad Referencial:** Cada `Evidence.documentId` debe existir en la lista de documentos del estudio analizado.
3. **G03 - Rango de Páginas:** Si el documento posee `pageCount`, el valor `Evidence.page` debe cumplir: `1 <= page <= pageCount`.
4. **G04 - Ausencia de Gravámenes:** Si no existe un Certificado de Hipotecas y Gravámenes aportado y con fecha vigente, el sistema prohíbe emitir declaraciones categóricas de inexistencia de gravámenes y exige `INSUFFICIENT_EVIDENCE`.
5. **G05 - Conclusiones Fundadas:** Toda `Conclusion` de tipo fáctico debe referenciar al menos un `supportingFactId` válido.

Cualquier infracción detiene el proceso con estado `EVIDENCE_GATE_FAILED` y bloquea la compilación del archivo DOCX.
