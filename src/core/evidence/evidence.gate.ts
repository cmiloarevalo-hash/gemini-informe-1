import { StudyDocument } from "../../schemas/document.schema";
import { Fact, Conclusion } from "../../schemas/fact.schema";
import { TitleChainLink, EncumbranceRecord } from "../../schemas/title-study.schema";

export interface EvidenceGateValidationResult {
  passed: boolean;
  violations: string[];
  totalFactsChecked: number;
  factsWithValidEvidence: number;
  coverageRatio: number;
}

export class EvidenceGateError extends Error {
  public code = "EVIDENCE_GATE_FAILED";
  public violations: string[];

  constructor(message: string, violations: string[]) {
    super(message);
    this.name = "EvidenceGateError";
    this.violations = violations;
  }
}

export class EvidenceGate {
  /**
   * Deterministic verification of factual assertions against physical evidence.
   */
  public static evaluate(params: {
    documents: StudyDocument[];
    facts: Fact[];
    titleChain?: TitleChainLink[];
    encumbrances?: EncumbranceRecord[];
    conclusions: Conclusion[];
  }): EvidenceGateValidationResult {
    const { documents, facts, titleChain, encumbrances, conclusions } = params;
    const violations: string[] = [];

    const docMap = new Map<string, StudyDocument>();
    for (const d of documents) {
      docMap.set(d.id, d);
    }

    let factsWithValidEvidence = 0;

    // Rule 1: Facts validation
    for (const fact of facts) {
      if (fact.evidence.length === 0) {
        violations.push(
          `[EVD-G01] Hecho '${fact.id}' (${fact.type}) carece de evidencia documental asociada.`
        );
        continue;
      }

      let factValid = true;
      for (const ev of fact.evidence) {
        const doc = docMap.get(ev.documentId);
        if (!doc) {
          violations.push(
            `[EVD-G02] Evidencia '${ev.id}' en hecho '${fact.id}' referencia un documentId inexistente en el estudio: '${ev.documentId}'.`
          );
          factValid = false;
        } else if (doc.pageCount && ev.page !== null) {
          if (ev.page < 1 || ev.page > doc.pageCount) {
            violations.push(
              `[EVD-G03] Evidencia '${ev.id}' cita la página ${ev.page}, pero el documento '${doc.originalName}' solo posee ${doc.pageCount} páginas.`
            );
            factValid = false;
          }
        }
      }

      if (factValid) {
        factsWithValidEvidence++;
      }
    }

    // Rule 2: Title Chain links
    if (titleChain) {
      for (const link of titleChain) {
        if (link.status === "CONFIRMED_LINK" && link.evidence.length === 0) {
          violations.push(
            `[EVD-G04] Eslabón de dominio '${link.id}' declarado como CONFIRMED_LINK no posee evidencia documental comprobada.`
          );
        }
      }
    }

    // Rule 3: Encumbrances (Ausencia != Inexistencia)
    const hasMortgageCert = documents.some(
      (d) =>
        d.classifiedType === "CERTIFICADO_HIPOTECAS_GRAVAMENES" ||
        d.originalName.toLowerCase().includes("hipoteca") ||
        d.originalName.toLowerCase().includes("gravamen")
    );

    if (encumbrances) {
      for (const enc of encumbrances) {
        if (enc.status === "NO_ENCUMBRANCES_RECORDED" && !hasMortgageCert) {
          violations.push(
            `[EVD-G05] Violación de principio jurídico: Se afirma inexistencia de gravámenes sin haber acompañado un Certificado de Hipotecas y Gravámenes vigente.`
          );
        }
      }
    }

    // Rule 4: Conclusions must have supportingFactIds
    const factIdSet = new Set(facts.map((f) => f.id));
    for (const conc of conclusions) {
      if (!conc.supportingFactIds || conc.supportingFactIds.length === 0) {
        violations.push(
          `[EVD-G06] Conclusión '${conc.id}' carece de supportingFactIds de respaldo.`
        );
      } else {
        for (const fid of conc.supportingFactIds) {
          if (!factIdSet.has(fid)) {
            violations.push(
              `[EVD-G07] Conclusión '${conc.id}' referencia un supportingFactId inexistente: '${fid}'.`
            );
          }
        }
      }
    }

    const totalFacts = facts.length;
    const coverageRatio = totalFacts > 0 ? factsWithValidEvidence / totalFacts : 1;
    const passed = violations.length === 0;

    return {
      passed,
      violations,
      totalFactsChecked: totalFacts,
      factsWithValidEvidence,
      coverageRatio
    };
  }

  public static assertGate(params: {
    documents: StudyDocument[];
    facts: Fact[];
    titleChain?: TitleChainLink[];
    encumbrances?: EncumbranceRecord[];
    conclusions: Conclusion[];
  }): EvidenceGateValidationResult {
    const result = this.evaluate(params);
    if (!result.passed) {
      throw new EvidenceGateError(
        `Evidence Gate falló con ${result.violations.length} violación(es) de integridad documental.`,
        result.violations
      );
    }
    return result;
  }
}
