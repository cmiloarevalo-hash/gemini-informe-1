# Modelo de Datos del Sistema

## 1. StudyDocument
Representa el documento físico o digital ingresado a la plataforma.
```typescript
interface StudyDocument {
  id: string;
  userId: string;
  studyId: string;
  originalName: string;
  mimeType: string;
  size: number;
  sha256: string; // SHA-256 criptográfico real de los bytes
  source: "local" | "drive";
  driveFileId?: string;
  status: "UPLOADED" | "PREPARING" | "READY_FOR_AI" | "ANALYZING" | "PROCESSED" | "FAILED";
  pageCount: number | null;
  readingQuality: "HIGH" | "MEDIUM" | "LOW" | "UNREADABLE" | "UNKNOWN";
  createdAt: string;
}
```

## 2. Fact (Hecho Documental)
Información fáctica extraída con su correspondiente respaldo.
```typescript
interface Fact {
  id: string;
  type: string; // e.g., "INSCRIPTION", "SURFACE", "OWNER", "ENCUMBRANCE", "BOUNDARY"
  originalValue: unknown; // Valor textual exacto tal como aparece en el documento
  normalizedValue?: unknown; // Valor estandarizado (número, metros cuadrados, fecha ISO)
  unit?: string | null;
  explicitInDocument: boolean;
  evidence: Evidence[];
}
```

## 3. Evidence (Evidencia Documental)
Puntero inmutable hacia el origen físico del hecho.
```typescript
interface Evidence {
  id: string;
  documentId: string;
  fileName: string;
  page: number | null; // Debe ser >= 1 y <= pageCount
  originalText: string | null; // Cita textual auténtica
  confidence: "HIGH" | "MEDIUM" | "LOW";
}
```

## 4. AnalyticalCategory
Clasificación epistemológica estricta para evitar que inferencias se presenten como hechos:
- `DOCUMENTED_FACT`
- `CALCULATION`
- `CONSISTENCY`
- `DISCREPANCY`
- `INFERENCE`
- `MISSING_EVIDENCE`
- `RISK`
- `RECOMMENDATION_FOR_REVIEW`

## 5. Finding & Conclusion
```typescript
interface Finding {
  id: string;
  category: AnalyticalCategory;
  statement: string;
  supportingFactIds: string[];
  evidenceIds: string[];
  confidence: "HIGH" | "MEDIUM" | "LOW" | "UNVERIFIED";
  requiresProfessionalReview: boolean;
}

interface Conclusion {
  id: string;
  category: AnalyticalCategory;
  text: string;
  supportingFactIds: string[]; // Obligatorio: conclusión sin facts es inválida
  confidence: "HIGH" | "MEDIUM" | "LOW" | "UNVERIFIED";
  requiresProfessionalReview: boolean;
}
```
