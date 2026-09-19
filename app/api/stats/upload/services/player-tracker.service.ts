import type { PlayerRecord } from '../types/log.types';

export class PlayerTrackerService {
  private playersMap = new Map<string, PlayerRecord>();

  track(name: string): void {
    if (!name) return;
    if (!this.playersMap.has(name)) {
      this.playersMap.set(name, {
        player_name: name,
        updated_at: new Date().toISOString(),
      });
    }
  }

  has(name: string): boolean {
    return this.playersMap.has(name);
  }

  get size(): number {
    return this.playersMap.size;
  }

  toArray(): PlayerRecord[] {
    return Array.from(this.playersMap.values());
  }

  getMap(): Map<string, PlayerRecord> {
    return this.playersMap;
  }

  names(): string[] {
    return Array.from(this.playersMap.keys());
  }
}
