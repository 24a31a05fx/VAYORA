import fs from 'fs';
import path from 'path';

const TARGET_DIRS = ['src', 'server'];
const CONFIG_FILES = [
  'server.ts',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.test.json',
  '.oxlintrc.json',
  'package.json',
  '.nvmrc',
  'index.html',
];

const results = [];

function scanDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (/\.(ts|tsx|js|mjs|json|css|html)$/.test(entry.name)) {
      analyzeFile(fullPath);
    }
  }
}

function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const totalLines = lines.length;
  let codeLines = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*') && !trimmed.startsWith('*')) {
      codeLines++;
    }
  }
  const relPath = filePath.replace(/\\/g, '/');
  results.push({ path: relPath, totalLines, codeLines });
}

for (const dir of TARGET_DIRS) {
  if (fs.existsSync(dir)) scanDir(dir);
}
for (const file of CONFIG_FILES) {
  if (fs.existsSync(file)) analyzeFile(file);
}

results.sort((a, b) => a.path.localeCompare(b.path));

console.log(`Total Scanned Files: ${results.length}`);
const over200 = results.filter(r => r.totalLines > 200);
console.log(`Files over 200 lines: ${over200.length}`);
if (over200.length > 0) {
  for (const f of over200) {
    console.log(`  - ${f.path}: ${f.totalLines} lines`);
  }
}

// Generate Markdown Table
console.log('\n--- Markdown Table Preview ---');
console.log('| File Path | Total Lines | Code Lines | Status (Limit: 200) |');
console.log('|---|---|---|---|');
for (const r of results) {
  console.log(`| \`${r.path}\` | ${r.totalLines} | ${r.codeLines} | ${r.totalLines <= 200 ? '✅ Compliant' : '❌ Exceeded'} |`);
}
