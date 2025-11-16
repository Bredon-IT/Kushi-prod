import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Admin app (served from "/admin/")
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: '/admin/',   // 👈 Critical: ensures assets load from /admin/assets/
});