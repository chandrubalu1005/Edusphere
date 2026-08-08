import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy /api/* to the nginx gateway (port 80) when running Vite dev server
    // alongside the Docker stack. This means `npm run dev` in frontend/ works
    // as long as `docker compose up` is also running.
    proxy: {
      '/api': {
        target: 'http://localhost:80',
        changeOrigin: true,
        // Do NOT rewrite — the gateway expects /api/auth/, /api/users/, etc.
      },
      '/socket.io': {
        target: 'http://localhost:80',
        changeOrigin: true,
        ws: true,
      }
    }
  }
});
