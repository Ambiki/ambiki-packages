import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  rootDir: '.',
  files: ['./custom-elements/**/*.spec.ts', './packages/**/*.spec.ts'],
  concurrentBrowsers: 3,
  nodeResolve: true,
  preserveSymlinks: true,
  watch: process.argv.includes('--watch'),
  plugins: [esbuildPlugin({ ts: true, target: 'auto' })],
};
