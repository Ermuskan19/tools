import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const root = document.getElementById('root')
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)

const normalizePath = (value) => (value.replace(/\/+$/, '') || '/')
const prerenderPath = root.dataset.prerenderPath

if (root.hasChildNodes() && prerenderPath && normalizePath(prerenderPath) === normalizePath(window.location.pathname)) {
  hydrateRoot(root, app)
} else {
  root.replaceChildren()
  createRoot(root).render(app)
}
