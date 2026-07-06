'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../api/stats/stats-repository'; // adegua il percorso se necessario
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';

function PlayerStatsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const playerId = searchParams.get('id');

    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.replace('/login');
                return;
            }

            if (session.user?.user_metadata?.is_admin === true) {
                setIsAdmin(true);
            }
            
            const userAvatar = session.user?.user_metadata?.avatar_url || session.user?.user_metadata?.picture;
            if (userAvatar) setAvatarUrl(userAvatar);
        };
        checkUser();
    }, [router]);

    return (
        <div className="min-h-screen bg-ctp-bg text-ctp-text p-4 font-sans flex flex-col justify-between">
            <div>
                <Header isAdmin={isAdmin} avatarUrl={avatarUrl} />

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

            <Footer />
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