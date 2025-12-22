import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Check if key is missing or invalid
if (!PUBLISHABLE_KEY || PUBLISHABLE_KEY.trim() === '') {
  console.warn("⚠️  Missing Clerk Publishable Key.");
  console.warn("⚠️  To enable authentication:");
  console.warn("   1. Create frontend/.env.local file");
  console.warn("   2. Add: VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here");
  console.warn("   3. Restart the dev server");
  console.warn("⚠️  App will run but authentication features will not work.");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {PUBLISHABLE_KEY && PUBLISHABLE_KEY.trim() !== '' ? (
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <App />
      </ClerkProvider>
    ) : (
      <div style={{ 
        padding: '40px 20px', 
        textAlign: 'center', 
        fontFamily: 'system-ui, -apple-system, sans-serif',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h1 style={{ color: '#dc2626', marginBottom: '16px' }}>⚠️ Clerk Configuration Required</h1>
        <div style={{ background: '#fef3c7', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <p style={{ marginBottom: '12px', fontWeight: '500' }}>To enable authentication, please:</p>
          <ol style={{ textAlign: 'left', display: 'inline-block', margin: '0' }}>
            <li style={{ marginBottom: '8px' }}>Create a <code style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px' }}>frontend/.env.local</code> file</li>
            <li style={{ marginBottom: '8px' }}>Add: <code style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px' }}>VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here</code></li>
            <li style={{ marginBottom: '8px' }}>Get your key from <a href="https://clerk.com" target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>clerk.com</a></li>
            <li>Restart the dev server</li>
          </ol>
        </div>
        <p style={{ color: '#6b7280' }}>See <code>CLERK_AUTHENTICATION_SETUP.md</code> for detailed instructions.</p>
      </div>
    )}
  </StrictMode>,
)
