import { ReportModule, AnalysisStage, ValidationResult } from "../../core/modules/module.registry";
import { CentralAnalysis } from "../../schemas/analysis.schema";
import { DocxReportGenerator } from "../../core/reports/docx.generator";

export class TitleStudyModule implements ReportModule {
  public id = "TITLE_STUDY";
  public version = "1.0.0";
  public name = "Estudio de Títulos de Inmuebles (Chile)";
  public description = "Análisis integral de dominio vigente, cadena de tradición, gravámenes, anotaciones marginales y vacíos documentales.";
  public requiredCapabilities = ["pdf", "text", "structuredOutput"];

  public buildAnalysisPlan(): AnalysisStage[] {
    return [
      { stageId: "01_CLASSIFICATION", name: "Clasificación de Antecedentes CBR y Notariales", promptKey: "title-study/classifier.v1.md" },
      { stageId: "02_EXTRACTION", name: "Extracción de Fojas, Año, Notaría y Otorgantes", promptKey: "title-study/extractor.v1.md" },
      { stageId: "03_ENTITY_RESOLUTION", name: "Resolución de Identidad de Propietarios y RUT", promptKey: "title-study/entity-resolution.v1.md" },
      { stageId: "05_TITLE_CHAIN", name: "Construcción de Tracto Sucesivo y Título Antecedente", promptKey: "title-study/title-chain.v1.md" },
      { stageId: "07_CROSS_ANALYSIS", name: "Cotejo Cruzado CBR vs SII vs Planos", promptKey: "title-study/cross-analysis.v1.md" },
      { stageId: "10_CRITICAL_REVIEW", name: "Escrutinio Crítico de Títulos y Cargas", promptKey: "title-study/reviewer.v1.md" },
      { stageId: "11_EVIDENCE_GATE", name: "Validación de Compuerta de Evidencia", promptKey: "" },
      { stageId: "12_REPORT_DRAFT", name: "Consolidación de Informe Técnico-Legal", promptKey: "title-study/report.v1.md" }
    ];
  }

  public validate(result: CentralAnalysis): ValidationResult {
    const errors: string[] = [];
    if (!result.titleChain || result.titleChain.length === 0) {
      errors.push("El estudio de títulos debe contener al menos un eslabón en la cadena de tradición.");
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
