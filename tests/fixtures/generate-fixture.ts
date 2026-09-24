import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function generateSyntheticPdf(): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { height } = page.getSize();

  page.drawText("CONSERVADOR DE BIENES RAÍCES DE BUIN", {
    x: 50,
    y: height - 60,
    size: 14,
    font: boldFont,
    color: rgb(0, 0, 0)
  });

  page.drawText("CERTIFICADO DE INSCRIPCIÓN DE DOMINIO VIGENTE", {
    x: 50,
    y: height - 85,
    size: 11,
    font: boldFont,
    color: rgb(0.2, 0.2, 0.2)
  });

  const lines = [
    "CERTIFICO: Que a fojas 120 número 45 del Registro de Propiedad del año 2022,",
    "rola inscrita la propiedad ubicada en la Comuna de Buin, correspondiente al Lote A.",
    "ROL DE AVALÚO FISCAL: 777-88.",
    "TITULAR DE DOMINIO: Inmobiliaria San Cristóbal SpA, RUT 76.543.210-K.",
    "SUPERFICIE DECLARADA: 5.000 m² (Cinco mil metros cuadrados).",
    "DESLINDES: Norte: con Camino Público en 50 metros; Sur: con Lote B en 50 metros;",
    "Oriente: con Parcela 3 en 100 metros; Poniente: con Canal de Regadío en 100 metros.",
    "TÍTULO ANTERIOR: Adquirida por compraventa otorgada con fecha 15 de marzo de 2018.",
    "CERTIFICACIÓN: El presente certificado acredita dominio vigente a la fecha de su expedición."
  ];

  let yPos = height - 130;
  for (const line of lines) {
    page.drawText(line, {
      x: 50,
      y: yPos,
      size: 10,
      font: font,
      color: rgb(0.1, 0.1, 0.1)
    });
    yPos -= 22;
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

// Generate file on disk
const fixtureDir = __dirname;
generateSyntheticPdf().then((buf) => {
  fs.writeFileSync(path.join(fixtureDir, "sample-inscripcion.pdf"), buf);
  fs.writeFileSync(path.join(fixtureDir, "archivo-sin-relacion-con-el-contenido.pdf"), buf);
  console.log("Fixtures generadas con éxito en tests/fixtures/");
});
