import * as fs from "node:fs";
import * as path from "node:path";
import type { FileInfo, FolderInfo } from "./types.ts";
import { FILE_CATEGORIES } from "./types.ts";

export default function organize(folderPath: string): void {

  if (!fs.existsSync(folderPath)) {
    console.log(`${folderPath} don't exist!`);
    process.exit(1);
  }

  const { fileCount, processed } = scanFolder(folderPath);
  const fileObjects = processEntries(processed);
  moveFiles(fileObjects, folderPath);
  saveLog(fileObjects);
}

function scanFolder(folderPath: string): FolderInfo {
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

function processEntries(entries: string[]): FileInfo[] {
  return entries.map((entry) => ({
    name: path.basename(entry),
    ext: path.extname(entry),
    destination: getDestination(path.extname(entry).toLowerCase()),
    originalPath: entry,
  }));
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

function saveLog(fileObjects: FileInfo[]): void {
  fs.writeFileSync(
    "tanggap-log.json",
    JSON.stringify(fileObjects, null, 2)
  );
  console.log("  📄 Log saved → tanggap-log.json");
}

// HELPER

function getDestination(ext: string): string {
  return FILE_CATEGORIES[ext] ?? "others";
}