import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Log configuration on startup
console.log('=== FRONTEND STARTUP CONFIGURATION ===');
console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL || 'NOT SET');
console.log('Environment mode:', import.meta.env.MODE);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
