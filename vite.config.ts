import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
  server: {
    proxy: {
      '/api/bcra': {
        target: 'https://api.bcra.gob.ar/centraldedeudores/v1.0',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/bcra/, ''),
      },
    },
  },
});