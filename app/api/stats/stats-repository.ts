import { createClient } from "@supabase/supabase-js";
import { StatsResponse, PlayerDetailsResponse } from "@/app/types/stats";
import { emptyResponse, calculateAwards, aggregateMatchEvents } from "@/app/utils/stats-helpers";
import { EventType } from "@/app/api/stats/upload/types/log.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getGlobalStats(): Promise<StatsResponse> {
  const { data: players, error } = await supabase.from("players").select("player_name, id");
  if (error || !players || players.length === 0) return emptyResponse();

  const playerStatsPromises = players.map(async (player) => {
    const [k, d, h, c, g, kn, s] = await Promise.all([
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("attacker_id", player.id).eq("event_type", EventType.KILL),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("victim_id", player.id).eq("event_type", EventType.KILL),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("attacker_id", player.id).eq("event_type", EventType.KILL).eq("hit_loc", "head"),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("attacker_id", player.id).eq("event_type", EventType.KILL).eq("weapon", "claymore_mp"),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("attacker_id", player.id).eq("event_type", EventType.KILL).eq("weapon", "grenade_mp"),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("attacker_id", player.id).eq("event_type", EventType.KILL).eq("weapon", "knife_mp"),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("attacker_id", player.id).eq("event_type", EventType.KILL).eq("mod", "MOD_SUICIDE"),
    ]);

    const kills = k.count || 0;
    const deaths = d.count || 0;
    const ratio = deaths === 0 ? kills : parseFloat((kills / deaths).toFixed(2));

    return {
      player_id: player.id,
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

  const { data: events, error: eErr } = await supabase.from("matches_events").select("attacker_id").eq("session_id", latestSession.id).eq("event_type", EventType.KILL);
  if (eErr || !events) return emptyResponse();

  const playerIds = Array.from(new Set(events.map((e) => e.attacker_id).filter((id): id is string => id !== null)));
  if (playerIds.length === 0) return emptyResponse();

  const { data: playersData } = await supabase.from("players").select("player_name, id").in("id", playerIds);
  const playerMap = new Map(playersData?.map((p) => [p.id, p.player_name]));
  const playerIdMap = new Map(playersData?.map((p) => [p.id, p]));

  const playerStatsPromises = playerIds.map(async (id) => {
    const [k, d, h, c, g, kn, s] = await Promise.all([
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("session_id", latestSession.id).eq("event_type", EventType.KILL).eq("attacker_id", id),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("session_id", latestSession.id).eq("event_type", EventType.KILL).eq("victim_id", id),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("session_id", latestSession.id).eq("event_type", EventType.KILL).eq("attacker_id", id).eq("hit_loc", "head"),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("session_id", latestSession.id).eq("event_type", EventType.KILL).eq("attacker_id", id).eq("weapon", "claymore_mp"),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("session_id", latestSession.id).eq("event_type", EventType.KILL).eq("attacker_id", id).eq("weapon", "grenade_mp"),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("session_id", latestSession.id).eq("event_type", EventType.KILL).eq("attacker_id", id).eq("weapon", "knife_mp"),
      supabase.from("matches_events").select("id", { count: "exact", head: true }).eq("session_id", latestSession.id).eq("event_type", EventType.KILL).eq("attacker_id", id).eq("mod", "MOD_SUICIDE"),
    ]);

    const kills = k.count || 0;
    const deaths = d.count || 0;
    const ratio = deaths === 0 ? kills : parseFloat((kills / deaths).toFixed(2));

    return {
      player_id: playerIdMap.get(id)?.id || "Unknown",
      player_name: playerMap.get(id) || "Unknown",
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

export async function getPlayerDetails(playerId: string): Promise<PlayerDetailsResponse | null> {
  const { data: player, error: pErr } = await supabase
    .from("players")
    .select("player_name")
    .eq("id", playerId)
    .maybeSingle();

  if (pErr || !player) return null;

  const [offensiveResult, defensiveResult] = await Promise.all([
    supabase.from("matches_events").select("hit_loc, weapon, event_type").eq("attacker_id", playerId),
    supabase.from("matches_events").select("hit_loc, weapon, event_type").eq("victim_id", playerId)
  ]);

  const offensiveData = aggregateMatchEvents(offensiveResult.data || []);
  const defensiveData = aggregateMatchEvents(defensiveResult.data || []);

  return {
    player_name: player.player_name,
    offensive: offensiveData,
    defensive: defensiveData
  };
}
