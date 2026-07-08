// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://linkar.vercel.app',
  output: 'static',
  adapter: vercel(),
  integrations: [sitemap({
    filter: (page) => !page.endsWith('/program/') && !page.endsWith('/blog/')
  })]
});