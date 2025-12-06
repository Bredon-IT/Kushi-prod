import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',    // ✅ REQUIRED for proper routing on Amplify
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
