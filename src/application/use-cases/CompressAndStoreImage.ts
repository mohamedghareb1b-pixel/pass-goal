import sharp from "sharp";

export interface ImageStorage {
  upload(path: string, buffer: Buffer, contentType: string): Promise<{ url: string }>;
}

/**
 * Every image uploaded from the admin (article images, crests, etc.) is
 * converted to WebP and compressed before it reaches final storage.
 * This is treated as a mandatory step in the upload path, not optional
 * post-processing (see project brief section 12).
 */
export async function compressAndStoreImage(
  input: Buffer,
  destPath: string,
  storage: ImageStorage,
  opts: { maxWidth?: number; quality?: number } = {}
): Promise<{ url: string }> {
  const { maxWidth = 1600, quality = 78 } = opts;

  const webpBuffer = await sharp(input)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality })
    .toBuffer();

  const webpPath = destPath.replace(/\.[a-zA-Z0-9]+$/, "") + ".webp";
  return storage.upload(webpPath, webpBuffer, "image/webp");
}
