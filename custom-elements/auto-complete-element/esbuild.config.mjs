import esbuild from 'esbuild';

esbuild
  .build({
    entryPoints: ['src/index.ts'],
    outfile: 'dist/index.js',
    watch: process.argv.includes('--watch'),
    bundle: true,
    minify: true,
    external: ['@ambiki/combobox'],
    format: 'esm',
  })
  .catch(() => process.exit(1));
