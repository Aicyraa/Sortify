import * as fs       from 'node:fs';
import * as path     from 'node:path';
import * as readline from 'node:readline';
import type { HistoryEntry } from './types.ts';
import { readHistory, removeHistoryEntry } from './historyLog.ts';
import { DEFAULT_CONFIG } from './types.ts';
import {
  logWarn,
  logError,
  logInfo,
  logDetail,
  logSummary,
  logDivider,
  logHeader,
  startSpinner,
  succeedSpinner,
  withProgressBar,
} from './logger.ts';

// ─── Prompt Helper ────────────────────────────────────────────────────────────

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input:  process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

// ─── Undo ─────────────────────────────────────────────────────────────────────

export default async function undo(_folder: string): Promise<void> {
  startSpinner('Reading history-log.json...');
  const history     = readHistory();
  const folderNames = Object.keys(history);

  if (folderNames.length === 0) {
    logWarn('No history found — nothing to undo.');
    return;
  }

  succeedSpinner(`Found ${folderNames.length} folder(s) in history`);

  console.log('');
  logHeader('  Sortify — Undo');
  logDivider();

  folderNames.forEach((name, i) => {
    const entry = history[name];
    if (!entry) return;
    const date = new Date(entry.timestamp).toLocaleString();
    logInfo(`[${i + 1}] ${name}`);
    logDetail(`${entry.files.length} file(s)  |  sorted on ${date}`);
  });

  logDivider();
  console.log('');

  const answer = await ask('[?] Enter number to undo (or q to cancel): ');

  if (answer.trim().toLowerCase() === 'q') {
    logInfo('Cancelled.');
    return;
  }

  const index = parseInt(answer.trim(), 10) - 1;

  if (isNaN(index) || index < 0 || index >= folderNames.length) {
    logError('Invalid selection.');
    return;
  }

  const folderName: string = folderNames[index] || '';
  const entry = history[folderName];

  if (!entry) {
    logError('History entry not found.');
    return;
  }

  console.log('');
  await undoEntry(entry);
  removeHistoryEntry(folderName);

  logSummary(`\nUndo complete! "${folderName}" restored.\n`);
}

// ─── Undo Entry ───────────────────────────────────────────────────────────────

async function undoEntry(entry: HistoryEntry): Promise<void> {
  const touchedFolders = new Set<string>();
  const restorable     = entry.files.filter(file =>
    fs.existsSync(path.join(entry.folderPath, file.destination, file.name)),
  );
  const skipped        = entry.files.length - restorable.length;

  if (skipped > 0) {
    logWarn(`${skipped} file(s) not found — will be skipped`);
    console.log('');
  }

  await withProgressBar(restorable, 'Restoring ', DEFAULT_CONFIG.stepDelayMs, file => {
    const currentPath = path.join(entry.folderPath, file.destination, file.name);
    const restorePath = file.originalPath;

    fs.renameSync(currentPath, restorePath);
    touchedFolders.add(path.join(entry.folderPath, file.destination));
  });

  console.log('');
  logDivider();

  for (const file of restorable) {
    logDetail(`${file.destination}/${file.name}  <-  ${path.basename(file.originalPath)}`);
  }

  logDivider();
  console.log('');

  for (const folder of touchedFolders) {
    removeIfEmpty(folder);
  }
}

// ─── Cleanup ──────────────────────────────────────────────────────────────────

function removeIfEmpty(folderPath: string): void {
  if (!fs.existsSync(folderPath)) return;

  const remaining = fs.readdirSync(folderPath);

  if (remaining.length === 0) {
    fs.rmdirSync(folderPath);
    logDetail(`Removed empty folder: ${path.basename(folderPath)}/`);
  } else {
    logDetail(`Kept ${path.basename(folderPath)}/ — ${remaining.length} item(s) remaining`);
  }
}