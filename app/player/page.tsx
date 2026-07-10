'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/app/api/stats/stats-repository';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { BodyHeatmap } from '@/app/components/BodyHeatmap';
import { WeaponsPodium } from '../components/WeaponsPodium';

interface PlayerData {
  player_name: string;
  offensive: {
    hit_zones: Record<string, number>;
    top_weapons: Array<{ weapon_name: string; count: number }>;
  };
  defensive: {
    hit_zones: Record<string, number>;
    top_weapons: Array<{ weapon_name: string; count: number }>;
  };
}

function PlayerStatsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const playerId = searchParams.get('id');

  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  useEffect(() => {
    const checkUserAndFetchData = async () => {
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

      if (playerId) {
        try {
          const res = await fetch(`/api/stats/players/${playerId}`);
          if (res.ok) {
            const data = await res.json();
            setPlayerData(data);
          } else {
            console.error("Impossibile recuperare i dettagli del player");
          }
        } catch (error) {
          console.error("Errore durante la fetch dei dati player:", error);
        } finally {
          setLoadingData(false);
        }
      } else {
        setLoadingData(false);
      }
    };

    checkUserAndFetchData();
  }, [router, playerId]);

  return (
    <div className="min-h-screen bg-ctp-bg text-ctp-text p-4 font-sans flex flex-col justify-between">
      <div>
        <Header isAdmin={isAdmin} avatarUrl={avatarUrl} />

        <main className="mb-6 w-full">
          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-24 bg-ctp-surface border border-ctp-line rounded-lg w-full">
              <svg className="animate-spin h-8 w-8 text-ctp-brand mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-lg font-medium text-ctp-subtext">Caricamento in corso...</p>
            </div>
          ) : !playerData ? (
            <div className="p-6 bg-ctp-surface border border-ctp-line rounded-lg text-center text-ctp-red">
              Player non trovato o ID non valido.
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-ctp-text">
                  STATISTICHE PLAYER: <span className="text-ctp-brand">{playerData.player_name}</span>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">

                <div className="bg-ctp-surface border border-ctp-line p-6 rounded-lg flex flex-col gap-6">
                  <h3 className="text-lg font-bold text-green-400 border-b border-ctp-line pb-2 flex items-center gap-2">
                    ⚔️ Offensiva
                  </h3>

                  <div>
                    <WeaponsPodium
                      weapons={playerData.offensive.top_weapons}
                      title="Le Tue Preferite"
                      type="offensive"
                    />
                  </div>

                  <div>
                    <BodyHeatmap
                      hitZones={playerData.offensive.hit_zones}
                      title="Dove Sei Letale"
                    />
                  </div>
                </div>

                <div className="bg-ctp-surface border border-ctp-line p-6 rounded-lg flex flex-col gap-6">
                  <h3 className="text-lg font-bold text-ctp-red border-b border-ctp-line pb-2 flex items-center gap-2">
                    🛡️ Difensiva
                  </h3>

                  <div>
                    <WeaponsPodium
                      weapons={playerData.defensive.top_weapons}
                      title="Attento a Queste"
                      type="defensive" />
                  </div>

                  <div>
                    <BodyHeatmap
                      hitZones={playerData.defensive.hit_zones}
                      title="Dove Ti Bucherellano"
                    />
                  </div>
                </div>

              </div>
            </>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default function PlayerStatsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-ctp-text bg-ctp-bg min-h-screen">Inizializzazione...</div>}>
      <PlayerStatsContent />
    </Suspense>
  );
}