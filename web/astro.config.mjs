// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://linkar.vercel.app',
  integrations: [sitemap({
    filter: (page) => !page.endsWith('/program/') && !page.endsWith('/blog/')
  })]
});