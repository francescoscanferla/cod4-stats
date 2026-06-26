import { promises as fs } from 'fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';

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

// Helper function to generate dummy data
const generateDummyStats = (period: 'global' | 'last'): StatsPayload => {
  const dummyPlayers: PlayerStats[] = [
    {
      player_name: 'Player1',
      kills: period === 'global' ? 1245 : 120,
      headshots: period === 'global' ? 184 : 15,
      ratio: period === 'global' ? 1.27 : 1.1,
      claymorekills: period === 'global' ? 22 : 3,
      grenadekills: period === 'global' ? 15 : 2,
      knifekills: period === 'global' ? 32 : 5,
      deaths: period === 'global' ? 982 : 100,
      suicides: period === 'global' ? 4 : 1,
    },
    {
      player_name: 'Player2',
      kills: period === 'global' ? 987 : 90,
      headshots: period === 'global' ? 150 : 10,
      ratio: period === 'global' ? 1.15 : 0.9,
      claymorekills: period === 'global' ? 18 : 2,
      grenadekills: period === 'global' ? 10 : 1,
      knifekills: period === 'global' ? 25 : 3,
      deaths: period === 'global' ? 850 : 80,
      suicides: period === 'global' ? 3 : 0,
    },
  ];

  const findAwardWinner = (key: keyof PlayerStats) => {
    const sorted = [...dummyPlayers].sort((a, b) => {
      if (key === 'ratio') return (b[key] as number) - (a[key] as number);
      return (b[key] as number) - (a[key] as number);
    });
    const winner = sorted[0];
    return { player_name: winner.player_name, value: winner[key] as number };
  };

  const awards: Awards = {
    kills: findAwardWinner('kills'),
    headshots: findAwardWinner('headshots'),
    ratio: findAwardWinner('ratio'),
    claymorekills: findAwardWinner('claymorekills'),
    grenadekills: findAwardWinner('grenadekills'),
    knifekills: findAwardWinner('knifekills'),
    deaths: findAwardWinner('deaths'),
    suicides: findAwardWinner('suicides'),
  };

  return {
    awards,
    general: dummyPlayers,
  };
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get('period');

  if (!period || (period !== 'global' && period !== 'last')) {
    return NextResponse.json({ error: 'Invalid or missing period parameter. Use ?period=global or ?period=last' }, { status: 400 });
  }

  // In a real application, you would fetch data from Supabase here.
  // For this example, we'll use dummy data.
  const stats = generateDummyStats(period as 'global' | 'last');

  return NextResponse.json(stats);
}