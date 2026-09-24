import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  WidthType,
  AlignmentType,
  BorderStyle,
  Packer
} from "docx";
import { CentralAnalysis } from "../../schemas/analysis.schema";

export class DocxReportGenerator {
  public static async generateDocxBuffer(analysis: CentralAnalysis): Promise<Buffer> {
    // Strict Gate verification prior to compilation
    if (
      analysis.executionManifest.schemaValidation !== "PASS" ||
      analysis.executionManifest.criticalReview !== "PASS" ||
      analysis.executionManifest.evidenceGate !== "PASS"
    ) {
      throw new Error(
        "[DOCX_GENERATION_BLOCKED] No se autoriza la generación del informe Word debido a que una de las compuertas obligatorias no fue superada (Schema/Reviewer/EvidenceGate)."
      );
    }

    const isTopography = analysis.executionManifest.moduleId === "TOPOGRAPHIC_STUDY";
    const titleText = isTopography
      ? "INFORME PERICIAL DE ANÁLISIS TOPOGRÁFICO Y DESLINDES"
      : "INFORME TÉCNICO-JURÍDICO DE ESTUDIO DE TÍTULOS DE DOMINIO";

    const tableBorderConfig = {
      top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" }
    };

    // Build Documents Table
    const docRows = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Documento", bold: true })] })],
            width: { size: 30, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Tipo Clasificado", bold: true })] })],
            width: { size: 25, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Páginas", bold: true })] })],
            width: { size: 10, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Hash SHA-256 (Verificado)", bold: true })] })],
            width: { size: 35, type: WidthType.PERCENTAGE }
          })
        ]
      }),
      ...analysis.documents.map(
        (d) =>
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(d.originalName)] }),
              new TableCell({ children: [new Paragraph(d.classifiedType || "OTRO")] }),
              new TableCell({ children: [new Paragraph(d.pageCount ? String(d.pageCount) : "N/C")] }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: d.sha256.slice(0, 24) + "...", font: "Courier New" })]
                  })
                ]
              })
            ]
          })
      )
    ];

    // Build Traceability Annex Table
    const traceRows = [
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Fact ID", bold: true })] })],
            width: { size: 15, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Tipo de Hecho", bold: true })] })],
            width: { size: 20, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Documento Fuente", bold: true })] })],
            width: { size: 25, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Pág.", bold: true })] })],
            width: { size: 10, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: "Cita Literal de Evidencia", bold: true })] })],
            width: { size: 30, type: WidthType.PERCENTAGE }
          })
        ]
      }),
      ...analysis.facts.map((f) => {
        const ev = f.evidence[0];
        return new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: f.id, font: "Courier New" })] })] }),
            new TableCell({ children: [new Paragraph(f.type)] }),
            new TableCell({ children: [new Paragraph(ev ? ev.fileName : "N/C")] }),
            new TableCell({ children: [new Paragraph(ev && ev.page ? String(ev.page) : "N/C")] }),
            new TableCell({ children: [new Paragraph(ev && ev.originalText ? `"${ev.originalText}"` : "Sin cita")] })
          ]
        });
      })
    ];

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Title & Header
            new Paragraph({
              text: titleText,
              heading: HeadingLevel.TITLE,
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              text: `Expediente: ${analysis.study.name} | Fecha: ${new Date(analysis.executionManifest.generatedAt).toLocaleDateString("es-CL")}`,
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Modelo de IA: ${analysis.executionManifest.model} | Cobertura de Evidencia: ${analysis.executionManifest.evidenceCoverage}%`,
                  italics: true,
                  size: 20
                })
              ],
              alignment: AlignmentType.CENTER
            }),
            new Paragraph({ text: "" }),

            // Section 1: Scope
            new Paragraph({ text: "1. ALCANCE Y ANTECEDENTES ANALIZADOS", heading: HeadingLevel.HEADING_1 }),
            new Paragraph(
              "El presente informe ha sido estructurado mediante procesamiento automatizado con trazabilidad estricta y control de evidencia sobre los documentos auténticos acompañados, sin inclusión de inferencias desprovistas de respaldo material."
            ),
            new Paragraph({ text: "" }),

            // Section 2: Documents
            new Paragraph({ text: "2. NÓMINA DE DOCUMENTOS Y RESGUARDO CRIPTOGRÁFICO", heading: HeadingLevel.HEADING_1 }),
            new Table({
              rows: docRows,
              width: { size: 100, type: WidthType.PERCENTAGE }
            }),
            new Paragraph({ text: "" }),

            // Section 3: Findings
            new Paragraph({ text: "3. HECHOS Y HALLAZGOS TÉCNICOS DESTACADOS", heading: HeadingLevel.HEADING_1 }),
            ...analysis.findings.map(
              (find) =>
                new Paragraph({
                  children: [
                    new TextRun({ text: `[${find.category}] `, bold: true }),
                    new TextRun({ text: find.statement })
                  ],
                  bullet: { level: 0 }
                })
            ),
            new Paragraph({ text: "" }),

            // Section 4: Discrepancies & Gaps
            new Paragraph({ text: "4. DISCREPANCIAS Y VACÍOS DOCUMENTALES", heading: HeadingLevel.HEADING_1 }),
            new Paragraph({ text: "Discrepancias Detectadas:", heading: HeadingLevel.HEADING_2 }),
            ...(analysis.discrepancies.length > 0
              ? analysis.discrepancies.map((d) => new Paragraph({ text: `- ${d}` }))
              : [new Paragraph("No se constataron discrepancias insalvables entre las fuentes cotejadas.")]),
            new Paragraph({ text: "Vacíos Documentales (Documentos No Aportados):", heading: HeadingLevel.HEADING_2 }),
            ...(analysis.missingEvidence.length > 0
              ? analysis.missingEvidence.map((m) => new Paragraph({ text: `- ${m}` }))
              : [new Paragraph("No se detectaron vacíos de títulos indispensables en el tracto examinado.")]),
            new Paragraph({ text: "" }),

            // Section 5: Conclusions
            new Paragraph({ text: "5. CONCLUSIONES Y DICTAMEN TÉCNICO-LEGAL", heading: HeadingLevel.HEADING_1 }),
            ...analysis.conclusions.map(
              (c, i) =>
                new Paragraph({
                  children: [
                    new TextRun({ text: `Conclusión ${i + 1}: `, bold: true }),
                    new TextRun({ text: c.text }),
                    new TextRun({ text: ` (Respaldada por: ${c.supportingFactIds.join(", ")})`, italics: true, size: 18 })
                  ]
                })
            ),
            new Paragraph({ text: "" }),

            // Section 6: Annex of Traceability
            new Paragraph({ text: "6. ANEXO DE TRAZABILIDAD Y MATRIZ DE EVIDENCIA", heading: HeadingLevel.HEADING_1 }),
            new Paragraph(
              "Toda afirmación contenida en este reporte deriva matemáticamente de la siguiente tabla de citas verificables:"
            ),
            new Table({
              rows: traceRows,
              width: { size: 100, type: WidthType.PERCENTAGE }
            })
          ]
        }
      ]
    });

    return await Packer.toBuffer(doc);
  }
}
