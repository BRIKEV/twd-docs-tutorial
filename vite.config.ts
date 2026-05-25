/// <reference types="vitest" />
import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig, PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import { twd } from 'twd-js/vite-plugin';
import { twdRemote } from 'twd-relay/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // changes
    twd({
      testFilePattern: '/**/*.twd.test.{ts,tsx}',
      search: true,
    }),
    twdRemote() as PluginOption,
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