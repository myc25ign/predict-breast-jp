import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const base =
  process.env.VITE_BASE_PATH ??
  (process.env.GITHUB_ACTIONS === 'true' ? '/predict-breast-jp/' : '/');

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      '@predict': path.resolve(__dirname, '../ts/src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
