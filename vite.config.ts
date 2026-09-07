/// <reference types="vitest" />
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// add plugin for code coverage
import istanbul from 'vite-plugin-istanbul';
import { twdRemote } from 'twd-relay/vite';
import { twd } from 'twd-js/vite-plugin';
import { twdSnapshot } from 'twd-js/vite-plugin';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    twd({
      testFilePattern: '/**/*.twd.test.{ts,tsx}',
      search: true,
    }),
    // configure istanbul plugin
    istanbul({
      include: 'src/**/*',
      exclude: ['node_modules', 'tests/'],
      extension: ['.ts', '.tsx'],
      requireEnv: process.env.CI ? true : false,
    }),
    twdRemote(),
    // debug: true para poder decidir el veredicto desde el sidebar/relay.
    // Por defecto está off: el veredicto lo da twd-cli.
    twdSnapshot({ debug: true }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    watch: {
      ignored: ["**/data/data.json", "**data/routes.json"],
    },
  },
})