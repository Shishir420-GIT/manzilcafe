import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: "**/*.{jsx,tsx}",
      fastRefresh: true,
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: '127.0.0.1',
    strictPort: true,
    hmr: {
      port: 5173,
      host: '127.0.0.1',
      protocol: 'ws',
      clientPort: 5173,
    },
    watch: {
      usePolling: false,
    },
  },
  clearScreen: false,
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@vitejs/plugin-react'],
  },
});
