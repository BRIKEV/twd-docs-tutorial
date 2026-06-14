import path from 'path'
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // tailwindcss() is required so `@import "tailwindcss"` in index.css
  // is compiled into real utility CSS inside the browser test.
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    // keep browser-mode tests isolated to the example folder
    include: ['vitest-example/**/*.test.{ts,tsx}'],
    // loads the app's global styles once for every browser test
    setupFiles: ['./src/index.css'],
    browser: {
      enabled: true,
      headless: false,
      provider: playwright(),

      // https://vitest.dev/config/browser/playwright
      instances: [
        { browser: 'chromium' },
      ],
    },
  },
})
