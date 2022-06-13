import fs from 'fs';
import { esbuildPlugin } from '@web/dev-server-esbuild';

const customElements = fs
  .readdirSync('custom-elements')
  .filter((dir) => fs.statSync(`custom-elements/${dir}`).isDirectory());

export default {
  concurrency: 10,
  nodeResolve: true,
  watch: process.argv.includes('--watch'),
  groups: customElements.map((pkg) => ({
    name: pkg,
    files: `custom-elements/${pkg}/spec/**/*.spec.ts`,
  })),
  plugins: [esbuildPlugin({ ts: true })],
};
