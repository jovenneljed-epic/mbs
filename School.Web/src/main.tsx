import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { applyGlobalTheme, LANDING_CONTENT_EVENT } from './services/landingPageContent'

// Apply the user-selected theme immediately to root document styling
applyGlobalTheme();

// Listen for live theme modifications across components or tabs
if (typeof window !== 'undefined') {
  window.addEventListener(LANDING_CONTENT_EVENT, (event: any) => {
    if (event?.detail?.colorTheme) {
      applyGlobalTheme(event.detail.colorTheme);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

