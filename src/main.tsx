import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AppProvider } from './contexts/AppContext'

// Remove dark mode class addition
createRoot(document.getElementById("root")!).render(
  <AppProvider>
    <App />
  </AppProvider>
);