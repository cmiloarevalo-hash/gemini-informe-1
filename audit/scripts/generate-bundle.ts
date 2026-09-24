import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const auditDir = path.resolve(__dirname, "..");

console.log("📦 Regenerando Audit Index...");
const files = fs.readdirSync(auditDir).filter((f) => f.endsWith(".json"));

const indexData = {
  bundleVersion: "1.0.0",
  generatedAt: new Date().toISOString(),
  files: files.map((f) => `audit/${f}`).sort(),
  verificationCommand: "npm run audit",
  noMocksCheckCommand: "npm run audit:no-mocks"
};

fs.writeFileSync(path.join(auditDir, "AUDIT_INDEX.json"), JSON.stringify(indexData, null, 2));
console.log("✅ Audit Index actualizado exitosamente.");
