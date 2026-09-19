import { parseLine, MIN_PARTS_J, MIN_PARTS_K, MIN_PARTS_D } from '../utils/log-parser';
import { buildKEvent, buildDEvent, isWorldEvent } from '../utils/event-builder';
import type { MatchEventInsert } from '../types/log.types';
import type { PlayerTrackerService } from './player-tracker.service';

export class LogImportService {
  constructor(private tracker: PlayerTrackerService) {}

  collectNames(text: string): void {
    const lines = text.split(/\r?\n/);
    for (const rawLine of lines) {
      const parsed = parseLine(rawLine);
      if (!parsed) continue;
      const { type, parts } = parsed;
      if (type === 'J' && parts.length >= MIN_PARTS_J) {
        this.tracker.track(parts[2]);
      } else if (type === 'K' && parts.length >= MIN_PARTS_K) {
        this.tracker.track(parts[3]);
        this.tracker.track(parts[7]);
      } else if (type === 'D' && parts.length >= MIN_PARTS_D) {
        this.tracker.track(parts[3]);
        const attackerName = parts[7];
        const method = parts[10];
        if (!isWorldEvent(attackerName, method)) {
          this.tracker.track(attackerName);
        }
      }
    }
  }

  buildEvents(text: string, sessionId: string, idByName: Map<string, string>): MatchEventInsert[] {
    const lines = text.split(/\r?\n/);
    const events: MatchEventInsert[] = [];
    for (const rawLine of lines) {
      const parsed = parseLine(rawLine);
      if (!parsed) continue;
      const { type, parts } = parsed;
      if (type === 'K' && parts.length >= MIN_PARTS_K) {
        events.push(buildKEvent(parts, sessionId, idByName));
      } else if (type === 'D' && parts.length >= MIN_PARTS_D) {
        events.push(buildDEvent(parts, sessionId, idByName));
      }
    }
    return events;
  }
}
