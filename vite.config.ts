import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, readdirSync, statSync, mkdirSync } from 'fs';
import { join } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-public-files',
      apply: 'build',
      writeBundle() {
        const publicDir = 'public';
        const outDir = 'dist';
        const files = readdirSync(publicDir);

        files.forEach(file => {
          const srcPath = join(publicDir, file);
          const destPath = join(outDir, file);

          try {
            if (statSync(srcPath).isFile()) {
              copyFileSync(srcPath, destPath);
            }
          } catch (err) {
            console.log(`Skipping locked file: ${file}`);
          }
        });
      }
    }
  ],
  build: {
    copyPublicDir: false
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
