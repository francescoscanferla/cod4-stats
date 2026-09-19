export type PlayerRecord = {
  id?: string;
  player_name: string;
  updated_at: string;
};

export enum EventType {
  KILL = 'KILL',
  DAMAGE = 'DAMAGE',
}

export type MatchEventInsert = {
  session_id: string;
  attacker_id: string | null;
  victim_id: string | null;
  weapon: string;
  damage: number;
  mod: string;
  hit_loc: string;
  event_type: EventType;
};

export type ParsedLogResult = {
  players: PlayerRecord[];
  events: MatchEventInsert[];
};

export type LineType = 'J' | 'K' | 'D';
