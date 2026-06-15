export interface FolderInfo {
  fileCount: number,
  processed: string[]
}

export interface FileInfo {
  name: string,
  ext: string,
  destination: string,
  originalPath: string
}

// One entry in history-log.json — represents one --sort run
// on a specific folder.
export interface HistoryEntry {
  folderName: string;   // e.g. "Downloads" — used as the lookup key
  folderPath: string;   // absolute path that was sorted
  timestamp: string;    // ISO date string, for display
  files: FileInfo[];    // same shape as before — used to undo
}

// The whole history-log.json file is a record of folderName -> entry
export type HistoryLog = Record<string, HistoryEntry>;

export const FILE_CATEGORIES: Record<string, string> = {
  // Images
  ".jpg":  "images",
  ".jpeg": "images",
  ".png":  "images",
  ".gif":  "images",
  ".svg":  "images",
  ".webp": "images",
  // Documents
  ".pdf":  "docs",
  ".doc":  "docs",
  ".docx": "docs",
  ".txt":  "docs",
  ".md":   "docs",
  ".xlsx": "docs",
  ".csv":  "docs",
  // Videos
  ".mp4":  "videos",
  ".mov":  "videos",
  ".avi":  "videos",
  ".mkv":  "videos",
  ".webm": "videos",
  // Audio
  ".mp3":  "audio",
  ".wav":  "audio",
  ".flac": "audio",
  ".ogg":  "audio",
  // Archives
  ".zip":  "archives",
  ".rar":  "archives",
  ".tar":  "archives",
  ".gz":   "archives",
  ".7z":   "archives",
  // Code
  ".js":   "code",
  ".ts":   "code",
  ".py":   "code",
  ".html": "code",
  ".css":  "code",
  ".json": "code",
};