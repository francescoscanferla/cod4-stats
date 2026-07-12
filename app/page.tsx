'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './api/stats/stats-repository';
import { Header } from '@/app/components/Header';
import { Footer } from '@/app/components/Footer';
import { PageLoader } from '@/app/components/PageLoader';

import { PlayerStat, AwardItem, StatsResponse } from './types/stats';

const Home = () => {
  const router = useRouter();
  const [period, setPeriod] = useState<'global' | 'last'>('global');
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkUserAndFetch = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/login');
        return;
      }

      if (session.user?.user_metadata?.is_admin === true) {
        setIsAdmin(true);
      }

      const userAvatar = session.user?.user_metadata?.avatar_url || session.user?.user_metadata?.picture;
      if (userAvatar) {
        setAvatarUrl(userAvatar);
      }

      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/stats?period=${period}`);
        if (!res.ok) {
          throw new Error(`Error fetching data: ${res.statusText}`);
        }
        const data: StatsResponse = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkUserAndFetch();
  }, [period]);

  const getBorderColorForStat = (statName: keyof StatsResponse["awards"]) => {
    switch (statName) {
      case 'kills':
      case 'headshots':
      case 'ratio':
      case 'claymorekills':
      case 'grenadekills':
      case 'knifekills':
        return 'border-t-green-400';
      case 'deaths':
      case 'suicides':
        return 'border-t-ctp-red';
      default:
        return 'border-t-ctp-line';
    }
  };

  const getColorForStat = (statName: keyof StatsResponse["awards"], value: number) => {
    switch (statName) {
      case 'kills':
      case 'headshots':
      case 'ratio':
      case 'claymorekills':
      case 'grenadekills':
      case 'knifekills':
        return 'text-green-400';
      case 'deaths':
      case 'suicides':
        return 'text-ctp-red';
      default:
        return 'text-white';
    }
  };

  const getAwardName = (awardName: keyof StatsResponse["awards"]) => {
    switch (awardName) {
      case 'kills':
        return 'Il Mietitore';
      case 'headshots':
        return 'Lo Sniper';
      case 'ratio':
        return 'Il Fantasma';
      case 'claymorekills':
        return 'ClayMan';
      case 'grenadekills':
        return 'Il Demolitore';
      case 'knifekills':
        return 'Il Macellaio';
      case 'suicides':
        return 'Lo Zombie';
      case 'deaths':
        return 'Il Morto';
      default:
        return '';
    }
  };

  const getAwardDescription = (awardName: keyof StatsResponse["awards"]) => {
    switch (awardName) {
      case 'kills':
        return 'Se lo incontri...muori.';
      case 'headshots':
        return 'Se metti fuori la testa lui la vede';
      case 'ratio':
        return 'Ti uccide ma non lo vedi';
      case 'claymorekills':
        return 'Non si muore con le claymore in zaino';
      case 'grenadekills':
        return 'Quando lancia fa sempre canestro';
      case 'knifekills':
        return 'Ti affetta e non lo senti arrivare';
      case 'suicides':
        return 'Se non lo uccidi tu ci pensa da solo';
      case 'deaths':
        return 'Ovunque spari lo prendi';
      default:
        return '';
    }
  };

  const [sortConfig, setSortConfig] = useState<{
    key: keyof PlayerStat;
    direction: 'asc' | 'desc';
  }>({ key: 'kills', direction: 'desc' });

  const sortedStats = useMemo(() => {
    if (!stats?.general) return [];

    const sortableItems = [...stats.general];
    sortableItems.sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue);
      }

      return sortConfig.direction === "asc" ? aValue - (bValue as number) : (bValue as number) - aValue;
    });

    return sortableItems;
  }, [stats, sortConfig]);

  const requestSort = (key: keyof PlayerStat) => {
    let direction: "asc" | "desc" = "desc";
    if (sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof PlayerStat) => {
    if (sortConfig.key !== key) return ' ↕';
    return sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽';
  };

  return (
    <div className="flex flex-col min-h-screen bg-ctp-bg text-ctp-text">
      <Header isAdmin={isAdmin} avatarUrl={avatarUrl} />

      {loading && <PageLoader message="Caricamento statistiche..." />}
      {error && <p className="text-center text-red-500">Errore: {error}</p>}

      {!loading && stats && (
        <main className="mb-6 w-full px-4">
          <div className="bg-ctp-surface rounded-full p-1 mb-6 flex justify-around">
            <button
              className={`w-1/2 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${period === 'global' ? 'bg-ctp-brand text-ctp-bg' : 'text-ctp-text'}`}
              onClick={() => setPeriod('global')}
            >
              Globali
            </button>
            <button
              className={`w-1/2 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${period === 'last' ? 'bg-ctp-brand text-ctp-bg' : 'text-ctp-text'}`}
              onClick={() => setPeriod('last')}
            >
              Ultima Sessione
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            {(Object.entries(stats.awards) as [keyof AwardItem, any][]).map(([key, award]) => (
              <div
                key={key}
                className={`bg-ctp-overlay p-4 border border-ctp-line border-t-2 ${getBorderColorForStat(key as keyof StatsResponse["awards"])} flex flex-col items-center text-center`}>
                <img src={`/dashboard/${key}.png`} alt={key} className="w-8 h-8 mb-2" />
                <h3 className="text-sm font-semibold text-white mb-1">{getAwardName(key as keyof StatsResponse["awards"])}</h3>
                <p className="text-xs text-ctp-muted mb-2">{getAwardDescription(key as keyof StatsResponse["awards"])}</p>
                <p className={`text-lg font-bold ${getColorForStat(key as keyof StatsResponse["awards"], award.value)}`}>
                  {award.player_name} ({award.value})
                </p>
              </div>
            ))}
          </div>

          <div className="mb-6 w-full">
            <h2 className="text-xl font-bold text-ctp-text mb-4">CLASSIFICA GENERALE</h2>

            <div className="bg-ctp-surface border border-ctp-line overflow-x-auto whitespace-nowrap">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs font-semibold text-[#a6e3a1] bg-ctp-overlay">
                    <th className="p-3 cursor-pointer hover:bg-ctp-line transition-colors" onClick={() => requestSort('player_name')}>
                      PLAYER {getSortIcon('player_name')}
                    </th>
                    <th className="p-3 cursor-pointer hover:bg-ctp-line transition-colors" onClick={() => requestSort('kills')}>
                      KILLS {getSortIcon('kills')}
                    </th>
                    <th className="p-3 cursor-pointer hover:bg-ctp-line transition-colors" onClick={() => requestSort('headshots')}>
                      HEADSHOTS {getSortIcon('headshots')}
                    </th>
                    <th className="p-3 cursor-pointer hover:bg-ctp-line transition-colors" onClick={() => requestSort('ratio')}>
                      RATIO {getSortIcon('ratio')}
                    </th>
                    <th className="p-3 cursor-pointer hover:bg-ctp-line transition-colors" onClick={() => requestSort('claymorekills')}>
                      CLAYMORE {getSortIcon('claymorekills')}
                    </th>
                    <th className="p-3 cursor-pointer hover:bg-ctp-line transition-colors" onClick={() => requestSort('grenadekills')}>
                      GRENADE {getSortIcon('grenadekills')}
                    </th>
                    <th className="p-3 cursor-pointer hover:bg-ctp-line transition-colors" onClick={() => requestSort('knifekills')}>
                      BASHED {getSortIcon('knifekills')}
                    </th>
                    <th className="p-3 cursor-pointer hover:bg-ctp-line text-ctp-red transition-colors" onClick={() => requestSort('suicides')}>
                      SUICIDES {getSortIcon('suicides')}
                    </th>
                    <th className="p-3 cursor-pointer hover:bg-ctp-line text-ctp-red transition-colors" onClick={() => requestSort('deaths')}>
                      DEATHS {getSortIcon('deaths')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStats.map((player) => {
                    let ratioColor = 'text-orange-300';
                    if (player.ratio > 1.5) ratioColor = 'text-green-400';
                    if (player.ratio < 0.5) ratioColor = 'text-ctp-red';

                    return (
                      <tr
                        key={player.player_name}
                        className="text-sm text-ctp-text border-t border-ctp-line hover:bg-ctp-overlay transition-colors"
                      >
                        <td
                          className="p-3 font-medium cursor-pointer hover:text-[#a6e3a1] transition-colors flex items-center gap-2 group"
                          onClick={() => router.push(`/player?id=${encodeURIComponent(player.player_guid)}`)}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4 text-ctp-muted group-hover:text-[#a6e3a1] transition-colors"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                          </svg>
                          <span>{player.player_name}</span>
                        </td>
                        <td className="p-3">{player.kills}</td>
                        <td className="p-3">{player.headshots}</td>
                        <td className={`p-3 font-semibold ${ratioColor}`}>
                          {player.ratio.toFixed(2)}
                        </td>
                        <td className="p-3">{player.claymorekills}</td>
                        <td className="p-3">{player.grenadekills}</td>
                        <td className="p-3">{player.knifekills}</td>
                        <td className="p-3 text-ctp-red">{player.suicides}</td>
                        <td className="p-3 text-ctp-red">{player.deaths}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      )}

      <Footer />
    </div>
  );
};

export default Home;
