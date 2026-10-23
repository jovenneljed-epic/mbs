import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initGlobalThemeEngine, applyGlobalTheme } from './services/themeEngine'
import { LANDING_CONTENT_EVENT } from './services/landingPageContent'

// Initialize the Next-Gen Adaptive Global Theme Engine
// Automatically evaluates local time & ambient OS preferences with zero manual config
initGlobalThemeEngine();

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

