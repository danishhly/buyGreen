import { StrictMode } from 'react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import "./styles.css"
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastProvider } from './Component/Toast.jsx';

// Suppress harmless console warnings from third-party libraries
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args[0]?.toString() || '';
    // Suppress known harmless warnings from third-party libraries
    if (
      message.includes('Cross-Origin-Opener-Policy') ||
      message.includes('otp-credentials') ||
      message.includes('Unrecognized feature')
    ) {
      // Silently ignore these warnings
      return;
    }
    originalWarn.apply(console, args);
  };
}

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

if (!googleClientId) {
  console.warn('VITE_GOOGLE_CLIENT_ID is not set. Google sign-in will not work.');
  console.warn('Please set VITE_GOOGLE_CLIENT_ID in Vercel environment variables.');
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {googleClientId ? (
      <GoogleOAuthProvider clientId={googleClientId}>
        <BrowserRouter>
          <ToastProvider>
            <App />
          </ToastProvider>
        </BrowserRouter>
      </GoogleOAuthProvider>
    ) : (
      <BrowserRouter>
        <ToastProvider>
          <App />
        </ToastProvider>
      </BrowserRouter>
    )}
  </React.StrictMode>
);
