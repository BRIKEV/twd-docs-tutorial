import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Browser-mode MSW worker. Relies on public/mockServiceWorker.js
// (generated via `npx msw init public/`).
export const worker = setupWorker(...handlers)
