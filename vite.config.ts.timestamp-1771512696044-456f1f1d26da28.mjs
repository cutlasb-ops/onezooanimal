// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.mjs";
import { copyFileSync, readdirSync, statSync } from "fs";
import { join } from "path";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    {
      name: "copy-public-files",
      apply: "build",
      writeBundle() {
        const publicDir = "public";
        const outDir = "dist";
        const files = readdirSync(publicDir);
        files.forEach((file) => {
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
    exclude: ["lucide-react"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBjb3B5RmlsZVN5bmMsIHJlYWRkaXJTeW5jLCBzdGF0U3luYywgbWtkaXJTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IHsgam9pbiB9IGZyb20gJ3BhdGgnO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAge1xuICAgICAgbmFtZTogJ2NvcHktcHVibGljLWZpbGVzJyxcbiAgICAgIGFwcGx5OiAnYnVpbGQnLFxuICAgICAgd3JpdGVCdW5kbGUoKSB7XG4gICAgICAgIGNvbnN0IHB1YmxpY0RpciA9ICdwdWJsaWMnO1xuICAgICAgICBjb25zdCBvdXREaXIgPSAnZGlzdCc7XG4gICAgICAgIGNvbnN0IGZpbGVzID0gcmVhZGRpclN5bmMocHVibGljRGlyKTtcblxuICAgICAgICBmaWxlcy5mb3JFYWNoKGZpbGUgPT4ge1xuICAgICAgICAgIGNvbnN0IHNyY1BhdGggPSBqb2luKHB1YmxpY0RpciwgZmlsZSk7XG4gICAgICAgICAgY29uc3QgZGVzdFBhdGggPSBqb2luKG91dERpciwgZmlsZSk7XG5cbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHN0YXRTeW5jKHNyY1BhdGgpLmlzRmlsZSgpKSB7XG4gICAgICAgICAgICAgIGNvcHlGaWxlU3luYyhzcmNQYXRoLCBkZXN0UGF0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgU2tpcHBpbmcgbG9ja2VkIGZpbGU6ICR7ZmlsZX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgXSxcbiAgYnVpbGQ6IHtcbiAgICBjb3B5UHVibGljRGlyOiBmYWxzZVxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBleGNsdWRlOiBbJ2x1Y2lkZS1yZWFjdCddLFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsb0JBQW9CO0FBQ3RQLE9BQU8sV0FBVztBQUNsQixTQUFTLGNBQWMsYUFBYSxnQkFBMkI7QUFDL0QsU0FBUyxZQUFZO0FBR3JCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixPQUFPO0FBQUEsTUFDUCxjQUFjO0FBQ1osY0FBTSxZQUFZO0FBQ2xCLGNBQU0sU0FBUztBQUNmLGNBQU0sUUFBUSxZQUFZLFNBQVM7QUFFbkMsY0FBTSxRQUFRLFVBQVE7QUFDcEIsZ0JBQU0sVUFBVSxLQUFLLFdBQVcsSUFBSTtBQUNwQyxnQkFBTSxXQUFXLEtBQUssUUFBUSxJQUFJO0FBRWxDLGNBQUk7QUFDRixnQkFBSSxTQUFTLE9BQU8sRUFBRSxPQUFPLEdBQUc7QUFDOUIsMkJBQWEsU0FBUyxRQUFRO0FBQUEsWUFDaEM7QUFBQSxVQUNGLFNBQVMsS0FBSztBQUNaLG9CQUFRLElBQUkseUJBQXlCLElBQUksRUFBRTtBQUFBLFVBQzdDO0FBQUEsUUFDRixDQUFDO0FBQUEsTUFDSDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsRUFDakI7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNaLFNBQVMsQ0FBQyxjQUFjO0FBQUEsRUFDMUI7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
