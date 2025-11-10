import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    build: {
      outDir: 'build',
    },
    plugins: [
      react(),
      VitePWA({
        srcDir: "src/serviceWorker",
        filename: "index.js",
        registerType: "autoUpdate",
        strategies: "injectManifest",
        manifest: false,
        devOptions: {
          enabled: true
        }
      })
    ],
  };
});