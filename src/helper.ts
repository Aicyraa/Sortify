import * as path from "node:path";
import * as fs from "node:fs";
import type { FileInfo, FolderInfo } from "./types.ts";
import { FILE_CATEGORIES } from "./types.ts";

export function processEntries(entries: string[]): FileInfo[] {
  return entries.map((entry) => ({
    name: path.basename(entry),
    ext: path.extname(entry),
    destination: getDestination(path.extname(entry).toLowerCase()),
    originalPath: entry,
  }));
}

export function scanFolder(folderPath: string): FolderInfo {
  const entries = fs.readdirSync(folderPath);

  const processed = entries
    .filter((entry) => fs.statSync(path.join(folderPath, entry)).isFile())
    .map((entry) => path.join(folderPath, entry));

  console.log("Scan successful");

  return {
    fileCount: processed.length,
    processed: processed,
  };
}

 function getDestination(ext: string): string {
  return FILE_CATEGORIES[ext] ?? "others";
}