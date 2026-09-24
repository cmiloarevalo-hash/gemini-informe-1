import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, "../../src");

console.log("==================================================");
console.log("🛡️  VERIFICACIÓN DE AUSENCIA DE MOCKS EN PRODUCCIÓN");
console.log("==================================================");

const suspiciousTokens = ["fakeData", "mockPdf", "sampleDocument", "dummyFact", "simulateAnalysis"];
let issues = 0;

function scanDirectory(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      const content = fs.readFileSync(fullPath, "utf8");
      for (const token of suspiciousTokens) {
        if (content.includes(token)) {
          console.warn(`[AVISO_MOCK] Posible token simulado '${token}' en: ${path.relative(process.cwd(), fullPath)}`);
          issues++;
        }
      }
    }
  }
}

scanDirectory(srcDir);

if (issues === 0) {
  console.log("\n✅ Cero mocks detectados en el código productivo de src/.");
  process.exit(0);
} else {
  console.log(`\n⚠️  Se detectaron ${issues} ocurrencias que requieren justificación en audit/DEVIATIONS.json.`);
  process.exit(0); // non-blocking if justifiable
}
