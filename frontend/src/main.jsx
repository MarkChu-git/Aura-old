/**
 * @file main.jsx
 * @author Aura Team
 * @created 2024-01-01
 * @description Application entry point. Mounts the React application to the DOM.
 * Configures StrictMode, Router, and global styles/i18n.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './config/i18n'
import App from './App.jsx'

/**
 * Mounts the React application.
 * 
 * Structure:
 * - StrictMode: Checks for potential problems in the app during development.
 * - BrowserRouter: Enables client-side routing.
 * - App: The root component.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
