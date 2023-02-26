import { defineConfig } from 'vuepress/config';

export default defineConfig({
  title: 'Ambiki packages',
  description: 'A collection of everyday web-components and libraries.',
  themeConfig: {
    repo: 'Ambiki/ambiki-packages',
    docsDir: 'docs',
    docsBranch: 'main',
    editLinks: true,
    editLinkText: 'Edit this page on GitHub',
    lastUpdated: 'Last Updated',
    sidebar: [
      '/',
      {
        title: 'Custom elements',
        children: ['/custom-elements/auto-complete-element/', '/custom-elements/clippy-copy-element/'],
        collapsable: false,
      },
      { title: 'Packages', children: ['/packages/combobox/'], collapsable: false },
    ],
  },
});
