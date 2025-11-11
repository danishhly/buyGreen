import { StrictMode } from 'react'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import "./styles.css"
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ToastProvider } from './Component/Toast.jsx';

// Suppress harmless console warnings/errors from third-party libraries
// This must run BEFORE any scripts are loaded
if (typeof window !== 'undefined') {
  // Store original console methods
  const originalWarn = console.warn;
  const originalError = console.error;
  const originalLog = console.log;
  
  // Helper function to check if message should be suppressed
  const shouldSuppress = (message) => {
    if (!message) return false;
    const msg = message.toString();
    return (
      msg.includes('Cross-Origin-Opener-Policy') ||
      msg.includes('otp-credentials') ||
      msg.includes('Unrecognized feature') ||
      msg.includes('Cross-Origin-Opener-Policy policy would block') ||
      msg.includes('checkout.js')
    );
  };
  
  // Override console.warn
  console.warn = (...args) => {
    if (shouldSuppress(args[0])) {
      return; // Silently ignore
    }
    originalWarn.apply(console, args);
  };
  
  // Override console.error to catch errors that are actually warnings
  console.error = (...args) => {
    if (shouldSuppress(args[0])) {
      return; // Silently ignore
    }
    originalError.apply(console, args);
  };
  
  // Also override console.log in case some libraries use it for warnings
  console.log = (...args) => {
    // Only suppress if it's clearly a warning/error message
    if (args.length > 0 && typeof args[0] === 'string' && shouldSuppress(args[0])) {
      return; // Silently ignore
    }
    originalLog.apply(console, args);
  };
  
  // Intercept unhandled errors
  window.addEventListener('error', (event) => {
    if (event.message && shouldSuppress(event.message)) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  }, true); // Use capture phase to catch early
  
  // Intercept unhandled promise rejections that might log warnings
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && shouldSuppress(event.reason.toString())) {
      event.preventDefault();
      return false;
    }
  });
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
