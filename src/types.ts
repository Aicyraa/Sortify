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

export interface HistoryEntry {
  folderName: string
  folderPath: string;
  timestamp: string;
  files: FileInfo[];
}

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