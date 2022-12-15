import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  nodeResolve: true,
  open: true,
  preserveSymlinks: true,
  appIndex: './playground/index.html',
  plugins: [esbuildPlugin({ ts: true })],
};
