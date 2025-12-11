import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [
    react(),
    tailwind(),
    sitemap({
      filter: (page) => !page.includes('/thank-you'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    })
  ],
  site: 'https://solarsavings.com',
  output: 'static'
});
