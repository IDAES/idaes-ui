import ReactDOM from 'react-dom/client';
import App from '@/App.tsx';
import '@/index.css';

import { AppContextProvider } from "@/AppContext.tsx";

// Initial app setting if not found in localStorage
if(!localStorage.getItem("appSetting")){
  localStorage.setItem("appSetting", "{}")
}

/**
 * App main entrance use return App wrap by context provider
 */
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <AppContextProvider>
      <App />
    </AppContextProvider>
)
