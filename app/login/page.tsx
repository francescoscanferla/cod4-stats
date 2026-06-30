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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: '1rem' }}>
      <h1>Accedi a CoD4 Stats</h1>
      <button onClick={() => handleLogin('google')} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
        Accedi con Google
      </button>
      <button onClick={() => handleLogin('discord')} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }}>
        Accedi con Discord
      </button>
    </div>
  );
}