import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { AstroPWAIntegration as AstroPWA } from '@vite-pwa/astro';

// Served from GitHub Pages as a project site: https://goblindegook.github.io/ai-sdlc/
export default defineConfig({
  site: 'https://goblindegook.github.io',
  base: '/ai-sdlc',
  trailingSlash: 'always',
  integrations: [
    sitemap(),
    AstroPWA({
      registerType: 'autoUpdate',
      manifest: false,
      generateSW: {
        navigateFallback: null, // every page is precached
        globPatterns: ['**/*.{html,css,js,svg,png,ico,woff2,json}'],
        globIgnores: ['google*.html'],
        runtimeCaching: [
          { urlPattern: /^https:\/\/fonts\.googleapis\.com\//, handler: 'StaleWhileRevalidate', options: { cacheName: 'google-fonts-css' } },
          { urlPattern: /^https:\/\/fonts\.gstatic\.com\//, handler: 'CacheFirst', options: { cacheName: 'google-fonts-files', expiration: { maxEntries: 30 }, cacheableResponse: { statuses: [0, 200] } } },
        ],
      },
    }),
  ],
});
