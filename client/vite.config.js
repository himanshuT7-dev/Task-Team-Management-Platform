import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      },
      '/tasks': {
        target: 'http://localhost:5001',
        changeOrigin: true
      },
      '/users': {
        target: 'http://localhost:5001',
        changeOrigin: true
      },
      '/login': {
        target: 'http://localhost:5001',
        changeOrigin: true
      },
      '/register': {
        target: 'http://localhost:5001',
        changeOrigin: true
      },
      '/health': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  }
});
