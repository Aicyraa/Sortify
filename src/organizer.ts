import * as fs from "node:fs";
import * as path from "node:path";
import type { FileInfo, FolderInfo, HistoryEntry } from "./types.ts";
import { FILE_CATEGORIES } from "./types.ts";
import { saveHistoryEntry } from "./historyLog.ts";
import { scanFolder, processEntries } from "./helper.ts"

export default function organize(folderPath: string): void {

  if (!fs.existsSync(folderPath)) {
    console.log(`${folderPath} don't exist!`);
    process.exit(1);
  }

  const { fileCount, processed } = scanFolder(folderPath);

  if (fileCount === 0) {
    console.log("⚠️  No files found to organize.");
    return;
  }

  const fileObjects = processEntries(processed);
  moveFiles(fileObjects, folderPath);
  saveToHistory(folderPath, fileObjects);

  console.log(`\n✅ Done! ${fileCount} files organized.`);
}

function moveFiles(fileObjects: FileInfo[], folderPath: string): void {
  for (const file of fileObjects) {
    const folderDest = path.join(folderPath, file.destination);
    const fileDest = path.join(folderDest, file.name);

    fs.mkdirSync(folderDest, { recursive: true });
    fs.renameSync(file.originalPath, fileDest);

    console.log(`Moved ${file.originalPath} to ${folderDest}`);
  }
}

function saveToHistory(folderPath: string, fileObjects: FileInfo[]): void {
  const entry: HistoryEntry = {
    folderName: path.basename(folderPath),
    folderPath: folderPath,
    timestamp: new Date().toISOString(),
    files: fileObjects,
  };

  saveHistoryEntry(entry);
}
