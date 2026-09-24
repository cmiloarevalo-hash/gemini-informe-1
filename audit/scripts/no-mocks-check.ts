import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

console.log("==================================================");
console.log("🛡️  VERIFICACIÓN DE AUSENCIA DE MOCKS EN PRODUCCIÓN");
console.log("==================================================");

const forbiddenTokens = [
  "Inversiones y Rentas Los Robles",
  "Agrícola Central",
  "René Benavente",
  "Fojas 1234 N° 567",
  "CBR Santiago",
  "Fojas 980 N° 450",
  "8,85 ha",
  "87.900 m²",
  "250,40 m",
  "248,80 m",
  "Fundo San Juan de Pirque",
  "fakeData",
  "mockPdf",
  "sampleDocument",
  "dummyFact",
  "simulateAnalysis"
];

let issues = 0;

function scanFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf8");
  for (const token of forbiddenTokens) {
    if (content.includes(token)) {
      console.error(`[ERROR_DATOS_HARDCODEADOS] Token prohibido '${token}' encontrado en: ${path.relative(projectRoot, filePath)}`);
      issues++;
    }
  }
}

function scanDirectory(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== "tests" && entry.name !== "fixtures" && entry.name !== ".git") {
        scanDirectory(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      scanFile(fullPath);
    }
  }
}

// Scan src and server.ts
scanDirectory(path.join(projectRoot, "src"));
scanFile(path.join(projectRoot, "server.ts"));

if (issues === 0) {
  console.log("\n✅ CERO DATOS HARDCODEADOS NI MOCKS EN PRODUCCIÓN.");
  process.exit(0);
} else {
  console.error(`\n❌ ERROR: Se detectaron ${issues} ocurrencias de datos sintéticos o mocks en código de producción.`);
  process.exit(1);
}
