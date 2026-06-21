// ─── Flag Map ────────────────────────────────────────────────────────────────

export interface FlagsMap {
  sort:    (folder: string) => void | Promise<void>;
  preview: (folder: string) => void | Promise<void>;
  undo:    (folder: string) => void | Promise<void>;
}

// ─── File & Folder ───────────────────────────────────────────────────────────

export interface FolderInfo {
  fileCount: number;
  processed: string[];
}

export interface FileInfo {
  name:         string;
  ext:          string;
  destination:  string;
  originalPath: string;
}

// ─── History ─────────────────────────────────────────────────────────────────

export interface HistoryEntry {
  folderName: string;
  folderPath: string;
  timestamp:  string;
  files:      FileInfo[];
}

export type HistoryLog = Record<string, HistoryEntry>;

// ─── Results ─────────────────────────────────────────────────────────────────

export interface OrganizeResult {
  moved:   number;
  skipped: number;
  folders: Set<string>;
}

// ─── Config ──────────────────────────────────────────────────────────────────

export interface SortifyConfig {
  /** Milliseconds to sleep between each file operation (for visual feedback). */
  stepDelayMs: number;
  /** Whether to skip files that already exist at the destination. */
  skipDuplicates: boolean;
  /** Category overrides — merged on top of FILE_CATEGORIES at runtime. */
  customCategories: Record<string, string>;
}

export const DEFAULT_CONFIG: SortifyConfig = {
  stepDelayMs:      18,
  skipDuplicates:   true,
  customCategories: {},
};

// ─── File Categories ─────────────────────────────────────────────────────────

export const FILE_CATEGORIES: Record<string, string> = {
  // Images
  '.jpg':  'images',
  '.jpeg': 'images',
  '.png':  'images',
  '.gif':  'images',
  '.svg':  'images',
  '.webp': 'images',
  '.ico':  'images',
  '.bmp':  'images',
  '.tiff': 'images',
  // Documents
  '.pdf':  'docs',
  '.doc':  'docs',
  '.docx': 'docs',
  '.txt':  'docs',
  '.md':   'docs',
  '.xlsx': 'docs',
  '.xls':  'docs',
  '.csv':  'docs',
  '.pptx': 'docs',
  '.ppt':  'docs',
  '.odt':  'docs',
  // Videos
  '.mp4':  'videos',
  '.mov':  'videos',
  '.avi':  'videos',
  '.mkv':  'videos',
  '.webm': 'videos',
  '.flv':  'videos',
  '.wmv':  'videos',
  // Audio
  '.mp3':  'audio',
  '.wav':  'audio',
  '.flac': 'audio',
  '.ogg':  'audio',
  '.aac':  'audio',
  '.m4a':  'audio',
  // Archives
  '.zip':  'archives',
  '.rar':  'archives',
  '.tar':  'archives',
  '.gz':   'archives',
  '.7z':   'archives',
  '.bz2':  'archives',
  // Code
  '.js':   'code',
  '.ts':   'code',
  '.py':   'code',
  '.html': 'code',
  '.css':  'code',
  '.json': 'code',
  '.jsx':  'code',
  '.tsx':  'code',
  '.sh':   'code',
  '.yaml': 'code',
  '.yml':  'code',
  '.toml': 'code',
  '.env':  'code',
  // Fonts
  '.ttf':  'fonts',
  '.otf':  'fonts',
  '.woff': 'fonts',
  '.woff2':'fonts',
};