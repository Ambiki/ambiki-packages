import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

esbuild
  .build({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    watch: process.argv.includes('--watch'),
    bundle: true,
    minify: true,
    external: Object.keys(JSON.parse(fs.readFileSync(path.resolve('./package.json'), 'utf-8')).dependencies),
    format: 'esm',
  })
  .catch(() => process.exit(1));
