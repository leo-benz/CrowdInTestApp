/**
 * Types for working with the file system and translations
 */

/**
 * Record for a single translation string
 */
export interface TranslationRecord {
  text: string;
}

/**
 * Record for a single translation string
 */
export interface TranslationEntry {
  /** Unique identifier for the string */
  identifier: string;
  /** Context of string usage */
  context: string;
  /** Additional data for the string */
  customData: string;
  /** Preview ID */
  previewId: number;
  /** Labels for the string */
  labels: string[];
  /** Whether the string is hidden */
  isHidden: boolean;
  /** Original text */
  text: string;
  /** Translations for different languages */
  translations: Record<string, TranslationRecord>;
}

/**
 * Information about the file to process
 */
export interface FileInfo {
  /** Base64-encoded file content */
  content?: string;
  /** URL to download file content */
  contentUrl?: string;
  /** File name */
  name?: string;
}

/**
 * Language information
 */
export interface LanguageInfo {
  /** Language ID */
  id: string;
}

/**
 * Request to analyze a file
 */
export interface ParseFileRequest {
  /** File information */
  file: FileInfo;
  /** Target languages */
  targetLanguages: LanguageInfo[];
}

/**
 * Request to create a file
 */
export interface BuildFileRequest {
  /** File information */
  file: FileInfo;
  /** Target languages */
  targetLanguages: LanguageInfo[];
  /** Strings to translate */
  strings?: TranslationEntry[];
  /** URL to download strings */
  stringsUrl?: string;
}

/**
 * Structure of strings for preview
 */
export interface PreviewStrings {
  [key: string]: {
    text: string;
    id: number;
  };
}

/**
 * Type of request to the file processing API
 */
export interface ProcessRequestBody {
  /** Job type */
  jobType: 'parse-file' | 'build-file' | unknown;
  /** File information */
  file: FileInfo;
  /** Target languages */
  targetLanguages: LanguageInfo[];
  /** Strings to translate */
  strings?: TranslationEntry[];
  /** URL to download strings */
  stringsUrl?: string;
}
