import { File, Directory, Paths } from "expo-file-system";
import * as Crypto from "expo-crypto";

/**
 * Returns a permanent directory for a job's photos.
 * Structure: document/jobs/{jobId}/
 */
export function getJobPhotosDirectory(jobId: string): Directory {
  return new Directory(Paths.document, "jobs", jobId);
}

/**
 * Ensures the job photo directory exists.
 */
export async function ensureJobPhotoDir(jobId: string): Promise<Directory> {
  const dir = getJobPhotosDirectory(jobId);
  await dir.create({ intermediates: true, idempotent: true });
  return dir;
}

/**
 * Saves a photo (from camera temp uri) to permanent storage under the job folder.
 * Returns the permanent file:// URI.
 */
export async function savePhotoPermanently(
  jobId: string,
  sourceUri: string,
  subfolder?: string // e.g. "walls", "final", "before"
): Promise<string> {
  // Fast path for "no photo" cases (quick tally, optional photo in WallCaptureScreen, etc.)
  if (!sourceUri) {
    return "";
  }

  const jobDir = await ensureJobPhotoDir(jobId);

  let targetDir = jobDir;
  if (subfolder) {
    targetDir = new Directory(jobDir, subfolder);
    await targetDir.create({ intermediates: true, idempotent: true });
  }

  // Generate stable unique filename
  const ext = sourceUri.split(".").pop()?.split("?")[0] || "jpg";
  const random = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    sourceUri + Date.now().toString(),
    { encoding: Crypto.CryptoEncoding.HEX }
  );
  const fileName = `${random.slice(0, 16)}.${ext}`;

  const destFile = new File(targetDir, fileName);
  const sourceFile = new File(sourceUri);

  await sourceFile.copy(destFile);

  return destFile.uri; // permanent file:// URI
}

/**
 * Deletes an entire job's photo folder (used on job deletion).
 */
export async function deleteJobPhotos(jobId: string): Promise<void> {
  try {
    const dir = getJobPhotosDirectory(jobId);
    if (dir.exists) {
      await dir.delete();
    }
  } catch (e) {
    console.warn("Failed to delete some job photos (non-fatal):", e);
  }
}

/**
 * Helper to get a safe display name from a photo URI (for debugging).
 */
export function getPhotoFileName(uri: string): string {
  return uri.split("/").pop() || "photo.jpg";
}
