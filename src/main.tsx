import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from "react-router";
import router from './AppRoutes';

if (import.meta.env.DEV) {
  const { createBrowserClient } = await import('twd-relay/browser');
  const client = createBrowserClient();
  client.connect();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
