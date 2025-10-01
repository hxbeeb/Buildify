import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'conditional-coop-coep',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req?.url?.startsWith('/builder')) {
            res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          }
          next();
        });
      }
    }
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {},
  build: {
    outDir: 'dist'
  }
});
