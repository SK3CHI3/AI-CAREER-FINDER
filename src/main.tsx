import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Default the app to light theme
if (!document.documentElement.classList.contains('light')) {
  document.documentElement.classList.add('light')
}

createRoot(document.getElementById("root")!).render(<App />);
