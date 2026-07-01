'use client';

import { supabase } from '../api/stats/stats-repository';

export default function LoginPage() {
  const handleLogin = async (provider: 'google' | 'discord') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#11111b',
      fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      color: '#cdd6f4',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#1e1e2e',
        padding: '3rem 2.5rem',
        borderRadius: '16px',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
        border: '1px solid #313244'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          letterSpacing: '-0.05em',
          marginBottom: '0.75rem',
          color: '#a6e3a1'
        }}>
          B.Y.O.B. Stats
        </h1>
        <p style={{
          fontSize: '0.9rem',
          color: '#a6adc8',
          marginBottom: '2.5rem',
          lineHeight: '1.4'
        }}>
          Accedi per visualizzare le statistiche
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            onClick={() => handleLogin('google')} 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.8rem',
              backgroundColor: '#ffffff',
              color: '#1f1f1f',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.95rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            <img src="/login/google-logo.png" alt="Google Logo" style={{ width: '24px', height: '24px' }} />
            Accedi con Google
          </button>

          <button 
            onClick={() => handleLogin('discord')} 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              width: '100%',
              padding: '0.8rem',
              backgroundColor: '#5865F2',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontSize: '0.95rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <img src="/login/discord-logo.png" alt="Discord Logo" style={{ width: '32px', height: '32px' }} />
            Accedi con Discord
          </button>
        </div>
      </div>
    </div>
  );
}