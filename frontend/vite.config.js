import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/auth': { target: 'http://localhost:3000', changeOrigin: true },
      '/satellite': { target: 'http://localhost:3000', changeOrigin: true },
      '/window': { target: 'http://localhost:3000', changeOrigin: true },
      '/ground': { target: 'http://localhost:3000', changeOrigin: true },
      '/missions': { target: 'http://localhost:3000', changeOrigin: true },
      '/plan': { target: 'http://localhost:3000', changeOrigin: true },
      '/maneuver': { target: 'http://localhost:3000', changeOrigin: true },
      '/debris': { target: 'http://localhost:3000', changeOrigin: true },
      '/gc-requests': { target: 'http://localhost:3000', changeOrigin: true },
    },
  },
});
