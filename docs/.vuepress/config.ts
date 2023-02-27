import { defineConfig } from 'vuepress/config';

export default defineConfig({
  base: '/ambiki-packages/',
  title: 'Ambiki packages',
  description: 'A collection of everyday web-components and libraries.',
  themeConfig: {
    repo: 'Ambiki/ambiki-packages',
    docsDir: 'docs',
    docsBranch: 'main',
    editLinks: true,
    editLinkText: 'Edit this page on GitHub',
    lastUpdated: 'Last Updated',
    smoothScroll: true,
    nav: [
      { text: 'Guide', link: '/' },
      { text: 'Changelog', link: 'https://github.com/Ambiki/ambiki-packages/blob/main/CHANGELOG.md' },
    ],
    sidebar: [
      '/',
      {
        title: 'Custom elements',
        children: ['/custom-elements/auto-complete-element/', '/custom-elements/clippy-copy-element/'],
        collapsable: false,
        sidebarDepth: 3,
      },
      { title: 'Packages', children: ['/packages/combobox/'], collapsable: false, sidebarDepth: 3 },
    ],
  },
});
