'use client';

import React, { useState, useEffect, useMemo } from 'react';

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
  const [period, setPeriod] = useState<'global' | 'last'>('global');
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
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
    fetchStats();
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
        <div className="w-10 h-10 bg-[#313244] rounded-full border-2 border-[#1fc75c]"></div>
      </header>

      <div className="bg-[#181825] rounded-full p-1 mb-6 flex justify-around">
        <button
          className={`w-1/2 py-2 rounded-full text-sm font-medium transition-colors ${period === 'global' ? 'bg-[#1fc75c] text-[#11111b]' : 'text-[#cdd6f4]'}`}
          onClick={() => setPeriod('global')}
        >
          Globali
        </button>
        <button
          className={`w-1/2 py-2 rounded-full text-sm font-medium transition-colors ${period === 'last' ? 'bg-[#1fc75c] text-[#11111b]' : 'text-[#cdd6f4]'}`}
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
                {award.player_name} ({typeof award.value === 'number' ? award.value.toFixed(2) : award.value})
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