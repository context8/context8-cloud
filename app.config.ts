import { defineConfig } from '@tanstack/react-start/config';
import tsConfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  tsr: {
    appDirectory: 'src',
  },
  server: {
    preset: process.env.VERCEL ? 'vercel' : 'node-server',
  },
  vite: {
    plugins: [
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
    ],
  },
});

