import 'server-only';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { put } from '@vercel/blob';

export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'data', 'uploads');
const MAX = 4 * 1024 * 1024; // Vercel rejects request bodies over 4.5 MB

/** Detect the real image type from the file's first bytes; the browser-sent type and name are not trusted. */
export function sniffImage(b: Buffer): 'jpg' | 'png' | 'webp' | 'gif' | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP') return 'webp';
  if (b.subarray(0, 4).toString('ascii') === 'GIF8') return 'gif';
  return null;
}

/** Saves an uploaded image and returns its public path, or null if no file was sent. Throws on invalid files. */
export async function saveImage(file: FormDataEntryValue | null): Promise<string | null> {
  if (!file || typeof file === 'string' || file.size === 0) return null;
  if (file.size > MAX) throw new Error('Image is larger than 4 MB. Please use a smaller photo.');
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniffImage(buf);
  if (!ext) throw new Error('Only JPG, PNG, WebP or GIF images are allowed.');
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
  // On Vercel the disk is temporary, so uploads go to the linked Blob store; locally they stay in data/uploads.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`uploads/${name}`, buf, { access: 'public', contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`, addRandomSuffix: false });
    return blob.url;
  }
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), buf);
  return `/uploads/${name}`;
}
