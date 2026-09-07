// Force Vite restart
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const USE_GATEWAY = process.env.VITE_USE_GATEWAY === 'true';
const GATEWAY_URL = process.env.VITE_GATEWAY_URL || 'http://localhost:80';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: USE_GATEWAY ? {
      '/api': {
        target: GATEWAY_URL,
        changeOrigin: true,
      },
      '/socket.io': {
        target: GATEWAY_URL,
        changeOrigin: true,
        ws: true,
      }
    } : {
      '/api/auth': { target: 'http://localhost:3001', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/auth/, '') },
      '/api/users': { target: 'http://localhost:3002', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/users/, '') },
      '/api/courses': { target: 'http://localhost:3003', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/courses/, '') },
      '/api/notifications': { target: 'http://localhost:3004', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/notifications/, '/notifications') },
      '/api/assessments': { target: 'http://localhost:3005', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/assessments/, '/assessments') },
      '/api/assignments': { target: 'http://localhost:3006', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/assignments/, '/assignments') },
      '/api/submissions': { target: 'http://localhost:3006', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/submissions/, '/submissions') },
      '/api/certificates': { target: 'http://localhost:3007', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/certificates/, '/certificates') },
      '/api/attendance': { target: 'http://localhost:3008', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/attendance/, '') },
      '/api/leave': { target: 'http://localhost:3008', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/leave/, '/leave') },
      '/api/timetable': { target: 'http://localhost:3009', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/timetable/, '') },
      '/api/calendar': { target: 'http://localhost:3010', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/calendar/, '') },
      '/api/library': { target: 'http://localhost:3011', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/library/, '') },
      '/api/placement': { target: 'http://localhost:3012', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/placement/, '') },
      '/api/discussion': { target: 'http://localhost:3013', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/discussion/, '') },
      '/api/analytics': { target: 'http://localhost:3014', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/analytics/, '') },
      '/api/admin': { target: 'http://localhost:3015', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/admin/, '') },
      '/api/finance': { target: 'http://localhost:3016', changeOrigin: true, rewrite: (p) => p.replace(/^\/api\/finance/, '') },
      '/socket.io': { target: 'http://localhost:3004', changeOrigin: true, ws: true },
      '/attendance-socket': { target: 'http://localhost:3008', changeOrigin: true, ws: true, rewrite: (p) => p.replace(/^\/attendance-socket/, '/socket.io') }
    }
  }
});
