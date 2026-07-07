import { createClient } from "@supabase/supabase-js";
import { StatsResponse, PlayerDetailsResponse } from "@/app/types/stats";
import { emptyResponse, calculateAwards, aggregateMatchEvents } from "@/app/utils/stats-helpers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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

export async function getPlayerDetails(playerGuid: string): Promise<PlayerDetailsResponse | null> {
  const { data: player, error: pErr } = await supabase
    .from("players")
    .select("player_name")
    .eq("guid", playerGuid)
    .maybeSingle();

  if (pErr || !player) return null;

  const [offensiveResult, defensiveResult] = await Promise.all([
    supabase.from("matches_events").select("hit_loc, weapon").eq("attacker_guid", playerGuid),
    supabase.from("matches_events").select("hit_loc, weapon").eq("victim_guid", playerGuid)
  ]);

  const offensiveData = aggregateMatchEvents(offensiveResult.data || []);
  const defensiveData = aggregateMatchEvents(defensiveResult.data || []);

  return {
    player_name: player.player_name,
    offensive: offensiveData,
    defensive: defensiveData
  };
}