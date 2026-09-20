import { EventType } from '../types/log.types';
import type { MatchEventInsert } from '../types/log.types';

export const isWorldEvent = (attackerName: string, methodOrMod: string): boolean =>
  attackerName === 'world' || methodOrMod === 'MOD_FALLING';

export const buildKEvent = (
  parts: string[],
  sessionId: string,
  idByName: Map<string, string>
): MatchEventInsert => {
  const victimName = parts[3];
  const attackerName = parts[7];
  const weapon = parts[8];
  const damage = parseInt(parts[9], 10) || 0;
  const mod = parts[10];
  const hitLoc = parts[11];

  const isWorld = isWorldEvent(attackerName, mod) || isWorldEvent(victimName, mod);

  if (isWorld) {
    const isAttackerWorld = !attackerName || attackerName === 'world';
    const isVictimWorld = !victimName || victimName === 'world';
    let playerName: string | null = null;
    if (!isAttackerWorld && isVictimWorld) playerName = attackerName;
    else if (isAttackerWorld && !isVictimWorld) playerName = victimName;
    else if (!isAttackerWorld) playerName = attackerName;
    else playerName = victimName;

    return {
      session_id: sessionId,
      attacker_id: null,
      victim_id: playerName ? (idByName.get(playerName) ?? null) : null,
      weapon,
      damage,
      mod,
      hit_loc: hitLoc,
      event_type: EventType.KILL,
    };
  }

  return {
    session_id: sessionId,
    attacker_id: idByName.get(attackerName) ?? null,
    victim_id: idByName.get(victimName) ?? null,
    weapon,
    damage,
    mod,
    hit_loc: hitLoc,
    event_type: EventType.KILL,
  };
};

export const buildDEvent = (
  parts: string[],
  sessionId: string,
  idByName: Map<string, string>
): MatchEventInsert => {
  const victimName = parts[3];
  const attackerName = parts[7];
  const weapon = parts[8];
  const damage = parseInt(parts[9], 10) || 0;
  const method = parts[10];
  const hitLoc = parts[11];

  const isWorld = isWorldEvent(attackerName, method);

  return {
    session_id: sessionId,
    attacker_id: isWorld ? null : (idByName.get(attackerName) ?? null),
    victim_id: idByName.get(victimName) ?? null,
    weapon,
    damage,
    mod: method,
    hit_loc: hitLoc,
    event_type: EventType.DAMAGE,
  };
};
