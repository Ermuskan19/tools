import { saveBlob } from './download';

/** Trigger a browser download of one zip containing { name, data } entries. */
export async function downloadZip(entries, zipName = 'files.zip') {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  for (const entry of entries) {
    zip.file(entry.name, entry.data);
  }
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });
  saveBlob(blob, zipName);
}

/** Convert a data: URL into raw bytes without a round-trip through fetch. */
export function dataUrlToBytes(dataUrl) {
  const base64 = String(dataUrl).split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
