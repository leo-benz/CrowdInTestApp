import { put, BlobAccessError } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

const MAX_SIZE_BYTES = 1024 * 1024; // 1MB for data response size

/**
 * Ensure that an RW token for Vercel Blob Storage is present before any upload
 * is attempted. Throws an `Error` when the token is missing so that the caller
 * can handle configuration issues gracefully.
 */
function validateBlobAccess(): void {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn(
      'BLOB_READ_WRITE_TOKEN is not set. Ensure Vercel Blob Storage is connected to the project.'
    );
    throw new Error('Vercel Blob access token is not configured.');
  }
}

/**
 * Checks if the content exceeds the maximum size for direct response
 * @param content The content to check
 * @returns True if exceeds max size
 */
export function exceedsMaxSize(content: string): boolean {
  return Buffer.byteLength(content, 'utf8') > MAX_SIZE_BYTES;
}

/**
 * Uploads content to blob storage and returns the URL
 * @param content The content to upload
 * @param path The path where to store the content
 * @param contentType The content type
 * @returns URL to access the uploaded content
 */
export async function uploadToBlob(
  content: string,
  path: string,
  contentType: string
): Promise<string> {
  validateBlobAccess();

  try {
    // Split the path to get directory and filename
    const lastSlashIndex = path.lastIndexOf('/');
    const basePathname = lastSlashIndex >= 0 ? path.substring(0, lastSlashIndex + 1) : '';
    const filename = lastSlashIndex >= 0 ? path.substring(lastSlashIndex + 1) : path;

    if (!filename) {
      throw new Error('Invalid path: filename cannot be empty');
    }

    const finalBasePath = basePathname || 'uploads/';
    const finalFilename = filename;

    // Ensure contentType is a valid string
    const validContentType = contentType || 'application/octet-stream';

    const blob = await put(finalBasePath + finalFilename, content, {
      access: 'public',
      contentType: validContentType,
      addRandomSuffix: true,
    });

    return blob.url;
  } catch (error) {
    console.error('Error uploading to blob:', error);

    if (error instanceof BlobAccessError) {
      throw new Error(`Blob access error: ${error.message}`);
    }

    throw new Error(
      `Failed to upload to blob storage: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Generates a unique filename without extension
 * @param fileName Original filename
 * @returns Base filename without extension
 */
export function generateUniqueFileName(fileName?: string): string {
  const safeFileName = fileName || `file_${uuidv4()}`;
  if (safeFileName.includes('.')) {
    const parts = safeFileName.split('.');
    return parts[0] || safeFileName;
  }
  return safeFileName;
}
