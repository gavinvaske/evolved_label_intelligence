import React from 'react'
import { createRoot } from 'react-dom/client';
import { App } from './App/App'
import { BrowserRouter } from 'react-router-dom';
import { FlashMessagePanel } from './_global/FlashMessagePanel/FlashMessagePanel';
import { AuthProvider } from './_context/authProvider';
import { ModalProvider } from './_context/modalProvider';
import './_styles/main.scss'

const rootHtmlElement = document.getElementById('root');
const root = createRoot(rootHtmlElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> 
        <ModalProvider>
          <FlashMessagePanel />
          <App />
        </ModalProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);