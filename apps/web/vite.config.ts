import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const allowedHosts =
    typeof env.VITE_ALLOWED_HOSTS === 'string' && env.VITE_ALLOWED_HOSTS.trim() !== ''
      ? env.VITE_ALLOWED_HOSTS.split(',').map(h => h.trim())
      : undefined;

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      ...(allowedHosts ? { allowedHosts } : {}),
    },

    plugins: [react()],

    define: {
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
  };
});
