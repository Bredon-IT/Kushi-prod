import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Customer app (served from root "/")
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // 👇 No base needed, because it's at root
});
