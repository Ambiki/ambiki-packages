import fs from 'fs';
import { esbuildPlugin } from '@web/dev-server-esbuild';

const filteredDir = (workspace) =>
  fs.readdirSync(workspace).filter((dir) => fs.statSync(`${workspace}/${dir}`).isDirectory());

const workspaces = [...filteredDir('custom-elements'), ...filteredDir('packages')];

export default {
  concurrency: 10,
  nodeResolve: true,
  watch: process.argv.includes('--watch'),
  groups: workspaces.map((pkg) => ({
    name: pkg,
    files: `**/${pkg}/spec/**/*.spec.ts`,
  })),
  plugins: [esbuildPlugin({ ts: true })],
};
