'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../api/stats/stats-repository'; // adegua il percorso se necessario

function PlayerStatsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const playerId = searchParams.get('id');

    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.replace('/login');
                return;
            }
            const userAvatar = session.user?.user_metadata?.avatar_url || session.user?.user_metadata?.picture;
            if (userAvatar) setAvatarUrl(userAvatar);
        };
        checkUser();
    }, [router]);

    return (
        <div className="min-h-screen bg-ctp-bg text-ctp-text p-4 font-sans flex flex-col justify-between">
            <div>
                <header className="bg-ctp-overlay p-4 mb-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-ctp-brand">{`B.Y.O.B. Stats`}</h1>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={async () => {
                                await supabase.auth.signOut();
                                router.replace('/login');
                            }}
                            className="p-2 hover:bg-ctp-line rounded-lg transition-colors cursor-pointer"
                            title="Disconnetti"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#cdd6f4" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
                            </svg>
                        </button>
                        <div className="w-10 h-10 bg-ctp-line rounded-full border-2 border-ctp-brand overflow-hidden flex items-center justify-center">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                                <div className="w-full h-full bg-ctp-line" />
                            )}
                        </div>
                    </div>
                </header>

                <main className="mb-6 w-full">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-ctp-text">STATISTICHE PLAYER: {playerId}</h2>
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
                    <div className="bg-ctp-surface border border-ctp-line p-6 rounded-lg w-full h-96">
                        PLACEHOLDER
                    </div>
                </main>
            </div>

            <footer className="bg-ctp-overlay p-4 mt-8 flex justify-between items-center text-sm">
                <p className="text-ctp-subtext">© {new Date().getFullYear()} B.Y.O.B. Stats</p>
                <div className="px-3 py-1.5 text-xs font-mono text-ctp-muted">
                    Versione: {process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || 'Sviluppo Locale'}
                </div>
            </footer>
        </div>
    );
}

export default function PlayerStatsPage() {
    return (
        <Suspense fallback={<div className="p-6 text-ctp-text bg-ctp-bg min-h-screen">Caricamento in corso...</div>}>
            <PlayerStatsContent />
        </Suspense>
    );
}