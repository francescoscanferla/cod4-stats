export const LINE_RE = /^\s*\d+:\d+\s+([A-Z]);(.+)$/i;

export type ParsedLine = {
  type: string;
  parts: string[];
} | null;

export const parseLine = (rawLine: string): ParsedLine => {
  const line = rawLine.trim();
  if (!line) return null;

  const match = line.match(LINE_RE);
  if (!match) return null;

  const type = match[1].toUpperCase();
  const dataStr = match[2];
  const parts = dataStr.split(';');
  return { type, parts };
};

export const MIN_PARTS_J = 3;
export const MIN_PARTS_K = 12;
export const MIN_PARTS_D = 12;
