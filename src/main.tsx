//main.tsx is the application entry point; it mounts the React app into the DOM root element
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

//createRoot attaches the React tree to the HTML element with id root
//StrictMode enables extra development checks for child components
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
