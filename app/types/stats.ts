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

export interface HitZones {
    head: number;
    neck: number;
    torso_upper: number;
    torso_lower: number;
    right_arm_upper: number;
    right_arm_lower: number;
    right_hand: number;
    left_arm_upper: number;
    left_arm_lower: number;
    left_hand: number;
    right_leg_upper: number;
    right_leg_lower: number;
    right_foot: number;
    left_leg_upper: number;
    left_leg_lower: number;
    left_foot: number;
}

export interface WeaponStat {
    weapon_name: string;
    count: number;
}

export interface PlayerDetailsResponse {
    player_name: string;
    offensive: {
        hit_zones: HitZones;
        top_weapons: WeaponStat[];
    };
    defensive: {
        hit_zones: HitZones;
        top_weapons: WeaponStat[];
    };
}