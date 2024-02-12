import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { AppContextProvider } from "./context/appMainContext";

if(!localStorage.getItem("appSetting")){
  localStorage.setItem("appSetting", "{}")
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <AppContextProvider>
      <App />
    </AppContextProvider>
)
