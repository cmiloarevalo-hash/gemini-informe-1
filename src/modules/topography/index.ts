import { ReportModule, AnalysisStage, ValidationResult } from "../../core/modules/module.registry";
import { CentralAnalysis } from "../../schemas/analysis.schema";
import { DocxReportGenerator } from "../../core/reports/docx.generator";

export class TopographyModule implements ReportModule {
  public id = "TOPOGRAPHIC_STUDY";
  public version = "1.0.0";
  public name = "Análisis Topográfico y Deslindes";
  public description = "Comparación de superficies declaradas vs medidas, tramos lineales, orientaciones y tolerancias.";
  public requiredCapabilities = ["pdf", "image", "text", "structuredOutput"];

  public buildAnalysisPlan(): AnalysisStage[] {
    return [
      { stageId: "01_CLASSIFICATION", name: "Clasificación de Planos y Levantamientos", promptKey: "topography/classifier.v1.md" },
      { stageId: "02_EXTRACTION", name: "Extracción de Superficies y Tramos", promptKey: "topography/extractor.v1.md" },
      { stageId: "06_CALCULATIONS", name: "Cálculos Aritméticos Deterministas en Código", promptKey: "topography/calculations.v1.md" },
      { stageId: "10_CRITICAL_REVIEW", name: "Revisión Crítica de Deslindes y Tolerancias", promptKey: "topography/reviewer.v1.md" },
      { stageId: "11_EVIDENCE_GATE", name: "Verificación de Evidencia y Vértices", promptKey: "" },
      { stageId: "12_REPORT_DRAFT", name: "Estructuración de Informe Pericial", promptKey: "topography/report.v1.md" }
    ];
  }

  public validate(result: CentralAnalysis): ValidationResult {
    const errors: string[] = [];
    if (!result.topography) {
      errors.push("El informe topográfico debe incluir la sección estructurada de 'topography'.");
    }
    return {
      valid: errors.length === 0,
      errors
    };
  }

  public async buildReport(result: CentralAnalysis): Promise<Buffer> {
    return await DocxReportGenerator.generateDocxBuffer(result);
  }
}
