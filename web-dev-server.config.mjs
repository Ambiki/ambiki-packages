import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  open: true,
  appIndex: `custom-elements/${process.argv[3]}/examples/index.html`,
  nodeResolve: true,
  plugins: [esbuildPlugin({ ts: true })],
};
