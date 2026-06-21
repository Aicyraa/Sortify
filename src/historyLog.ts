import * as fs   from 'node:fs';
import * as path from 'node:path';
import type { HistoryLog, HistoryEntry } from './types.ts';

// ─── Constants ────────────────────────────────────────────────────────────────

const HISTORY_PATH = path.join(process.cwd(), 'history-log.json');

// ─── Read / Write ─────────────────────────────────────────────────────────────

export function readHistory(): HistoryLog {
  if (!fs.existsSync(HISTORY_PATH)) return {};

  const raw = fs.readFileSync(HISTORY_PATH, 'utf-8');

  try {
    return JSON.parse(raw) as HistoryLog;
  } catch {
    return {};
  }
}

export function writeHistory(history: HistoryLog): void {
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
}

// ─── Entry Management ─────────────────────────────────────────────────────────

export function saveHistoryEntry(entry: HistoryEntry): void {
  const history = readHistory();
  history[entry.folderName] = entry;
  writeHistory(history);
}

export function removeHistoryEntry(folderName: string): void {
  const history = readHistory();
  delete history[folderName];
  writeHistory(history);
}