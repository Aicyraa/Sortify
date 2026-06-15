import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";
import type { HistoryEntry } from "./types.ts";
import { readHistory, removeHistoryEntry } from "./historyLog.ts";
import {
  logHeader,
  logWarn,
  logError,
  logInfo,
  logDetail,
  logSummary,
  startSpinner,
  succeedSpinner,
} from "./logger.ts";

function ask(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// "_folder" is unused on purpose — undo works off history-log.json,
// not the folder the user is currently pointed at.
export default async function undo(_folder: string): Promise<void> {

  startSpinner("Reading history-log.json...");
  const history = readHistory();
  const folderNames = Object.keys(history);

  if (folderNames.length === 0) {
    logWarn("No history found — nothing to undo.");
    return;
  }

  succeedSpinner(`Found ${folderNames.length} folder(s) in history`);

  logInfo("\nFolders you can undo:\n");
  folderNames.forEach((name, i) => {
    const entry = history[name];
    const date = new Date(entry.timestamp).toLocaleString();
    logDetail(`[${i + 1}] ${name}  —  ${entry.files.length} files  —  sorted ${date}`);
  });
  console.log("");

  const answer = await ask("Enter the number of the folder to undo (or 'q' to cancel): ");

  if (answer.trim().toLowerCase() === "q") {
    logInfo("Cancelled.");
    return;
  }

  const index = parseInt(answer.trim(), 10) - 1;

  if (isNaN(index) || index < 0 || index >= folderNames.length) {
    logError("Invalid selection.");
    return;
  }

  const folderName = folderNames[index];
  const entry = history[folderName];

  undoEntry(entry);
  removeHistoryEntry(folderName);

  logSummary(`\nUndo complete! "${folderName}" restored.`);
}

function undoEntry(entry: HistoryEntry): void {
  const touchedFolders = new Set<string>();

  for (const file of entry.files) {
    const currentPath = path.join(entry.folderPath, file.destination, file.name);
    const restorePath = file.originalPath;

    if (!fs.existsSync(currentPath)) {
      logWarn(`Skipped (not found): ${file.destination}/${file.name}`);
      continue;
    }

    fs.renameSync(currentPath, restorePath);
    logDetail(`↩ ${file.destination}/${file.name}  →  ${path.basename(restorePath)}`);

    touchedFolders.add(path.join(entry.folderPath, file.destination));
  }

  for (const folder of touchedFolders) {
    removeIfEmpty(folder);
  }
}

function removeIfEmpty(folderPath: string): void {
  if (!fs.existsSync(folderPath)) return;

  const remaining = fs.readdirSync(folderPath);

  if (remaining.length === 0) {
    fs.rmdirSync(folderPath);
    logDetail(`Removed empty folder: ${path.basename(folderPath)}/`);
  } else {
    logDetail(`ℹ Kept ${path.basename(folderPath)}/ — not empty (${remaining.length} item(s) left)`);
  }
}