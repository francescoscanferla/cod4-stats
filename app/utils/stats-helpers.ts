// app/utils/stats-helpers.ts

import { PlayerStat, StatsResponse, HitZones, WeaponStat } from "@/app/types/stats";

export function emptyResponse(): StatsResponse {
  return {
    awards: {
      kills: { player_name: "Nessuno", value: 0 },
      headshots: { player_name: "Nessuno", value: 0 },
      ratio: { player_name: "Nessuno", value: 0 },
      claymorekills: { player_name: "Nessuno", value: 0 },
      grenadekills: { player_name: "Nessuno", value: 0 },
      knifekills: { player_name: "Nessuno", value: 0 },
      deaths: { player_name: "Nessuno", value: 0 },
      suicides: { player_name: "Nessuno", value: 0 },
    },
    general: [],
  };
}

export function calculateAwards(generalStats: PlayerStat[]): StatsResponse["awards"] {
  const resp = emptyResponse();
  if (generalStats.length === 0) return resp.awards;

  const kills = generalStats.reduce((prev, curr) => (prev.kills > curr.kills ? prev : curr));
  const headshots = generalStats.reduce((prev, curr) => (prev.headshots > curr.headshots ? prev : curr));
  const ratio = generalStats.reduce((prev, curr) => (prev.ratio > curr.ratio ? prev : curr));
  const claymorekills = generalStats.reduce((prev, curr) => (prev.claymorekills > curr.claymorekills ? prev : curr));
  const grenadekills = generalStats.reduce((prev, curr) => (prev.grenadekills > curr.grenadekills ? prev : curr));
  const knifekills = generalStats.reduce((prev, curr) => (prev.knifekills > curr.knifekills ? prev : curr));
  const deaths = generalStats.reduce((prev, curr) => (prev.deaths > curr.deaths ? prev : curr));
  const suicides = generalStats.reduce((prev, curr) => (prev.suicides > curr.suicides ? prev : curr));

  return {
    kills: { player_name: kills.player_name, value: kills.kills },
    headshots: { player_name: headshots.player_name, value: headshots.headshots },
    ratio: { player_name: ratio.player_name, value: ratio.ratio },
    claymorekills: { player_name: claymorekills.player_name, value: claymorekills.claymorekills },
    grenadekills: { player_name: grenadekills.player_name, value: grenadekills.grenadekills },
    knifekills: { player_name: knifekills.player_name, value: knifekills.knifekills },
    deaths: { player_name: deaths.player_name, value: deaths.deaths },
    suicides: { player_name: suicides.player_name, value: suicides.suicides },
  };
}

export function createEmptyZones(): HitZones {
  return {
    head: 0, neck: 0, torso_upper: 0, torso_lower: 0,
    right_arm_upper: 0, right_arm_lower: 0, right_hand: 0,
    left_arm_upper: 0, left_arm_lower: 0, left_hand: 0,
    right_leg_upper: 0, right_leg_lower: 0, right_foot: 0,
    left_leg_upper: 0, left_leg_lower: 0, left_foot: 0
  };
}

export function aggregateMatchEvents(events: { hit_loc: string | null; weapon: string | null }[]) {
  const zones = createEmptyZones();
  const weaponsMap = new Map<string, number>();
  let totalHits = 0;

  events.forEach(event => {
    if (event.hit_loc && event.hit_loc in zones) {
      zones[event.hit_loc as keyof HitZones]++;
      totalHits++;
    }
    if (event.weapon) {
      weaponsMap.set(event.weapon, (weaponsMap.get(event.weapon) || 0) + 1);
    }
  });

  if (totalHits > 0) {
    for (const key in zones) {
      const k = key as keyof HitZones;
      zones[k] = parseFloat(((zones[k] / totalHits) * 100).toFixed(1));
    }
  }

  const topWeapons = Array.from(weaponsMap.entries())
    .map(([weapon_name, count]) => ({ weapon_name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return { hit_zones: zones, top_weapons: topWeapons };
}