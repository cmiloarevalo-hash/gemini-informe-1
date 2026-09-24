import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const auditDir = path.resolve(__dirname, "..");

console.log("==================================================");
console.log("🔍 AUDIT BUNDLE VERIFICATION CHECK");
console.log("==================================================");

const requiredFiles = [
  "AUDIT_INDEX.json",
  "BUILD_MANIFEST.json",
  "CAPABILITIES.json",
  "COST_PROFILE.json",
  "DEVIATIONS.json",
  "MODEL_DISCOVERY.json",
  "REQUIREMENTS_MATRIX.json",
  "RESEARCH_SOURCES.json",
  "SECURITY_STATUS.json",
  "TEST_SUMMARY.json"
];

let missing = 0;
for (const file of requiredFiles) {
  const filePath = path.join(auditDir, file);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      JSON.parse(content);
      console.log(`[PASS] ${file} existe y es JSON válido.`);
    } catch {
      console.error(`[FAIL] ${file} contiene JSON corrupto.`);
      missing++;
    }
  } else {
    console.error(`[FAIL] Falta archivo obligatorio: ${file}`);
    missing++;
  }
}

if (missing === 0) {
  console.log("\n✅ Todos los artefactos del Audit Bundle están conformes y verificados.");
  process.exit(0);
} else {
  console.error(`\n❌ Se encontraron ${missing} fallas en el Audit Bundle.`);
  process.exit(1);
}
