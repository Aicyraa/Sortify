import * as fs from "node:fs";
import { processEntries, scanFolder } from "./helper.ts";
import {
  logHeader,
  logWarn,
  logInfo,
  logDetail,
  failSpinner,
  startSpinner,
} from "./logger.ts";

export default function dryRun(folderPath: string): void {
  logWarn("DRY RUN MODE — no files will be moved\n");

  if (!fs.existsSync(folderPath)) {
    failSpinner(`Folder not found: ${folderPath}`);
    process.exit(1);
  }

  startSpinner("Scanning files...");

  const { fileCount, processed } = scanFolder(folderPath);
  // scanFolder already prints success via the spinner

  if (fileCount === 0) {
    logWarn("No files found.");
    return;
  }

  const fileObjects = processEntries(processed);

  console.log("");
  for (const file of fileObjects) {
    logDetail(`${file.name}  →  ${file.destination}/`);
  }

  logInfo(`\n${fileCount} file(s) would be moved. Run without --dry-run to apply.\n`);
}