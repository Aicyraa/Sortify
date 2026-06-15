import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";
import type { FileInfo, HistoryEntry } from "./types.ts";
import { readHistory, removeHistoryEntry } from "./historyLog.ts";

// Wraps readline.question in a Promise so we can use async/await.
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

// Note: the "folder" argument from index.ts is ignored here on purpose —
// undo works off the history log, not the folder the user is currently in.
// Kept in the signature so index.ts doesn't need to change its call site.
export default async function undo(_folder: string): Promise<void> {
  const history = readHistory();
  const folderNames = Object.keys(history);

  // 1. Nothing to undo
  if (folderNames.length === 0) {
    console.log("⚠️  No history found — nothing to undo.");
    return;
  }

  // 2. Show the list of available folders
  console.log("\n📜 Folders you can undo:\n");
  folderNames.forEach((name, i) => {
    const entry = history[name];
    const date = new Date(entry.timestamp).toLocaleString();
    console.log(`  [${i + 1}] ${name}  —  ${entry.files.length} files  —  sorted ${date}`);
  });
  console.log("");

  // 3. Ask the user which one
  const answer = await ask("Enter the number of the folder to undo (or 'q' to cancel): ");

  if (answer.trim().toLowerCase() === "q") {
    console.log("Cancelled.");
    return;
  }

  const index = parseInt(answer.trim(), 10) - 1;

  if (isNaN(index) || index < 0 || index >= folderNames.length) {
    console.log("❌ Invalid selection.");
    return;
  }

  const folderName = folderNames[index];
  const entry = history[folderName];

  undoEntry(entry);
  removeHistoryEntry(folderName);

  console.log(`\n✅ Undo complete! "${folderName}" restored.`);
}

// Moves every file in this entry back to its original location,
// then removes any category folders left empty afterward.
function undoEntry(entry: HistoryEntry): void {
  const touchedFolders = new Set<string>();

  for (const file of entry.files) {
    const currentPath = path.join(entry.folderPath, file.destination, file.name);
    const restorePath = file.originalPath;

    if (!fs.existsSync(currentPath)) {
      console.log(`  ⚠️  Skipped (not found): ${file.destination}/${file.name}`);
      continue;
    }

    fs.renameSync(currentPath, restorePath);
    console.log(`  ↩ ${file.destination}/${file.name}  →  ${path.basename(restorePath)}`);

    touchedFolders.add(path.join(entry.folderPath, file.destination));
  }

  for (const folder of touchedFolders) {
    removeIfEmpty(folder);
  }
}

// Deletes a category folder (e.g. "images/") only if nothing is left
// inside it — protects any files the user manually added afterward.
function removeIfEmpty(folderPath: string): void {
  if (!fs.existsSync(folderPath)) return;

  const remaining = fs.readdirSync(folderPath);

  if (remaining.length === 0) {
    fs.rmdirSync(folderPath);
    console.log(`  🗑  Removed empty folder: ${path.basename(folderPath)}/`);
  } else {
    console.log(`  ℹ️  Kept ${path.basename(folderPath)}/ — not empty (${remaining.length} item(s) left)`);
  }
}