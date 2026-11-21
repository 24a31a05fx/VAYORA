// ============================================================
// scripts/analyze-bundle.mjs
// Generates bundle visualizer report in dist/stats.html
// ============================================================

process.env.ANALYZE = 'true';
const { build } = await import('vite');
await build();
console.log('Bundle analysis generated: dist/stats.html');
