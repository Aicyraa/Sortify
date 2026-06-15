import * as fs from "node:fs";
import { processEntries , scanFolder } from "./helper.ts"

export default function dryRun(folderPath: string): void {
  
  if (!fs.existsSync(folderPath)) {
    console.log("FFolder does not exist!")
    process.exit(1)
  }
  
  const { fileCount, processed } = scanFolder(folderPath);
  const fileObjects = processEntries(processed);
  
  console.log("DryRun success", fileCount)

}