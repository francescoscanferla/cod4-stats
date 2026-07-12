'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../api/stats/stats-repository';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { PageLoader } from '@/app/components/PageLoader';

export default function AdminDashboard() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>('');
  const [sessionDate, setSessionDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session || session.user?.user_metadata?.is_admin !== true) {
        router.replace('/login');
        return;
      }

      setIsAdmin(true);
      const userAvatar = session.user?.user_metadata?.avatar_url || session.user?.user_metadata?.picture;
      if (userAvatar) {
        setAvatarUrl(userAvatar);
      }

      setAuthLoading(false);
    };

    checkAdmin();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const getFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Seleziona un file di log prima di inviare.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      formData.append('date', sessionDate);

      const response = await fetch('/api/stats/upload-log', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Errore durante l\'elaborazione del file.');
      }

      setMessage({
        type: 'success',
        text: `Sessione elaborata con successo! Inseriti ${result.inserted_records} record.`,
      });
      setFile(null);
      setDescription('');
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-ctp-bg text-ctp-text">
        <Header avatarUrl={avatarUrl} isAdmin={isAdmin} />
        <main className="flex-grow flex items-center justify-center max-w-7xl w-full mx-auto px-4 py-8">
          <PageLoader message="Verifica autorizzazioni..." />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-ctp-bg text-ctp-text">
      <Header avatarUrl={avatarUrl} isAdmin={isAdmin} />

        <main className="mb-6 w-full px-4">

          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-ctp-text">
              Admin Dashboard
            </h2>
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-4 py-2 bg-ctp-surface border border-ctp-line hover:bg-ctp-overlay text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Torna alla Home
            </button>
          </div>

          {/* Contenitore del Form */}
          <div className="max-w-2xl mx-auto bg-ctp-surface border border-ctp-line p-6 rounded-lg space-y-6">
            <div className="border-b border-ctp-line pb-3 flex items-center gap-2">
              <h3 className="text-sm font-bold font-mono uppercase tracking-widest text-ctp-brand">
                Carica Nuovo Log Sessione
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase text-ctp-subtext">
                  Data della Sessione
                </label>
                <input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="bg-ctp-bg border border-ctp-line text-ctp-text p-2.5 font-mono text-sm focus:outline-none focus:border-[#a6e3a1] w-full rounded-lg"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase text-ctp-subtext">
                  Descrizione / Note
                </label>
                <input
                  type="text"
                  placeholder="Es: Scrim vs Clan XYZ o Serata Pubblica"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-ctp-bg border border-ctp-line text-ctp-text p-2.5 text-sm focus:outline-none focus:border-[#a6e3a1] w-full rounded-lg placeholder:text-ctp-muted/50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-mono uppercase text-ctp-subtext">
                  File di Log (.log)
                </label>
                <div className="border border-dashed border-ctp-line bg-ctp-bg/50 p-6 flex flex-col items-center justify-center gap-3 relative hover:bg-ctp-bg/80 transition-colors group rounded-lg">
                  <input
                    type="file"
                    accept=".log,text/plain"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8 text-ctp-muted group-hover:text-[#a6e3a1] transition-colors"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                  </svg>
                  <div className="text-center">
                    <p className="text-xs font-bold text-ctp-text">
                      Trascina qui il file o fai clic per sfogliare
                    </p>
                    <p className="text-[10px] text-ctp-muted mt-0.5">
                      Solo file di log del server COD4
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-ctp-bg border border-ctp-line p-3 flex items-center justify-between rounded-lg">
                <span className="text-xs font-mono text-ctp-muted uppercase">File selezionato:</span>
                {file ? (
                  <div className="flex items-center gap-2 max-w-[70%]">
                    <span className="text-xs font-mono font-medium text-ctp-text truncate">{file.name}</span>
                    <span className="text-[10px] font-mono text-ctp-muted/70 bg-ctp-surface px-1.5 py-0.5 border border-ctp-line rounded">{getFileSize(file.size)}</span>
                  </div>
                ) : (
                  <span className="text-xs font-mono italic text-ctp-muted/60">Nessun file selezionato</span>
                )}
              </div>

              {message && (
                <div
                  className={`p-3 text-xs font-mono border rounded-lg ${message.type === 'success'
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : 'bg-ctp-red/10 text-ctp-red border-ctp-red/20'
                    }`}
                >
                  <strong className="uppercase">[{message.type}]</strong> {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-ctp-brand hover:bg-[#a6e3a1]/80 text-[#11111b] font-bold font-mono p-3 rounded-lg transition-colors text-xs uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? 'Elaborazione in corso...' : 'Elabora e Salva Sessione'}
              </button>
            </form>
          </div>
        </main>

      <Footer />
    </div>
  );
}