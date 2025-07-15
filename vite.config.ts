import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.youtube-nocookie.com https://www.youtube.com/iframe_api; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: https://i.ytimg.com; connect-src 'self' https://*.supabase.co https://generativelanguage.googleapis.com; frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com; media-src 'self' blob:;"
    }
  }
});
