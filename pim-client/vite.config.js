import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const useSSL = env.VITE_USE_SSL === 'true';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@src': path.resolve(__dirname, './src'),
        '@app': path.resolve(__dirname, './src/app'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
        '@assets': path.resolve(__dirname, './src/assets'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/__tests__/setup.js'],
      include: ['src/**/*.{test,spec}.{js,jsx}'],
    },
    build: {
      sourcemap: false,
      manifest: true,
      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]',
        },
      },
    },
    server: useSSL
      ? {
          https: {
            key: fs.readFileSync(
              path.resolve(__dirname, 'certs/_wildcard.local.com-key.pem')
            ),
            cert: fs.readFileSync(
              path.resolve(__dirname, 'certs/_wildcard.local.com.pem')
            ),
          },
          host: 'pim.local.com',
          port: 3001,
          open: true,
          proxy: {
            '/api': {
              target: 'https://localhost:7082',
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : {
          port: 5174,
          proxy: {
            '/api': {
              target: 'https://localhost:7082',
              changeOrigin: true,
              secure: false,
            },
          },
        },
  };
});
