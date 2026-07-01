'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from './api/stats/stats-repository';

interface PlayerStats {
  player_name: string;
  kills: number;
  headshots: number;
  ratio: number;
  claymorekills: number;
  grenadekills: number;
  knifekills: number;
  deaths: number;
  suicides: number;
}

interface Awards {
  kills: { player_name: string; value: number };
  headshots: { player_name: string; value: number };
  ratio: { player_name: string; value: number };
  claymorekills: { player_name: string; value: number };
  grenadekills: { player_name: string; value: number };
  knifekills: { player_name: string; value: number };
  deaths: { player_name: string; value: number };
  suicides: { player_name: string; value: number };
}

interface StatsPayload {
  awards: Awards;
  general: PlayerStats[];
}

const Home = () => {
  const router = useRouter();
  const [period, setPeriod] = useState<'global' | 'last'>('global');
  const [stats, setStats] = useState<StatsPayload | null>(null);
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
        const data: StatsPayload = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkUserAndFetch();
  }, [period]);

  const getBorderColorForStat = (statName: keyof Awards) => {
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
        return 'border-t-[#ff5d00]';
      default:
        return 'border-t-[#313244]';
    }
  };

  const getColorForStat = (statName: keyof Awards, value: number) => {
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
        return 'text-[#ff5d00]';
      default:
        return 'text-white';
    }
  };

  const getAwardName = (awardName: keyof Awards) => {
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

  const getAwardDescription = (awardName: keyof Awards) => {
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
    key: keyof PlayerStats;
    direction: 'asc' | 'desc';
  }>({ key: 'kills', direction: 'desc' });

  const sortedStats = useMemo(() => {
    if (!stats?.general) return [];

    const sortableItems = [...stats.general];
    sortableItems.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? (aValue as string).localeCompare(bValue as string)
          : (bValue as string).localeCompare(aValue as string);
      }

      return sortConfig.direction === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
    });

    return sortableItems;
  }, [stats, sortConfig]);

  const requestSort = (key: keyof PlayerStats) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    } else {
      direction = 'desc';
    }
    setSortConfig({ key, direction: direction as "asc" | "desc" });
  };

  const getSortIcon = (key: keyof PlayerStats) => {
    if (sortConfig.key !== key) return ' ↕';
    return sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽';
  };

  return (
    <div className="min-h-screen bg-[#11111b] text-[#cdd6f4] p-4 font-sans">
      <header className="bg-[#1e1e2e] p-4 mb-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-[#1fc75c]">{`B.Y.O.B. Stats`}</h1>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-[#313244] rounded-lg transition-colors cursor-pointer"
              title="Pannello Amministratore"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="#cdd6f4"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l.546.946a1.125 1.125 0 0 1-.26 1.43l-1.003.767c-.29.22-.443.585-.411.95.004.043.006.086.006.128a1 1 0 0 1-.006.128c-.032.365.12.73.411.95l1.003.767a1.125 1.125 0 0 1 .26 1.43l-.546.947a1.125 1.125 0 0 1-1.37.49l-1.216-.456c-.356-.133-.751-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-1.094c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-.546-.947a1.125 1.125 0 0 1 .26-1.43l1.004-.767c.29-.22.443-.585.411-.95a1.15 1.15 0 0 0-.007-.128c0-.042.003-.085.007-.128.032-.365-.12-.73-.411-.95l-1.004-.767a1.125 1.125 0 0 1-.26-1.43l.546-.946a1.125 1.125 0 0 1 1.37-.49l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
          )}

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.replace('/login');
            }}
            className="p-2 hover:bg-[#313244] rounded-lg transition-colors cursor-pointer"
            title="Disconnetti"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#cdd6f4"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
          </button>

          <div className="w-10 h-10 bg-[#313244] rounded-full border-2 border-[#1fc75c] overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full bg-[#313244]" />
            )}
          </div>
        </div>
      </header>

      <div className="bg-[#181825] rounded-full p-1 mb-6 flex justify-around">
        <button
          className={`w-1/2 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${period === 'global' ? 'bg-[#1fc75c] text-[#11111b]' : 'text-[#cdd6f4]'}`}
          onClick={() => setPeriod('global')}
        >
          Globali
        </button>
        <button
          className={`w-1/2 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${period === 'last' ? 'bg-[#1fc75c] text-[#11111b]' : 'text-[#cdd6f4]'}`}
          onClick={() => setPeriod('last')}
        >
          Ultima Sessione
        </button>
      </div>

      {loading && <p className="text-center text-[#a6e3a1]">Caricamento statistiche...</p>}
      {error && <p className="text-center text-red-500">Errore: {error}</p>}

      {stats && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          {Object.entries(stats.awards).map(([key, award]) => (
            <div
              key={key}
              className={`bg-[#1e1e2e] p-4 border border-[#313244] border-t-2 ${getBorderColorForStat(key as keyof Awards)} flex flex-col items-center text-center`}>
              <img src={`/dashboard/${key}.png`} alt={key} className="w-8 h-8 mb-2" />
              <h3 className="text-sm font-semibold text-white mb-1">{getAwardName(key as keyof Awards)}</h3>
              <p className="text-xs text-[#5f6378] mb-2">{getAwardDescription(key as keyof Awards)}</p>
              <p className={`text-lg font-bold ${getColorForStat(key as keyof Awards, award.value)}`}>
                {award.player_name} ({typeof award.value === 'number' ? award.value : award.value})
              </p>
            </div>
          ))}
        </div>
      )}

      {stats && (
        <div className="mb-6 w-full">
          <h2 className="text-xl font-bold text-[#cdd6f4] mb-4">CLASSIFICA GENERALE</h2>

          <div className="bg-[#181825] border border-[#313244] overflow-x-auto whitespace-nowrap">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-semibold text-[#a6e3a1] bg-[#1e1e2e]">
                  <th className="p-3 cursor-pointer hover:bg-[#313244] transition-colors" onClick={() => requestSort('player_name')}>
                    PLAYER {getSortIcon('player_name')}
                  </th>
                  <th className="p-3 cursor-pointer hover:bg-[#313244] transition-colors" onClick={() => requestSort('kills')}>
                    KILLS {getSortIcon('kills')}
                  </th>
                  <th className="p-3 cursor-pointer hover:bg-[#313244] transition-colors" onClick={() => requestSort('headshots')}>
                    HEADSHOTS {getSortIcon('headshots')}
                  </th>
                  <th className="p-3 cursor-pointer hover:bg-[#313244] transition-colors" onClick={() => requestSort('ratio')}>
                    RATIO {getSortIcon('ratio')}
                  </th>
                  <th className="p-3 cursor-pointer hover:bg-[#313244] transition-colors" onClick={() => requestSort('claymorekills')}>
                    CLAYMORE {getSortIcon('claymorekills')}
                  </th>
                  <th className="p-3 cursor-pointer hover:bg-[#313244] transition-colors" onClick={() => requestSort('grenadekills')}>
                    GRENADE {getSortIcon('grenadekills')}
                  </th>
                  <th className="p-3 cursor-pointer hover:bg-[#313244] transition-colors" onClick={() => requestSort('knifekills')}>
                    BASHED {getSortIcon('knifekills')}
                  </th>
                  <th className="p-3 cursor-pointer hover:bg-[#313244] transition-colors" onClick={() => requestSort('suicides')}>
                    SUICIDES {getSortIcon('suicides')}
                  </th>
                  <th className="p-3 cursor-pointer hover:bg-[#313244] transition-colors" onClick={() => requestSort('deaths')}>
                    DEATHS {getSortIcon('deaths')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedStats.map((player) => (
                  <tr
                    key={player.player_name}
                    className="text-sm text-[#cdd6f4] border-t border-[#313244] hover:bg-[#1e1e2e] transition-colors"
                  >
                    <td className="p-3 font-medium">{player.player_name}</td>
                    <td className="p-3">{player.kills}</td>
                    <td className="p-3">{player.headshots}</td>
                    <td className="p-3 text-[#f9e2af] font-semibold">{player.ratio.toFixed(2)}</td>
                    <td className="p-3">{player.claymorekills}</td>
                    <td className="p-3">{player.grenadekills}</td>
                    <td className="p-3">{player.knifekills}</td>
                    <td className="p-3">{player.suicides}</td>
                    <td className="p-3">{player.deaths}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;