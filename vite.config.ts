import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base: the built site works at the root of a domain and under any
// GitHub Pages project subpath (https://<user>.github.io/<repo>/) unchanged.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
  },
});
