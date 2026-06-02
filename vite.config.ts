import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
