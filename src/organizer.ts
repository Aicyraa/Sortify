import * as fs   from 'node:fs';
import * as path from 'node:path';
import type { FileInfo, FolderInfo, HistoryEntry, OrganizeResult, SortifyConfig } from './types.ts';
import { FILE_CATEGORIES, DEFAULT_CONFIG } from './types.ts';
import { saveHistoryEntry } from './historyLog.ts';
import {
  startSpinner,
  succeedSpinner,
  failSpinner,
  logWarn,
  logInfo,
  logDetail,
  logSummary,
  logDivider,
  logHeader,
  withProgressBar,
} from './logger.ts';

// ─── Organize ────────────────────────────────────────────────────────────────

export async function organize(
  folderPath: string,
  config: SortifyConfig = DEFAULT_CONFIG,
): Promise<void> {
  assertFolderExists(folderPath);

  startSpinner('Scanning folder...');
  const { fileCount, processed } = scanFolder(folderPath);

  if (fileCount === 0) {
    failSpinner('No files found to organize.');
    return;
  }

  succeedSpinner(`Found ${fileCount} file(s) — starting sort`);

  const fileObjects = processEntries(processed, config);
  const result      = await moveFiles(fileObjects, folderPath, config);

  saveToHistory(folderPath, fileObjects);
  printSummary(result);
}

// ─── Preview (dry-run) ───────────────────────────────────────────────────────

export function preview(
  folderPath: string,
  config: SortifyConfig = DEFAULT_CONFIG,
): void {
  assertFolderExists(folderPath);

  startSpinner('Scanning folder...');
  const { fileCount, processed } = scanFolder(folderPath);

  if (fileCount === 0) {
    failSpinner('No files found.');
    return;
  }

  succeedSpinner(`Found ${fileCount} file(s)`);

  const fileObjects = processEntries(processed, config);
  const categoryMap = groupByDestination(fileObjects);

  console.log('');
  logHeader('  Preview — no files will be moved');
  logDivider();

  for (const [category, files] of Object.entries(categoryMap)) {
    logInfo(`${category}/  (${files.length} file(s))`);
    for (const file of files) {
      logDetail(`${file.name}`);
    }
  }

  logDivider();
  logInfo(`${fileCount} file(s) would be moved. Run with --sort to apply.\n`);
}

// ─── File Operations ─────────────────────────────────────────────────────────

async function moveFiles(
  fileObjects:  FileInfo[],
  folderPath:   string,
  config:       SortifyConfig,
): Promise<OrganizeResult> {
  const result: OrganizeResult = {
    moved:   0,
    skipped: 0,
    folders: new Set<string>(),
  };

  console.log('');

  await withProgressBar(fileObjects, 'Organizing', config.stepDelayMs, (file) => {
    const folderDest = path.join(folderPath, file.destination);
    const fileDest   = path.join(folderDest, file.name);

    fs.mkdirSync(folderDest, { recursive: true });

    if (config.skipDuplicates && fs.existsSync(fileDest)) {
      result.skipped++;
      return;
    }

    fs.renameSync(file.originalPath, fileDest);
    result.moved++;
    result.folders.add(file.destination);
  });

  console.log('');
  logDivider();

  for (const file of fileObjects) {
    logDetail(`${file.name}  ->  ${file.destination}/`);
  }

  logDivider();

  return result;
}

// ─── Scan & Process ──────────────────────────────────────────────────────────

function scanFolder(folderPath: string): FolderInfo {
  const entries   = fs.readdirSync(folderPath);
  const processed = entries
    .filter(entry => fs.statSync(path.join(folderPath, entry)).isFile())
    .map(entry => path.join(folderPath, entry));

  return { fileCount: processed.length, processed };
}

function processEntries(entries: string[], config: SortifyConfig): FileInfo[] {
  const categories = { ...FILE_CATEGORIES, ...config.customCategories };

  return entries.map(entry => {
    const ext = path.extname(entry).toLowerCase();
    return {
      name:         path.basename(entry),
      ext,
      destination:  categories[ext] ?? 'others',
      originalPath: entry,
    };
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function groupByDestination(files: FileInfo[]): Record<string, FileInfo[]> {
  return files.reduce<Record<string, FileInfo[]>>((acc, file) => {
    const key = file.destination;
    if (!acc[key]) acc[key] = [];
    acc[key]!.push(file);
    return acc;
  }, {});
}

function saveToHistory(folderPath: string, fileObjects: FileInfo[]): void {
  const entry: HistoryEntry = {
    folderName: path.basename(folderPath),
    folderPath,
    timestamp:  new Date().toISOString(),
    files:      fileObjects,
  };
  saveHistoryEntry(entry);
}

function printSummary(result: OrganizeResult): void {
  const parts: string[] = [`${result.moved} moved`];
  if (result.skipped > 0) parts.push(`${result.skipped} skipped (duplicate)`);

  logSummary(`Done! ${parts.join(', ')} across ${result.folders.size} folder(s).\n`);
}

function assertFolderExists(folderPath: string): void {
  if (!fs.existsSync(folderPath)) {
    failSpinner(`Folder not found: ${folderPath}`);
    process.exit(1);
  }
}