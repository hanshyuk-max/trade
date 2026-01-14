/**
 * Client Entry Point
 * 
 * Mounts the React application to the DOM.
 * 
 * Last Modified: 2026-01-14
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
