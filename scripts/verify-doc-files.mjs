import fs from 'fs';
import path from 'path';

// Gather all markdown files
const mdFiles = [];
function findMd(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git', 'coverage'].includes(f.name)) continue;
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      findMd(full);
    } else if (f.name.endsWith('.md')) {
      mdFiles.push(full);
    }
  }
}
findMd('.');

// Collect all existing files in repo
const repoFiles = new Set();
function findRepoFiles(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git', 'coverage'].includes(f.name)) continue;
    const full = path.join(dir, f.name);
    if (f.isDirectory()) {
      findRepoFiles(full);
    } else {
      repoFiles.add(full.replace(/\\/g, '/').replace(/^\.\//, ''));
    }
  }
}
findRepoFiles('.');

const fileRefRegex = /[`*(['"]([a-zA-Z0-9_\-./\\]+\.(?:ts|tsx|js|jsx|json|css|html|yml|yaml|d\.ts))\b/g;
const ignoredTokens = new Set(['node.js', 'express.json', 'client.d.ts', 'tsconfig.tsbuildinfo', 'tsconfig.test.tsbuildinfo']);

const missing = [];
for (const md of mdFiles) {
  const content = fs.readFileSync(md, 'utf-8');
  let match;
  while ((match = fileRefRegex.exec(content)) !== null) {
    let raw = match[1];
    let ref = raw.replace(/\\/g, '/').replace(/^\.\//, '');
    ref = ref.replace(/[`'"()\]:,.;]+$/, '');
    if (!ref || ref.includes('*') || ref.startsWith('http') || ref.endsWith('.min.js')) continue;
    if (ignoredTokens.has(ref.toLowerCase())) continue;

    // Check if direct match exists
    if (repoFiles.has(ref)) continue;

    // Check if it's a basename that matches a unique file
    const basename = path.basename(ref);
    const matches = Array.from(repoFiles).filter(f => path.basename(f) === basename);

    if (matches.length > 0 && !ref.includes('/')) {
      // It was just a bare filename and it exists in repo
      continue;
    }

    missing.push({ md: md.replace(/\\/g, '/'), ref, candidateMatches: matches });
  }
}

if (missing.length > 0) {
  console.error(`Found ${missing.length} missing or mismatched file references:`);
  for (const m of missing) {
    console.error(`- In ${m.md}: "${m.ref}" (candidates: ${m.candidateMatches.join(', ') || 'none'})`);
  }
  process.exit(1);
} else {
  console.log(`Verified: All file references across ${mdFiles.length} documentation files exist in the repository!`);
}
