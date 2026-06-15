import * as fs from "node:fs";
import * as path from "node:path";
import { SingleBar, Presets } from "cli-progress";
import type { FileInfo, HistoryEntry } from "./types.ts";
import { saveHistoryEntry } from "./historyLog.ts";
import { scanFolder, processEntries } from "./helper.ts";
import {
  logHeader,
  logError,
  logWarn,
  logSummary,
  logDetail,
  startSpinner,
  failSpinner,
} from "./logger.ts";

export default function organize(folderPath: string): void {

  if (!fs.existsSync(folderPath)) {
    failSpinner(`Folder not found: ${folderPath}`);
    process.exit(1);
  }

  startSpinner("Scanning files...");

  const { fileCount, processed } = scanFolder(folderPath);

  if (fileCount === 0) {
    logWarn("No files found to organize.");
    return;
  }

  const fileObjects = processEntries(processed);
  moveFiles(fileObjects, folderPath);
  saveToHistory(folderPath, fileObjects);

  logSummary(`\nDone! ${fileCount} file(s) organized.`);
}

function moveFiles(fileObjects: FileInfo[], folderPath: string): void {
  const bar = new SingleBar(
    {
      format: "Organizing |{bar}| {percentage}% | {value}/{total} files",
    },
    Presets.shades_classic
  );

  bar.start(fileObjects.length, 0);

  for (const file of fileObjects) {
    const folderDest = path.join(folderPath, file.destination);
    const fileDest = path.join(folderDest, file.name);

    fs.mkdirSync(folderDest, { recursive: true });
    fs.renameSync(file.originalPath, fileDest);

    bar.increment();
  }

  bar.stop();

  for (const file of fileObjects) {
    logDetail(`${file.name}  →  ${file.destination}/`);
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
