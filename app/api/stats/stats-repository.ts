import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface PlayerStat {
  player_guid: string;
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

export interface AwardItem {
  player_name: string;
  value: number;
}

export interface StatsResponse {
  awards: {
    kills: AwardItem;
    headshots: AwardItem;
    ratio: AwardItem;
    claymorekills: AwardItem;
    grenadekills: AwardItem;
    knifekills: AwardItem;
    deaths: AwardItem;
    suicides: AwardItem;
  };
  general: PlayerStat[];
}

const emptyResponse = (): StatsResponse => ({
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
});

function calculateAwards(generalStats: PlayerStat[]): StatsResponse["awards"] {
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

export async function getGlobalStats(): Promise<StatsResponse> {
  const { data: players, error } = await supabase.from("players").select("player_name, guid");
  if (error || !players || players.length === 0) return emptyResponse();

    const playerStatsPromises = players.map(async (player) => {
      const [k, d, h, c, g, kn, s] = await Promise.all([
        supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("attacker_guid", player.guid),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("victim_guid", player.guid),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("attacker_guid", player.guid).eq("hit_loc", "head"),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("attacker_guid", player.guid).eq("weapon", "claymore_mp"),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("attacker_guid", player.guid).eq("weapon", "grenade_mp"),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("attacker_guid", player.guid).eq("weapon", "knife_mp"),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("attacker_guid", player.guid).eq("mod", "MOD_SUICIDE"),
    ]);

      const kills = k.count || 0;
      const deaths = d.count || 0;
      const ratio = deaths === 0 ? kills : parseFloat((kills / deaths).toFixed(2));
  
      return {
        player_guid: player.guid,
        player_name: player.player_name,
        kills,
        deaths,
        headshots: h.count || 0,
        claymorekills: c.count || 0,
        grenadekills: g.count || 0,
        knifekills: kn.count || 0,
        suicides: s.count || 0,
        ratio,
    };
  });

  const general = await Promise.all(playerStatsPromises);
  return { awards: calculateAwards(general), general };
}

export async function getLastSessionStats(): Promise<StatsResponse> {
  const { data: latestSession, error: sErr } = await supabase.from("sessions").select("id").order("session_date", { ascending: false }).limit(1).maybeSingle();
  if (sErr || !latestSession) return emptyResponse();

  const { data: events, error: eErr } = await supabase.from("matches_events").select("attacker_guid").eq("session_id", latestSession.id);
  if (eErr || !events) return emptyResponse();

  const playerGuids = Array.from(new Set(events.map((e) => e.attacker_guid).filter((g): g is string => g !== null && g !== "world")));
  if (playerGuids.length === 0) return emptyResponse();

  const { data: playersData } = await supabase.from("players").select("player_name, guid").in("guid", playerGuids);
    const playerMap = new Map(playersData?.map((p) => [p.guid, p.player_name]));
    const playerGuidToPlayerMap = new Map(playersData?.map((p) => [p.guid, p]));
  
    const playerStatsPromises = playerGuids.map(async (guid) => {
      const [k, d, h, c, g, kn, s] = await Promise.all([
        supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("session_id", latestSession.id).eq("attacker_guid", guid),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("session_id", latestSession.id).eq("victim_guid", guid),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("session_id", latestSession.id).eq("attacker_guid", guid).eq("hit_loc", "head"),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("session_id", latestSession.id).eq("attacker_guid", guid).eq("weapon", "claymore_mp"),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("session_id", latestSession.id).eq("attacker_guid", guid).eq("weapon", "grenade_mp"),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("session_id", latestSession.id).eq("attacker_guid", guid).eq("weapon", "knife_mp"),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("session_id", latestSession.id).eq("attacker_guid", guid).eq("mod", "MOD_SUICIDE"),
    ]);

      const kills = k.count || 0;
      const deaths = d.count || 0;
      const ratio = deaths === 0 ? kills : parseFloat((kills / deaths).toFixed(2));
  
      return {
        player_guid: playerGuidToPlayerMap.get(guid)?.guid || "Unknown",
        player_name: playerMap.get(guid) || "Unknown",
        kills,
        deaths,
        headshots: h.count || 0,
        claymorekills: c.count || 0,
        grenadekills: g.count || 0,
        knifekills: kn.count || 0,
        suicides: s.count || 0,
        ratio,
    };
  });

  const general = await Promise.all(playerStatsPromises);
  return { awards: calculateAwards(general), general };
}