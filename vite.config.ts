import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  clearScreen: false,
  plugins: [
    react({
      include: "**/*.{jsx,tsx}",
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true,
  },
  define: {
    // Fix WebSocket issues
    global: 'globalThis',
  }
});
