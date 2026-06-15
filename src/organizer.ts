import * as fs from "node:fs";
import * as path from "node:path";
import type { FileInfo, FolderInfo } from "./types.ts";
import { FILE_CATEGORIES } from "./types.ts";
import { processEntries, scanFolder } from "./helper.ts"

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
    "./src/history-log.json",
    JSON.stringify(fileObjects, null, 2)
  );
  console.log("  📄 Log saved → tanggap-log.json");
}

