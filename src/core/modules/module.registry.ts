import { CentralAnalysis } from "../../schemas/analysis.schema";

export interface AnalysisStage {
  stageId: string;
  name: string;
  promptKey: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ReportModule {
  id: string;
  version: string;
  name: string;
  description: string;
  requiredCapabilities: string[];
  buildAnalysisPlan(): AnalysisStage[];
  validate(result: CentralAnalysis): ValidationResult;
  buildReport(result: CentralAnalysis): Promise<Buffer>;
}

export class ModuleRegistry {
  private static modules: Map<string, ReportModule> = new Map();

  public static register(mod: ReportModule): void {
    this.modules.set(mod.id, mod);
  }

  public static get(id: string): ReportModule | undefined {
    return this.modules.get(id);
  }

  public static list(): ReportModule[] {
    return Array.from(this.modules.values());
  }
}
