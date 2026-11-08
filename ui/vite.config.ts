import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
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
