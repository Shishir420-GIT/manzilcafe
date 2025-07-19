import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Ensure proper JSX runtime
      jsxRuntime: 'automatic',
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com https://www.youtube.com/iframe_api; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https: https://i.ytimg.com https://images.pexels.com https://lh3.googleusercontent.com https://*.googleusercontent.com; connect-src 'self' ws://localhost:5173 https://*.supabase.co https://generativelanguage.googleapis.com; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; media-src 'self' blob:;"
    }
  },
  define: {
    // Fix WebSocket issues
    global: 'globalThis',
  }
});
