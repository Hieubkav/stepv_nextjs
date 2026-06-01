// Script chạy một lần để migrate legacy stats
// Chạy bằng: node scripts/migrate-stats.mjs

import { readFileSync } from "fs";
import { resolve } from "path";

// Đọc CONVEX_URL từ .env.local
let convexUrl = "";
try {
  const envContent = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
  for (const line of envContent.split("\n")) {
    const match = line.match(/^CONVEX_URL=(.+)$/);
    if (match) {
      convexUrl = match[1].trim();
      break;
    }
  }
} catch {}

if (!convexUrl) {
  console.error("❌ Không tìm thấy CONVEX_URL trong .env.local");
  process.exit(1);
}

console.log(`🔗 Connecting to: ${convexUrl}`);

// Gọi Convex HTTP API trực tiếp
const response = await fetch(`${convexUrl}/api/mutation`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    path: "web_demos:migrateLegacyStats",
    args: {},
    format: "json",
  }),
});

const text = await response.text();

if (!response.ok) {
  console.error("❌ Lỗi HTTP:", response.status, text);
  process.exit(1);
}

try {
  const result = JSON.parse(text);
  console.log("✅ Migration thành công:", JSON.stringify(result, null, 2));
} catch {
  console.log("Response raw:", text);
}
