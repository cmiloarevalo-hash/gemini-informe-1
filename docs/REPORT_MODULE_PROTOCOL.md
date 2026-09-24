# Protocolo de Registro de Módulos de Informe

## 1. Registro de Módulos Desacoplado
Los módulos de informe son componentes autónomos registrados en `ModuleRegistry`.
```typescript
interface ReportModule {
  id: string; // "TITLE_STUDY" | "TOPOGRAPHIC_STUDY" | etc.
  version: string;
  name: string;
  description: string;
  requiredCapabilities: string[];
  buildAnalysisPlan(context: StudyContext): AnalysisStage[];
  validate(result: CentralAnalysis): ValidationResult;
  buildReport(result: CentralAnalysis): Promise<ReportArtifact>;
}
```

## 2. Módulos Iniciales
1. **TITLE_STUDY:** Focalizado en títulos de dominio, historial sucesorio, CBR, gravámenes, anotaciones y concordancia legal.
2. **TOPOGRAPHIC_STUDY:** Focalizado en deslindes, poligonales, tramos métricos, cálculo de áreas (hectáreas vs m2) y diferencias título-plano-terreno.
